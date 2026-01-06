from pydantic import BaseModel
from typing import List

class CartItem(BaseModel):
    product_id: str
    name: str
    price: float
    quantity: int
    image: str | None = None

class AddToCartRequest(BaseModel):
    user_id: str
    item: CartItem
