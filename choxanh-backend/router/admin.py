from fastapi import APIRouter, HTTPException
from bson import ObjectId
from db import users_collection, admins_collection

router = APIRouter(prefix="/admin", tags=["Admin"])


def check_admin(user_id: str):
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="ID admin không hợp lệ")

    admin = admins_collection.find_one({"_id": ObjectId(user_id)})

    if not admin:
        raise HTTPException(status_code=403, detail="Bạn không có quyền truy cập admin")

    if admin.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Tài khoản này không phải admin")

    if admin.get("is_blocked", False):
        raise HTTPException(status_code=403, detail="Tài khoản admin đã bị khóa")

    return admin


@router.get("/users")
def get_all_users(user_id: str):
    check_admin(user_id)

    users = list(users_collection.find({}))
    return {
        "total": len(users),
        "users": [
            {
                "id": str(u["_id"]),
                "name": u.get("name", ""),
                "email": u.get("email", ""),
                "role": u.get("role", "user"),
                "is_blocked": u.get("is_blocked", False),
            }
            for u in users
        ],
    }


@router.put("/users/{target_user_id}/block")
def block_user(user_id: str, target_user_id: str):
    check_admin(user_id)

    if not ObjectId.is_valid(target_user_id):
        raise HTTPException(status_code=400, detail="ID người dùng không hợp lệ")

    result = users_collection.update_one(
        {"_id": ObjectId(target_user_id)},
        {"$set": {"is_blocked": True}},
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Người dùng không tồn tại")

    return {"message": "Chặn người dùng thành công"}


@router.put("/users/{target_user_id}/unblock")
def unblock_user(user_id: str, target_user_id: str):
    check_admin(user_id)

    if not ObjectId.is_valid(target_user_id):
        raise HTTPException(status_code=400, detail="ID người dùng không hợp lệ")

    result = users_collection.update_one(
        {"_id": ObjectId(target_user_id)},
        {"$set": {"is_blocked": False}},
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Người dùng không tồn tại")

    return {"message": "Bỏ chặn người dùng thành công"}


@router.delete("/users/{target_user_id}")
def delete_user(user_id: str, target_user_id: str):
    check_admin(user_id)

    if not ObjectId.is_valid(target_user_id):
        raise HTTPException(status_code=400, detail="ID người dùng không hợp lệ")

    result = users_collection.delete_one({"_id": ObjectId(target_user_id)})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Người dùng không tồn tại")

    return {"message": "Xóa người dùng thành công"}