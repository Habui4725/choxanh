from fastapi import APIRouter, HTTPException, status
from bson import ObjectId
from pydantic import BaseModel
from db import users_collection, products_collection, orders_collection, reviews_collection

router = APIRouter(prefix="/admin", tags=["Admin"])

# ========== REQUEST MODELS ==========
class UpdateRoleRequest(BaseModel):
    new_role: str

class UpdateStatusRequest(BaseModel):
    status: str

# Middleware để check admin role
def check_admin(user_id: str):
    """Kiểm tra user có phải admin không"""
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="ID không hợp lệ")
    
    user = users_collection.find_one({"_id": ObjectId(user_id)})
    if not user or user.get("role") != "admin":
        raise HTTPException(
            status_code=403, 
            detail="Bạn không có quyền truy cập admin"
        )
    return user


# ========== USERS MANAGEMENT ==========
@router.get("/users")
def get_all_users(user_id: str):
    """Lấy danh sách tất cả users (admin only)"""
    check_admin(user_id)
    
    users = list(users_collection.find({}))
    return {
        "total": len(users),
        "users": [
            {
                "id": str(u["_id"]),
                "name": u["name"],
                "email": u["email"],
                "role": u.get("role", "user"),
                "is_blocked": u.get("is_blocked", False),
            }
            for u in users
        ]
    }


@router.patch("/users/{target_user_id}/role")
def update_user_role(user_id: str, target_user_id: str, req: UpdateRoleRequest):
    """Cập nhật role user (admin only)"""
    check_admin(user_id)
    
    if req.new_role not in ["user", "admin"]:
        raise HTTPException(status_code=400, detail="Role không hợp lệ")
    
    if not ObjectId.is_valid(target_user_id):
        raise HTTPException(status_code=400, detail="ID không hợp lệ")
    
    result = users_collection.update_one(
        {"_id": ObjectId(target_user_id)},
        {"$set": {"role": req.new_role}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Người dùng không tồn tại")
    
    return {"message": f"Cập nhật role thành công: {req.new_role}"}


@router.put("/users/{target_user_id}/block")
def block_user(user_id: str, target_user_id: str):
    """Chặn user (admin only)"""
    check_admin(user_id)

    if not ObjectId.is_valid(target_user_id):
        raise HTTPException(status_code=400, detail="ID không hợp lệ")

    result = users_collection.update_one(
        {"_id": ObjectId(target_user_id)},
        {"$set": {"is_blocked": True}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Người dùng không tồn tại")

    return {"message": "Chặn user thành công"}


@router.put("/users/{target_user_id}/unblock")
def unblock_user(user_id: str, target_user_id: str):
    """Bỏ chặn user (admin only)"""
    check_admin(user_id)

    if not ObjectId.is_valid(target_user_id):
        raise HTTPException(status_code=400, detail="ID không hợp lệ")

    result = users_collection.update_one(
        {"_id": ObjectId(target_user_id)},
        {"$set": {"is_blocked": False}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Người dùng không tồn tại")

    return {"message": "Bỏ chặn user thành công"}


@router.delete("/users/{target_user_id}")
def delete_user(user_id: str, target_user_id: str):
    """Xóa user (admin only)"""
    check_admin(user_id)
    
    if not ObjectId.is_valid(target_user_id):
        raise HTTPException(status_code=400, detail="ID không hợp lệ")
    
    # Không cho xóa chính mình
    if user_id == target_user_id:
        raise HTTPException(status_code=400, detail="Không thể xóa chính mình")
    
    result = users_collection.delete_one({"_id": ObjectId(target_user_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Người dùng không tồn tại")
    
    return {"message": "Xóa user thành công"}


# ========== DASHBOARD STATS ==========
@router.get("/stats")
def get_admin_stats(user_id: str):
    """Lấy thống kê cho dashboard admin"""
    check_admin(user_id)
    
    total_users = users_collection.count_documents({})
    total_products = products_collection.count_documents({})
    total_orders = orders_collection.count_documents({})
    admin_count = users_collection.count_documents({"role": "admin"})
    
    return {
        "total_users": total_users,
        "total_products": total_products,
        "total_orders": total_orders,
        "admin_count": admin_count,
    }


# ========== PRODUCTS MANAGEMENT (ADMIN) ==========
@router.get("/products")
def get_all_products_admin(user_id: str):
    """Lấy danh sách tất cả sản phẩm (admin view)"""
    check_admin(user_id)
    
    products = list(products_collection.find({}))
    return {
        "total": len(products),
        "products": [
            {
                "id": str(p["_id"]),
                "name": p["name"],
                "price": p["price"],
                "quantity": p.get("quantity", 0),
                "category": p.get("category"),
            }
            for p in products
        ]
    }


# ========== ORDERS MANAGEMENT (ADMIN) ==========
@router.get("/orders")
def get_all_orders_admin(user_id: str):
    """Lấy danh sách tất cả đơn hàng (admin view)"""
    check_admin(user_id)
    
    orders = list(orders_collection.find({}))
    return {
        "total": len(orders),
        "orders": [
            {
                "id": str(o["_id"]),
                "user_id": str(o.get("user_id", "")),
                "status": o.get("status", "pending"),
                "total": o.get("total", 0),
                "created_at": str(o.get("created_at", "")),
            }
            for o in orders
        ]
    }


@router.patch("/orders/{order_id}/status")
def update_order_status(user_id: str, order_id: str, req: UpdateStatusRequest):
    """Cập nhật trạng thái đơn hàng (admin only)"""
    check_admin(user_id)
    
    valid_statuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"]
    if req.status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Status không hợp lệ")
    
    if not ObjectId.is_valid(order_id):
        raise HTTPException(status_code=400, detail="ID không hợp lệ")
    
    result = orders_collection.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": {"status": req.status}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order không tồn tại")
    
    return {"message": f"Cập nhật status thành công: {req.status}"}


# ========== MAKE FIRST ADMIN ==========
@router.post("/setup-first-admin")
def setup_first_admin(user_id: str):
    """
    Chuyển user hiện tại thành admin nếu chưa có admin nào.
    (Chỉ dùng lần đầu tiên)
    """
    admin_exists = users_collection.find_one({"role": "admin"})
    
    if admin_exists:
        raise HTTPException(
            status_code=403, 
            detail="Đã có admin, không thể setup thêm"
        )
    
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="ID không hợp lệ")
    
    result = users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"role": "admin"}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Người dùng không tồn tại")
    
    return {
        "message": "Setup admin thành công!",
        "user_id": user_id
    }


# ========== REVIEWS MANAGEMENT (ADMIN) ==========
@router.get("/reviews")
def get_all_reviews_admin(user_id: str):
    """Lấy danh sách tất cả đánh giá (admin view)"""
    check_admin(user_id)
    
    reviews = list(reviews_collection.find({}))
    return {
        "total": len(reviews),
        "reviews": [
            {
                "id": str(r["_id"]),
                "product_id": str(r.get("product_id", "")),
                "user_id": str(r.get("user_id", "")),
                "rating": r.get("rating", 0),
                "comment": r.get("comment", ""),
                "created_at": str(r.get("created_at", "")),
            }
            for r in reviews
        ]
    }


@router.delete("/reviews/{review_id}")
def delete_review_admin(user_id: str, review_id: str):
    """Xóa đánh giá (admin only)"""
    check_admin(user_id)
    
    if not ObjectId.is_valid(review_id):
        raise HTTPException(status_code=400, detail="ID không hợp lệ")
    
    result = reviews_collection.delete_one({"_id": ObjectId(review_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Đánh giá không tồn tại")
    
    return {"message": "Xóa đánh giá thành công"}
