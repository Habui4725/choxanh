from fastapi import APIRouter, HTTPException, status
from db import cart_collection
from models.cart import AddToCartRequest

router = APIRouter(prefix="/api/cart", tags=["Cart"])


def _as_str(v):
    try:
        return str(v)
    except Exception:
        return v


@router.post("/add")
def add_to_cart(data: AddToCartRequest):
    """Add an item to user's cart. If cart doesn't exist, create it. If item exists, increment quantity."""
    user_id = data.user_id
    item = data.item.dict()

    # đảm bảo product_id và quantity types an toàn
    item["product_id"] = _as_str(item.get("product_id"))
    try:
        item["quantity"] = int(item.get("quantity", 1))
    except Exception:
        item["quantity"] = 1

    cart = cart_collection.find_one({"user_id": user_id})

    if not cart:
        cart_collection.insert_one({"user_id": user_id, "items": [item]})
        return {"message": "Đã tạo giỏ hàng mới", "cart": {"user_id": user_id, "items": [item]}}

    # Thử tìm mặt hàng hiện có bằng product_id (so sánh dưới dạng chuỗi)
    for cart_item in cart.get("items", []):
        if _as_str(cart_item.get("product_id")) == item["product_id"]:
            cart_collection.update_one(
                {"user_id": user_id, "items.product_id": cart_item.get("product_id")},
                {"$inc": {"items.$.quantity": item["quantity"]}}
            )
            # trả lại giỏ hàng đã cập nhật
            updated = cart_collection.find_one({"user_id": user_id}, {"_id": 0})
            return {"message": "Đã cập nhật số lượng", "cart": updated}

    # push new item
    cart_collection.update_one({"user_id": user_id}, {"$push": {"items": item}})
    updated = cart_collection.find_one({"user_id": user_id}, {"_id": 0})
    return {"message": "Đã thêm sản phẩm vào giỏ", "cart": updated}


@router.get("/{user_id}")
def get_cart(user_id: str):
    cart = cart_collection.find_one({"user_id": user_id}, {"_id": 0})
    if not cart:
        return {"user_id": user_id, "items": []}
    return cart


@router.delete("/{user_id}/item/{product_id}")
def remove_item(user_id: str, product_id: str):
    # Xóa mục theo product_id (so sánh dưới dạng chuỗi)
    cart = cart_collection.find_one({"user_id": user_id})
    if not cart:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart not found")

    # Tạo danh sách mặt hàng mới mà không cần khớp product_id
    new_items = [it for it in cart.get("items", []) if _as_str(it.get("product_id")) != _as_str(product_id)]
    cart_collection.update_one({"user_id": user_id}, {"$set": {"items": new_items}})
    updated = cart_collection.find_one({"user_id": user_id}, {"_id": 0})
    return {"message": "Đã xóa sản phẩm khỏi giỏ", "cart": updated}
