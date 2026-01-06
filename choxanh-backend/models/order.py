from pydantic import BaseModel
from typing import List

class OrderItem(BaseModel):
    product_id: str
    name: str
    price: float
    quantity: int

class CreateOrderRequest(BaseModel):
    user_id: str
    full_name: str
    phone: str
    address: str
    payment_method: str
    items: List[OrderItem]
