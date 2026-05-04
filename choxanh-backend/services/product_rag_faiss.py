from __future__ import annotations
from typing import List, Dict, Any, Optional
import os
import json

import numpy as np
import faiss
from sentence_transformers import SentenceTransformer


class ProductRAG:
    """
    RAG trên products (Mongo) bằng SentenceTransformer + FAISS (IndexFlatIP).
    - reindex_products(products): build index từ products
    - search(query, top_k): trả về list product dict có score
    - tự load index/meta nếu đã tồn tại trong ./rag_store
    """

    def __init__(self, data_dir: str = "./rag_store"):
        self.data_dir = data_dir
        os.makedirs(self.data_dir, exist_ok=True)

        self.embedder = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

        self.index_path = os.path.join(self.data_dir, "products.index")
        self.meta_path = os.path.join(self.data_dir, "products_meta.json")

        self.index: Optional[faiss.Index] = None
        self.metas: List[Dict[str, Any]] = []  # 1-1 với vector trong index

        self._try_load()

    # Index persistence (load/save)
    def _try_load(self) -> None:
        if os.path.exists(self.index_path) and os.path.exists(self.meta_path):
            try:
                self.index = faiss.read_index(self.index_path)
                with open(self.meta_path, "r", encoding="utf-8") as f:
                    payload = json.load(f)
                    self.metas = payload.get("metas", [])
            except Exception:
                # nếu file hỏng thì bỏ qua, chờ reindex
                self.index = None
                self.metas = []

    def _save(self) -> None:
        if self.index is None:
            return
        faiss.write_index(self.index, self.index_path)
        with open(self.meta_path, "w", encoding="utf-8") as f:
            json.dump({"metas": self.metas}, f, ensure_ascii=False)

    # Document builder (cho mỗi product)
    def _product_to_doc(self, p: Dict[str, Any]) -> str:
        # lấy các field bạn đang có trong products.json/mongo
        name = p.get("name", "")
        category = p.get("category", "")
        origin = p.get("origin", "")
        usage = p.get("usage", "")
        note = p.get("note", "")
        # doc càng giàu text càng dễ match món ăn
        return (
            f"Sản phẩm: {name}\n"
            f"Nhóm hàng: {category}\n"
            f"Xuất xứ: {origin}\n"
            f"Cách dùng: {usage}\n"
            f"Ghi chú: {note}\n"
            f"Từ khoá: nguyên liệu nấu ăn, thực phẩm, chợ xanh, món ăn, nấu canh, kho, xào, chiên, hấp"
        )

    # Reindex (xây lại index từ list products mới, gọi sau khi có update/delete/add product)
    def reindex_products(self, products: List[Dict[str, Any]]) -> int:
        docs: List[str] = []
        metas: List[Dict[str, Any]] = []

        for p in products:
            doc = self._product_to_doc(p)
            docs.append(doc)

            metas.append(
                {
                    "product_id": str(p.get("_id")),
                    "name": p.get("name"),
                    "price": p.get("price"),
                    "image": p.get("image"),
                    "category": p.get("category"),
                }
            )

        embeddings = self.embedder.encode(docs, normalize_embeddings=True)
        embeddings = np.array(embeddings, dtype="float32")

        d = embeddings.shape[1]
        index = faiss.IndexFlatIP(d)
        index.add(embeddings)

        self.index = index
        self.metas = metas
        self._save()
        return len(products)

    # HINTS (dùng để cải thiện truy vấn search, không phải lúc nào cũng có)
    def _dish_hints(self, dish: str) -> List[str]:
        """
        Không có recipes DB thì mình dùng hint keywords để kéo đúng nguyên liệu trong products.
        Bạn có thể mở rộng dần list này.
        """
        q = dish.lower().strip()

        rules = [
            (["canh trứng", "trứng canh", "canh"], ["trứng", "hành", "cà chua", "rau", "gia vị", "muối", "hạt nêm"]),
            (["canh chua"], ["cà chua", "rau", "hành", "gia vị", "muối"]),
            (["thịt kho", "kho tàu"], ["thịt", "trứng", "tỏi", "hành", "nước mắm", "đường", "tiêu", "nước màu"]),
            (["trứng chiên", "ốp la"], ["trứng", "hành", "muối", "tiêu"]),
            (["xào"], ["tỏi", "hành", "dầu ăn", "muối", "hạt nêm"]),
            (["lẩu"], ["rau", "nấm", "gia vị"]),
            (["salad", "xà lách"], ["rau xà lách", "rau thơm"]),
        ]

        hints: List[str] = []
        for keys, kws in rules:
            if any(k in q for k in keys):
                hints.extend(kws)

        # loại bỏ trùng lặp và giữ nguyên thứ tự
        seen = set()
        out = []
        for h in hints:
            if h not in seen:
                seen.add(h)
                out.append(h)
        return out

    # Search với query tự nhiên, trả về list sản phẩm có score (dùng cho gợi ý nguyên liệu khi biết tên món)
    def search(self, query: str, top_k: int = 8) -> List[Dict[str, Any]]:
        if self.index is None or not self.metas:
            return []

        top_k = max(1, min(int(top_k), 50))

        q_emb = self.embedder.encode([query], normalize_embeddings=True)
        q_emb = np.array(q_emb, dtype="float32")

        scores, idxs = self.index.search(q_emb, top_k)

        results: List[Dict[str, Any]] = []
        for i, score in zip(idxs[0], scores[0]):
            if i < 0 or i >= len(self.metas):
                continue
            meta = self.metas[i]
            results.append(
                {
                    "product_id": meta.get("product_id"),
                    "name": meta.get("name"),
                    "price": meta.get("price"),
                    "image": meta.get("image"),
                    "category": meta.get("category"),
                    "score": float(score),
                }
            )
        return results

    def suggest_ingredients(self, dish_query: str, top_k: int = 8) -> List[Dict[str, Any]]:
        """
        Dùng dish_query + hints để search tốt hơn.
        """
        hints = self._dish_hints(dish_query)
        if hints:
            query = f"Món: {dish_query}. Nguyên liệu cần mua: {', '.join(hints)}."
        else:
            query = f"Món: {dish_query}. Nguyên liệu cần mua để nấu món này."
        return self.search(query=query, top_k=top_k)