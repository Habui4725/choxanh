from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from bson import ObjectId

from db import products_collection, recipes_collection, ai_requests_collection
from services.recipe_rag_faiss import RecipeRAG

router = APIRouter(prefix="/api/ai", tags=["AI-RAG"])

_recipe_rag: Optional[RecipeRAG] = None


def get_rag() -> RecipeRAG:
    global _recipe_rag
    if _recipe_rag is None:
        _recipe_rag = RecipeRAG()
    return _recipe_rag


class ReindexResp(BaseModel):
    status: str
    count: int


class ChatReq(BaseModel):
    message: str
    top_k: int = 1


class IngredientResp(BaseModel):
    ingredient: str
    matched_product: Optional[Dict[str, Any]] = None


class ChatResp(BaseModel):
    dish: str
    confidence: float
    ingredients: List[IngredientResp]
    estimated_total: int = 0


class SuggestByIngredientsReq(BaseModel):
    ingredients: List[str]


class SuggestedDishResp(BaseModel):
    dish: str
    matched_count: int
    missing_ingredients: List[str]


class SuggestByIngredientsResp(BaseModel):
    suggestions: List[SuggestedDishResp]


@router.post("/reindex-recipes", response_model=ReindexResp)
def reindex_recipes():
    recipes = list(recipes_collection.find({}))
    if not recipes:
        raise HTTPException(status_code=400, detail="Chưa có recipes trong Mongo")

    rag = get_rag()
    rag.upsert_recipes(recipes)

    return {"status": "indexed_recipes", "count": len(recipes)}


@router.post("/reindex", response_model=ReindexResp)
def reindex_alias():
    return reindex_recipes()


def map_ingredient_to_product(ingredient: Dict[str, Any]):
    hints = ingredient.get("product_hints", []) or []

    for hint in hints:
        hint = (hint or "").strip()
        if not hint:
            continue
        product = products_collection.find_one({
            "name": {"$regex": hint, "$options": "i"}
        })
        if product:
            return product

    name = (ingredient.get("name") or "").strip()
    if not name:
        return None

    return products_collection.find_one({
        "name": {"$regex": name, "$options": "i"}
    })


@router.post("/chat", response_model=ChatResp)
def chat(body: ChatReq):
    user_msg = (body.message or "").strip()
    if not user_msg:
        raise HTTPException(status_code=400, detail="message rỗng")

    top_k = max(1, min(int(body.top_k or 1), 5))

    rag = get_rag()
    hits = rag.search(user_msg, top_k=top_k)

    if not hits:
        raise HTTPException(status_code=404, detail="Không tìm thấy món phù hợp")

    best_hit = hits[0]

    recipe = recipes_collection.find_one({
        "_id": ObjectId(best_hit["recipe_id"])
    })
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe không tồn tại")

    ingredients_resp: List[Dict[str, Any]] = []
    estimated_total = 0

    for ing in recipe.get("ingredients", []):
        if not isinstance(ing, dict):
            continue

        product = map_ingredient_to_product(ing)
        if not product:
            continue

        price = product.get("price")
        if isinstance(price, (int, float)):
            estimated_total += int(price)

        ingredients_resp.append({
            "ingredient": ing.get("name", ""),
            "matched_product": {
                "id": str(product["_id"]),
                "name": product.get("name"),
                "price": product.get("price"),
                "image": product.get("image"),
                "category": product.get("category")
            }
        })

    if not ingredients_resp:
        raise HTTPException(
            status_code=404,
            detail="Tìm thấy món nhưng không map được nguyên liệu sang sản phẩm trong kho"
        )

    try:
        ai_requests_collection.insert_one({
            "message": user_msg,
            "recipe": recipe.get("name"),
            "confidence": float(best_hit["score"]),
            "ingredient_count": len(ingredients_resp),
            "estimated_total": estimated_total
        })
    except Exception:
        pass

    return {
        "dish": recipe.get("name"),
        "confidence": float(best_hit["score"]),
        "ingredients": ingredients_resp,
        "estimated_total": estimated_total
    }


@router.post("/suggest", response_model=ChatResp)
def suggest_alias(body: ChatReq):
    return chat(body)


def normalize_text(text: str) -> str:
    return (text or "").strip().lower()


@router.post("/suggest-by-ingredients", response_model=SuggestByIngredientsResp)
def suggest_by_ingredients(body: SuggestByIngredientsReq):
    user_ingredients = [normalize_text(x) for x in body.ingredients if x.strip()]
    if not user_ingredients:
        raise HTTPException(status_code=400, detail="Danh sách nguyên liệu rỗng")

    recipes = list(recipes_collection.find({}))
    results = []

    for recipe in recipes:
        recipe_ingredients = recipe.get("ingredients", [])
        recipe_names = [normalize_text(i.get("name", "")) for i in recipe_ingredients]

        matched = []
        missing = []

        for r_ing in recipe_names:
            found = any(user_ing in r_ing or r_ing in user_ing for user_ing in user_ingredients)
            if found:
                matched.append(r_ing)
            else:
                missing.append(r_ing)

        if matched:
            results.append({
                "dish": recipe.get("name"),
                "matched_count": len(matched),
                "missing_ingredients": missing
            })

    results.sort(key=lambda x: x["matched_count"], reverse=True)

    return {"suggestions": results[:5]}