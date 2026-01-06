from fastapi import APIRouter, HTTPException
from bson import ObjectId
from pydantic import BaseModel, EmailStr
from db import users_collection
from passlib.context import CryptContext

router = APIRouter(prefix="/auth", tags=["Auth"])

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

#  Register 
@router.post("/register")
def register(data: RegisterRequest):
    if users_collection.find_one({"email": data.email}):
        raise HTTPException(status_code=400, detail="Email đã tồn tại")

    user = {
        "name": data.name,
        "email": data.email,
        "password": hash_password(data.password),
        "role": "user"
    }

    users_collection.insert_one(user)
    return {"message": "Đăng ký thành công"}

#  Login
@router.post("/login")
def login(data: LoginRequest):
    user = users_collection.find_one({"email": data.email})

    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Sai email hoặc mật khẩu")

    return {
        "message": "Đăng nhập thành công",
        "user": {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "role": user.get("role", "user")
        }
    }

#  Logout 
@router.post("/logout")
def logout():
    """
    Logout phía backend (stateless)
    Frontend sẽ xóa user/token đã lưu
    """
    return {"message": "Đăng xuất thành công"}


@router.get("/{user_id}")
def get_user(user_id: str):
    # Xác thực ObjectId
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="ID không hợp lệ")

    user = users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="Người dùng không tồn tại")

    return {
        "id": str(user.get("_id")),
        "name": user.get("name"),
        "email": user.get("email"),
        "role": user.get("role", "user"),
    }
