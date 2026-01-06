from fastapi import APIRouter, HTTPException
from db import orders_collection, cart_collection
from models.order import CreateOrderRequest
from datetime import datetime

router = APIRouter(prefix="/api/orders", tags=["Orders"])

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

    # Xóa giỏ hàng sau khi thanh toán
    try:
        cart_collection.delete_one({"user_id": data.user_id})
    except Exception:
        # non-fatal if cart deletion fails
        pass

    # PyMongo may have injected an ObjectId into `order`; remove it and expose string id
    order.pop("_id", None)
    order["id"] = str(result.inserted_id)

    return {
        "message": "Thanh toán thành công",
        "order_id": str(result.inserted_id),
        "order": order,
        "total": total_price,
    }


@router.get("/{order_id}")
def get_order(order_id: str):
    from bson import ObjectId
    try:
        o = orders_collection.find_one({"_id": ObjectId(order_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="ID không hợp lệ")
    if not o:
        raise HTTPException(status_code=404, detail="Order không tồn tại")

    # chuyển đổi _id thành chuỗi cho khách hàng
    o["id"] = str(o.get("_id"))
    o.pop("_id", None)
    return o


@router.get("/user/{user_id}")
def get_orders_by_user(user_id: str):
    cursor = orders_collection.find({"user_id": user_id})
    orders = []
    for o in cursor:
        o["id"] = str(o.get("_id"))
        o.pop("_id", None)
        orders.append(o)
    return orders
