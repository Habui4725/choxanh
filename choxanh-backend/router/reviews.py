from fastapi import APIRouter, HTTPException
from db import reviews_collection
from datetime import datetime
from pydantic import BaseModel
from typing import Optional
from bson import ObjectId

router = APIRouter(
    prefix="/api/reviews",
    tags=["Reviews"]
)

# ===== Schema =====
class Review(BaseModel):
    product_id: str   # lưu dưới dạng string
    author: Optional[str] = "Người mua ẩn danh"
    rating: int
    comment: str

# ===== API =====

# Lấy đánh giá theo product_id
@router.get("/{product_id}")
def get_reviews(product_id: str):
    reviews = list(
        reviews_collection.find(
            {"product_id": product_id},
            {"_id": 0}
        )
    )
    return reviews

# thêm đánh giá mới
@router.post("/")
def add_review(review: Review):
    data = review.dict()
    data["date"] = datetime.utcnow().isoformat()

    result = reviews_collection.insert_one(data)

    return {
        "product_id": data["product_id"],
        "author": data["author"],
        "rating": data["rating"],
        "comment": data["comment"],
        "date": data["date"]
    }

# XÓA bài đánh giá theo review_id
@router.delete("/{review_id}")
def delete_review(review_id: str):
    try:
        result = reviews_collection.delete_one({"_id": ObjectId(review_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="ID không hợp lệ")

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Review không tồn tại")

    return {"message": "Review đã xoá thành công"}