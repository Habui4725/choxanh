from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from router.auth import router as auth_router
from router.order import router as orders_router
from router.products import router as products_router
from router.reviews import router as reviews_router
from router.cart import router as cart_router

app = FastAPI()

# Bật CORS cho frontend ở localhost:3000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Gắn các router
app.include_router(auth_router)
app.include_router(orders_router)
app.include_router(products_router)
app.include_router(reviews_router)
app.include_router(cart_router)

@app.get("/")
def root():
    return {"choxanhthongminh": "API running"}

# Bắt buộc trên Windows
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)