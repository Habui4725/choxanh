import json
from db import products_collection

with open("products.json", "r", encoding="utf-8") as file:
    data = json.load(file)

products_collection.drop()     # xóa dữ liệu cũ, tránh trùng
products_collection.insert_many(data)

print("IMPORT SUCCESS!")
