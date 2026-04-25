from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any, Union
from bson import ObjectId

from db import products_collection, recipes_collection, ai_requests_collection
from services.recipe_rag_faiss import RecipeRAG
from services.gemini_service import (
    analyze_user_intent,
    suggest_similar,
    find_cheaper_options,
    ask_gemini,
)

router = APIRouter(prefix="/api/ai", tags=["AI-RAG"])

_recipe_rag: Optional[RecipeRAG] = None


def normalize_text(text: str) -> str:
    return (text or "").strip().lower()


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


class IngredientMatchedProduct(BaseModel):
    id: str
    name: Optional[str] = None
    price: Optional[float] = None
    image: Optional[str] = None
    category: Optional[str] = None


class IngredientResp(BaseModel):
    ingredient: str
    matched_product: Optional[IngredientMatchedProduct] = None


class ChatResp(BaseModel):
    dish: str
    ingredients: List[IngredientResp]
    estimated_total: int = 0
    answer: str = ""
    suggestions: List[str] = []
    cheaper_options: List[str] = []


class SuggestByIngredientsReq(BaseModel):
    ingredients: List[str]


class SuggestedDishResp(BaseModel):
    dish: str
    matched_count: int
    missing_ingredients: List[str]


class SuggestByIngredientsResp(BaseModel):
    suggestions: List[SuggestedDishResp]


class IngredientSuggestionResp(BaseModel):
    mode: str
    user_ingredients: List[str]
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
    """
    Map nguyên liệu recipe sang product trong shop.
    Ưu tiên product_hints -> fallback theo name regex.
    """
    if not isinstance(ingredient, dict):
        return None

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


def build_ingredient_response(recipe: Dict[str, Any]):
    """
    Luôn trả toàn bộ nguyên liệu trong recipe.
    - Nếu map được product -> matched_product có dữ liệu
    - Nếu chưa map được -> matched_product = None
    Nhờ đó món nào có recipe cũng vẫn hiện được cách nấu.
    """
    ingredients_resp: List[Dict[str, Any]] = []
    estimated_total = 0

    for ing in recipe.get("ingredients", []):
        if not isinstance(ing, dict):
            continue

        product = map_ingredient_to_product(ing)

        if product:
            price = product.get("price")
            if isinstance(price, (int, float)):
                estimated_total += int(price)

            matched_product = {
                "id": str(product["_id"]),
                "name": product.get("name"),
                "price": product.get("price"),
                "image": product.get("image"),
                "category": product.get("category"),
            }
        else:
            matched_product = None

        ingredients_resp.append({
            "ingredient": ing.get("name", ""),
            "matched_product": matched_product,
        })

    return ingredients_resp, estimated_total


def build_ingredient_text_for_gemini(ingredients_resp: List[Dict[str, Any]]) -> str:
    """
    Tạo text gọn gửi cho Gemini.
    Gồm cả trường hợp nguyên liệu chưa có trong shop.
    """
    lines = []

    for item in ingredients_resp:
        ingredient_name = item.get("ingredient", "Không rõ")
        matched = item.get("matched_product")

        if matched:
            price = matched.get("price")
            price_str = (
                f"{int(price)}đ" if isinstance(price, (int, float)) else "không rõ giá"
            )
            shop_name = matched.get("name") or ingredient_name
            lines.append(f"- {ingredient_name} → {shop_name} ({price_str})")
        else:
            lines.append(f"- {ingredient_name} → chưa có trong shop")

    return "\n".join(lines)


def find_cheapest_recipe(recipes: List[Dict[str, Any]]):
    """
    Tìm món rẻ nhất dựa trên các nguyên liệu map được giá.
    Vẫn cho phép recipe có vài nguyên liệu chưa map.
    Chỉ cần có ít nhất 1 nguyên liệu map được là tính được.
    """
    best_recipe = None
    min_total = None
    best_ingredients_resp: List[Dict[str, Any]] = []

    for recipe in recipes:
        ingredients_resp, total = build_ingredient_response(recipe)

        has_any_mapped = any(i.get("matched_product") for i in ingredients_resp)
        if not ingredients_resp or not has_any_mapped:
            continue

        if min_total is None or total < min_total:
            min_total = total
            best_recipe = recipe
            best_ingredients_resp = ingredients_resp

    if not best_recipe:
        return None, [], 0

    return best_recipe, best_ingredients_resp, int(min_total or 0)


def suggest_recipes_by_ingredients(ingredients_input: List[str]):
    user_ingredients = [
        normalize_text(x) for x in ingredients_input if str(x).strip()
    ]
    if not user_ingredients:
        raise HTTPException(status_code=400, detail="Danh sách nguyên liệu rỗng")

    recipes = list(recipes_collection.find({}))
    results = []

    for recipe in recipes:
        recipe_ingredients = recipe.get("ingredients", [])
        recipe_names = [
            normalize_text(i.get("name", ""))
            for i in recipe_ingredients
            if isinstance(i, dict)
        ]

        matched = []
        missing = []

        for r_ing in recipe_names:
            found = any(
                user_ing in r_ing or r_ing in user_ing
                for user_ing in user_ingredients
            )
            if found:
                matched.append(r_ing)
            else:
                missing.append(r_ing)

        if matched:
            results.append({
                "dish": recipe.get("name"),
                "matched_count": len(matched),
                "missing_ingredients": missing,
            })

    results.sort(key=lambda x: x["matched_count"], reverse=True)

    return {
        "mode": "ingredient_suggestion",
        "user_ingredients": user_ingredients,
        "suggestions": results[:5],
    }


