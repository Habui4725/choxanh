from fastapi import APIRouter, HTTPException
from db import orders_collection, cart_collection
from models.order import CreateOrderRequest
from datetime import datetime
from pydantic import BaseModel
from bson import ObjectId

router = APIRouter(prefix="/api/orders", tags=["Orders"])


class UpdateOrderStatusRequest(BaseModel):
    status: str


def order_helper(o):
    return {
        "id": str(o.get("_id")),
        "user_id": o.get("user_id"),
        "customer": {
            "full_name": o.get("customer", {}).get("full_name", ""),
            "phone": o.get("customer", {}).get("phone", ""),
            "address": o.get("customer", {}).get("address", ""),
        },
        "items": o.get("items", []),
        "payment_method": o.get("payment_method"),
        "total_price": o.get("total_price", 0),
        "status": o.get("status", "pending"),
        "created_at": o.get("created_at"),
    }


@router.post("/checkout")
def checkout(data: CreateOrderRequest):
    if not data.items:
        raise HTTPException(status_code=400, detail="Giỏ hàng trống")

    total_price = sum(item.price * item.quantity for item in data.items)

    order = {
        "user_id": data.user_id,
        "customer": {
            "full_name": data.full_name,
            "phone": data.phone,
            "address": data.address,
        },
        "items": [item.dict() for item in data.items],
        "payment_method": data.payment_method,
        "total_price": total_price,
        "status": "pending",
        "created_at": datetime.utcnow().isoformat(),
    }

    result = orders_collection.insert_one(order)

    try:
        cart_collection.delete_one({"user_id": data.user_id})
    except Exception:
        pass

    created = orders_collection.find_one({"_id": result.inserted_id})
    return {
        "message": "Thanh toán thành công",
        "order_id": str(result.inserted_id),
        "order": order_helper(created),
        "total": total_price,
    }


@router.get("/")
def get_all_orders():
    cursor = orders_collection.find().sort("created_at", -1)
    return [order_helper(o) for o in cursor]


@router.get("/{order_id}")
def get_order(order_id: str):
    try:
        o = orders_collection.find_one({"_id": ObjectId(order_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="ID không hợp lệ")

    if not o:
        raise HTTPException(status_code=404, detail="Order không tồn tại")

    return order_helper(o)


@router.get("/user/{user_id}")
def get_orders_by_user(user_id: str):
    cursor = orders_collection.find({"user_id": user_id}).sort("created_at", -1)
    return [order_helper(o) for o in cursor]


@router.patch("/{order_id}/status")
def update_order_status(order_id: str, data: UpdateOrderStatusRequest):
    valid_statuses = ["pending", "shipping", "completed", "canceled"]

    if data.status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Trạng thái không hợp lệ")

    try:
        result = orders_collection.update_one(
            {"_id": ObjectId(order_id)},
            {"$set": {"status": data.status}}
        )
    except Exception:
        raise HTTPException(status_code=400, detail="ID không hợp lệ")

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order không tồn tại")

    updated = orders_collection.find_one({"_id": ObjectId(order_id)})
    return {
        "message": "Cập nhật trạng thái thành công",
        "order": order_helper(updated),
    }