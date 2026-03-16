from __future__ import annotations
from typing import List, Dict, Any, Optional
import os
import json
import numpy as np
import faiss


class RecipeRAG:
    def __init__(self, data_dir: str = "./rag_store"):
        self.data_dir = data_dir
        os.makedirs(self.data_dir, exist_ok=True)

        self.ids: List[str] = []
        self.index: Optional[faiss.Index] = None

        self.meta_path = os.path.join(self.data_dir, "recipes_meta.json")
        self.index_path = os.path.join(self.data_dir, "recipes.index")

        self._embedder = None
        self._load_index_if_exists()

    def _get_embedder(self):
        if self._embedder is None:
            from sentence_transformers import SentenceTransformer
            self._embedder = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
        return self._embedder

    def _load_index_if_exists(self):
        if os.path.exists(self.index_path) and os.path.exists(self.meta_path):
            try:
                self.index = faiss.read_index(self.index_path)
                with open(self.meta_path, "r", encoding="utf-8") as f:
                    meta = json.load(f)
                self.ids = meta.get("ids", [])
            except Exception:
                self.index = None
                self.ids = []

    def _recipe_to_doc(self, r: Dict[str, Any]) -> str:
        ingredient_text = ", ".join([
            f'{i.get("name", "")} {i.get("quantity", "")} {i.get("unit", "")}'.strip()
            for i in r.get("ingredients", [])
        ])
        return (
            f'Tên món: {r.get("name", "")}\n'
            f'Mô tả: {r.get("description", "")}\n'
            f'Nguyên liệu: {ingredient_text}\n'
            f'Tag: {",".join(r.get("tags", []))}'
        )

    def upsert_recipes(self, recipes: List[Dict[str, Any]]):
        self.ids = [str(r["_id"]) for r in recipes]
        docs = [self._recipe_to_doc(r) for r in recipes]

        embedder = self._get_embedder()
        embeddings = embedder.encode(docs, normalize_embeddings=True)
        embeddings = np.array(embeddings).astype("float32")

        d = embeddings.shape[1]
        index = faiss.IndexFlatIP(d)
        index.add(embeddings)
        self.index = index

        faiss.write_index(index, self.index_path)
        with open(self.meta_path, "w", encoding="utf-8") as f:
            json.dump({"ids": self.ids}, f, ensure_ascii=False)

    def search(self, query: str, top_k: int = 3):
        if self.index is None or not self.ids:
            self._load_index_if_exists()
        if self.index is None:
            return []

        embedder = self._get_embedder()
        q = embedder.encode([query], normalize_embeddings=True)
        q = np.array(q).astype("float32")

        scores, indices = self.index.search(q, top_k)
        results = []
        for i, score in zip(indices[0], scores[0]):
            if i >= 0:
                results.append({
                    "recipe_id": self.ids[i],
                    "score": float(score)
                })
        return results