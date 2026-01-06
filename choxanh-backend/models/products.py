from pydantic import BaseModel
from typing import Optional

class Product(BaseModel):
    id: int
    name: str
    price: int
    category: Optional[str] = None
    image: Optional[str] = None
    origin: Optional[str] = None
    import_date: Optional[str] = None
    usage: Optional[str] = None
    note: Optional[str] = None

