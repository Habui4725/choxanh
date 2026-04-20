from fastapi import APIRouter, HTTPException, Query, status, UploadFile, File, Form  # ✅ SỬA: thêm UploadFile, File, Form
from bson import ObjectId
from db import products_collection
from pydantic import BaseModel, Field
from typing import Optional, List
import os  # ✅ SỬA: thêm os
import shutil  # ✅ SỬA: thêm shutil

router = APIRouter(prefix="/api/products", tags=["Products"])

UPLOAD_DIR = "uploads"  # ✅ SỬA: thêm thư mục lưu ảnh
os.makedirs(UPLOAD_DIR, exist_ok=True)  # ✅ SỬA: tạo thư mục nếu chưa có

# ===== Schema =====
class ProductCreate(BaseModel):
    name: str = Field(..., min_length=1)
    price: int = Field(..., ge=0)
    image: Optional[str] = None
    origin: Optional[str] = None
    import_date: Optional[str] = None
    usage: Optional[str] = None
    note: Optional[str] = None
    category: Optional[str] = None


class ProductOut(BaseModel):
    id: str
    name: str
    price: int
    image: Optional[str] = None
    origin: Optional[str] = None
    import_date: Optional[str] = None
    usage: Optional[str] = None
    note: Optional[str] = None
    category: Optional[str] = None

def product_helper(p):
    return {
        "id": str(p["_id"]),   # đổi từ _id sang id
        "name": p.get("name"),
        "price": p.get("price"),
        "image": p.get("image"),
        "origin": p.get("origin"),
        "import_date": p.get("import_date"),
        "usage": p.get("usage"),
        "note": p.get("note"),
        "category": p.get("category"),
    }

# ===== API =====

# 1. Danh sách sản phẩm (có lọc theo category nếu truyền query)
@router.get("/")
def get_all_products(category: Optional[str] = Query(None)):
    query = {}
    if category:
        query["category"] = category
    products = products_collection.find(query)
    return [product_helper(p) for p in products]

# 1b. Lấy danh sách danh mục (distinct categories)
@router.get("/categories")
def get_categories():
    categories = products_collection.distinct("category", {"category": {"$ne": None}})
    # loại bỏ giá trị rỗng
    return [c for c in categories if c]

# 2. Chi tiết sản phẩm
@router.get("/{product_id}")
def get_product_detail(product_id: str):
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=400, detail="ID không hợp lệ")

    product = products_collection.find_one({"_id": ObjectId(product_id)})
    if not product:
        raise HTTPException(status_code=404, detail="Không tìm thấy sản phẩm")

    return product_helper(product)

# 3. Lấy theo category (nếu muốn dùng route riêng)
@router.get("/category/{category}")
def get_by_category(category: str):
    products = products_collection.find({"category": category})
    return [product_helper(p) for p in products]


@router.post("/", response_model=ProductOut, status_code=status.HTTP_201_CREATED)  # ✅ SỬA: bỏ khai báo trùng @router.post("/")
async def create_product(  # ✅ SỬA: đổi sang async + nhận Form/File
    name: str = Form(...),
    price: int = Form(...),
    origin: Optional[str] = Form(None),
    import_date: Optional[str] = Form(None),
    usage: Optional[str] = Form(None),
    note: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
):
    image_url = None  # ✅ SỬA: biến lưu đường dẫn ảnh

    # ✅ SỬA: xử lý upload ảnh
    if image:
        file_ext = image.filename.split(".")[-1] if image.filename and "." in image.filename else "jpg"
        file_name = f"{ObjectId()}.{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, file_name)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

        image_url = f"/uploads/{file_name}"

    data = {
        "name": name,
        "price": int(price),
        "image": image_url,
        "origin": origin,
        "import_date": import_date,
        "usage": usage,
        "note": note,
        "category": category,
    }

    # tránh trùng lặp tên
    try:
        existing = products_collection.find_one({"name": data["name"]})
        if existing:
            raise HTTPException(status_code=400, detail="Sản phẩm cùng tên đã tồn tại")

        result = products_collection.insert_one(data)
        created = products_collection.find_one({"_id": result.inserted_id})
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Lỗi cơ sở dữ liệu")

    if not created:
        raise HTTPException(status_code=500, detail="Tạo sản phẩm thất bại")

    prod = product_helper(created)
    return prod
@router.put("/{product_id}", response_model=ProductOut)
async def update_product(
    product_id: str,
    name: str = Form(...),
    price: int = Form(...),
    origin: Optional[str] = Form(None),
    import_date: Optional[str] = Form(None),
    usage: Optional[str] = Form(None),
    note: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
):
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=400, detail="ID không hợp lệ")

    existing_product = products_collection.find_one({"_id": ObjectId(product_id)})
    if not existing_product:
        raise HTTPException(status_code=404, detail="Không tìm thấy sản phẩm")

    image_url = existing_product.get("image")

    # nếu có ảnh mới thì upload ảnh mới
    if image:
        file_ext = image.filename.split(".")[-1] if image.filename and "." in image.filename else "jpg"
        file_name = f"{ObjectId()}.{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, file_name)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

        image_url = f"/uploads/{file_name}"

    data = {
        "name": name,
        "price": int(price),
        "image": image_url,
        "origin": origin,
        "import_date": import_date,
        "usage": usage,
        "note": note,
        "category": category,
    }

    try:
        # tránh trùng tên với sản phẩm khác
        duplicate = products_collection.find_one({
            "name": data["name"],
            "_id": {"$ne": ObjectId(product_id)}
        })
        if duplicate:
            raise HTTPException(status_code=400, detail="Sản phẩm cùng tên đã tồn tại")

        products_collection.update_one(
            {"_id": ObjectId(product_id)},
            {"$set": data}
        )

        updated = products_collection.find_one({"_id": ObjectId(product_id)})
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Lỗi cơ sở dữ liệu")

    if not updated:
        raise HTTPException(status_code=500, detail="Cập nhật sản phẩm thất bại")

    return product_helper(updated)
@router.delete("/{product_id}")
def delete_product(product_id: str):
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=400, detail="ID không hợp lệ")

    result = products_collection.delete_one({"_id": ObjectId(product_id)})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Không tìm thấy sản phẩm")

    return {"message": "Xóa sản phẩm thành công"}