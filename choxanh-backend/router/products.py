from fastapi import APIRouter, HTTPException, Query, status
from bson import ObjectId
from db import products_collection
from pydantic import BaseModel, Field
from typing import Optional, List

router = APIRouter(prefix="/api/products", tags=["Products"])

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


@router.post("/")
@router.post("/", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(p: ProductCreate):
    data = p.dict()
    # Đảm bảo giá là số nguyên và không âm (Pydantic đã tự động quy định ge=0)
    data["price"] = int(data.get("price", 0))

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