def generate_cooking_answer(recipe: Dict[str, Any], ingredients_resp: List[Dict[str, Any]], total: int) -> str:
    """
    Gemini viết hướng dẫn nấu ăn.
    Quan trọng: không ép Gemini chỉ dùng nguyên liệu map được trong shop,
    mà dùng toàn bộ nguyên liệu từ recipe để món nào cũng có thể hiện cách nấu đúng hơn.
    """
    recipe_ingredient_names = [
        ing.get("name", "")
        for ing in recipe.get("ingredients", [])
        if isinstance(ing, dict)
    ]

    ingredients_text = build_ingredient_text_for_gemini(ingredients_resp)

    context = f"""
Tên món: {recipe.get('name', '')}
Mô tả món: {recipe.get('description', '')}

Nguyên liệu chuẩn theo recipe:
{", ".join(recipe_ingredient_names)}

Nguyên liệu map với shop:
{ingredients_text}

Tổng tiền các nguyên liệu hiện map được trong shop: {total}đ
"""

    prompt = context + """
Hãy trả lời bằng tiếng Việt theo đúng yêu cầu:
1. Giới thiệu ngắn gọn món ăn là gì.
2. Hướng dẫn cách nấu từng bước, rõ ràng, dễ hiểu.
3. Đưa ra 1-2 mẹo để món ngon hơn.
4. Nếu có nguyên liệu trong recipe chưa map được với shop, hãy nói ngắn gọn rằng người dùng có thể cần chuẩn bị thêm.

Lưu ý:
- Ưu tiên dùng danh sách "Nguyên liệu chuẩn theo recipe" để hướng dẫn nấu.
- Không bịa món khác.
- Không trả JSON.
- Viết thân thiện, dễ đọc.
"""
    return ask_gemini(prompt)


@router.post(
    "/chat",
    response_model=Union[ChatResp, IngredientSuggestionResp],
)
def chat(body: ChatReq):
    user_msg = (body.message or "").strip()
    if not user_msg:
        raise HTTPException(status_code=400, detail="message rỗng")

    intent_data = analyze_user_intent(user_msg)
    intent = intent_data.get("intent", "find")
    dish_query = (intent_data.get("dish") or "").strip()
    ingredients_input = intent_data.get("ingredients", [])

    recipes = list(recipes_collection.find({}))

    recipe = None
    ingredients_resp: List[Dict[str, Any]] = []
    total = 0

    if intent == "cheapest":
        recipe, ingredients_resp, total = find_cheapest_recipe(recipes)

        if not recipe:
            raise HTTPException(
                status_code=404,
                detail="Không tìm thấy món rẻ nhất phù hợp",
            )

    elif intent == "ingredients":
        return suggest_recipes_by_ingredients(ingredients_input)

    else:
        query = dish_query or user_msg
        top_k = max(1, min(int(body.top_k or 1), 5))

        rag = get_rag()
        hits = rag.search(query, top_k=top_k)

        if not hits:
            raise HTTPException(status_code=404, detail="Không tìm thấy món phù hợp")

        best_hit = hits[0]

        recipe = recipes_collection.find_one({
            "_id": ObjectId(best_hit["recipe_id"])
        })

        if not recipe:
            raise HTTPException(status_code=404, detail="Recipe không tồn tại")

        ingredients_resp, total = build_ingredient_response(recipe)

        # KHÔNG raise lỗi nữa nếu chưa map được sản phẩm
        # Chỉ cần có recipe là vẫn hiển thị món + cách nấu
        if not ingredients_resp:
            raise HTTPException(
                status_code=404,
                detail="Recipe không có danh sách nguyên liệu hợp lệ",
            )

    answer = generate_cooking_answer(recipe, ingredients_resp, total)

    suggestions = suggest_similar(recipes, recipe.get("name", ""))
    cheaper_options = find_cheaper_options(
        recipes, total, map_ingredient_to_product
    )

    try:
        ai_requests_collection.insert_one({
            "message": user_msg,
            "intent": intent,
            "dish_query": dish_query,
            "ingredients_input": ingredients_input,
            "recipe": recipe.get("name"),
            "ingredient_count": len(ingredients_resp),
            "estimated_total": total,
        })
    except Exception as e:
        print("Save AI request error:", e)

    return {
        "dish": recipe.get("name"),
        "ingredients": ingredients_resp,
        "estimated_total": total,
        "answer": answer,
        "suggestions": suggestions,
        "cheaper_options": cheaper_options,
    }


@router.post("/suggest", response_model=Union[ChatResp, IngredientSuggestionResp])
def suggest_alias(body: ChatReq):
    return chat(body)


@router.post(
    "/suggest-by-ingredients",
    response_model=SuggestByIngredientsResp,
)
def suggest_by_ingredients(body: SuggestByIngredientsReq):
    result = suggest_recipes_by_ingredients(body.ingredients)
    return {"suggestions": result["suggestions"]}