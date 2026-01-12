from pymongo import MongoClient

MONGO_URL = "mongodb://localhost:27017"

client = MongoClient(MONGO_URL)
db = client["Choxanh_db"]

products_collection = db["products"]
orders_collection = db["orders"]
users_collection = db["users"]
reviews_collection = db["reviews"]
cart_collection = db["carts"]