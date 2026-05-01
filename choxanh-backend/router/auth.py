from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from pydantic import BaseModel, EmailStr
from db import users_collection, admins_collection
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

router = APIRouter(prefix="/auth", tags=["Auth"])

SECRET_KEY = "secret123"
ALGORITHM = "HS256"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# Hash password
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# Schema
class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# Register
@router.post("/register")
def register(data: RegisterRequest):
    if users_collection.find_one({"email": data.email}):
        raise HTTPException(status_code=400, detail="Email đã tồn tại")

    user = {
        "name": data.name,
        "email": data.email,
        "password": hash_password(data.password),
        "role": "user",
        "is_blocked": False,
    }

    users_collection.insert_one(user)
    return {"message": "Đăng ký thành công"}

# Login USER
@router.post("/login")
def login(data: LoginRequest):
    user = users_collection.find_one({"email": data.email})

    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Sai email hoặc mật khẩu")

    if user.get("is_blocked"):
        raise HTTPException(status_code=403, detail="Tài khoản bị khóa")

    return {
        "message": "Đăng nhập thành công",
        "user": {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "role": user.get("role", "user")
        }
    }

# Logout
@router.post("/logout")
def logout():
    return {"message": "Đăng xuất thành công"}

# Get user
@router.get("/{user_id}")
def get_user(user_id: str):
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="ID không hợp lệ")

    user = users_collection.find_one({"_id": ObjectId(user_id)})

    if not user:
        raise HTTPException(status_code=404, detail="Người dùng không tồn tại")

    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "role": user.get("role", "user"),
    }

# Update user info
class UpdateUserRequest(BaseModel):
    id: str
    name: str | None = None
    password: str | None = None

@router.put("/update")
def update_user(data: UpdateUserRequest):
    if not ObjectId.is_valid(data.id):
        raise HTTPException(status_code=400, detail="ID không hợp lệ")

    user = users_collection.find_one({"_id": ObjectId(data.id)})
    if not user:
        raise HTTPException(status_code=404, detail="Người dùng không tồn tại")

    update_fields = {}
    if data.name:
        update_fields["name"] = data.name
    if data.password:
        if len(data.password) < 6:
            raise HTTPException(status_code=400, detail="Mật khẩu phải dài ít nhất 6 ký tự")
        update_fields["password"] = hash_password(data.password)

    if not update_fields:
        raise HTTPException(status_code=400, detail="Không có dữ liệu để cập nhật")

    users_collection.update_one(
        {"_id": ObjectId(data.id)},
        {"$set": update_fields}
    )

    updated_user = users_collection.find_one({"_id": ObjectId(data.id)})
    return {
        "id": str(updated_user["_id"]),
        "name": updated_user["name"],
        "email": updated_user["email"],
        "role": updated_user.get("role", "user"),
    }

# AUTH MIDDLEWARE
def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("id")
        role = payload.get("role")

        if not user_id:
            raise HTTPException(status_code=401, detail="Token không hợp lệ")

    except JWTError:
        raise HTTPException(status_code=401, detail="Token không hợp lệ")

    if role == "admin":
        user = admins_collection.find_one({"_id": ObjectId(user_id)})
    else:
        user = users_collection.find_one({"_id": ObjectId(user_id)})

    if not user:
        raise HTTPException(status_code=404, detail="User không tồn tại")

    return user


def require_admin(current_user=Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Bạn không có quyền Admin")

    return current_user

# Login ADMIN
@router.post("/admin/login")
def admin_login(data: LoginRequest):
    admin = admins_collection.find_one({"email": data.email})

    if not admin:
        raise HTTPException(status_code=401, detail="Admin không tồn tại")

    if not verify_password(data.password, admin["password"]):
        raise HTTPException(status_code=401, detail="Sai mật khẩu")

    if admin.get("is_blocked"):
        raise HTTPException(status_code=403, detail="Tài khoản admin bị khóa")

    return {
        "message": "Đăng nhập admin thành công",
        "user": {
            "id": str(admin["_id"]),
            "name": admin["name"],
            "email": admin["email"],
            "role": "admin"
        }
    }
