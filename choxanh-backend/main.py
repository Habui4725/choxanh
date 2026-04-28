from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db import admins_collection, users_collection
from router.auth import hash_password
from router.auth import router as auth_router
from router.order import router as orders_router
from router.products import router as products_router
from router.reviews import router as reviews_router
from router.cart import router as cart_router
from router.contacts import router as contacts_router
from router.admin import router as admin_router
from router.ai import router as ai_router
from fastapi.staticfiles import StaticFiles
from router import payment
app = FastAPI()


def _ensure_default_admin():
    """Ensure default admin accounts exist in the database."""

    admins = [
        {
            "name": "Admin",
            "email": "admin@nextadmin.com",
            "password": "admin123",
        },
        {
            "name": "Admin",
            "email": "choxanhadmin@gmail.com",
            "password": "admin123",
        },
    ]

    for admin in admins:
        existing = admins_collection.find_one({"email": admin["email"]})
        if existing:
            # Ensure role is admin and unblocked (in case it was modified)
            admins_collection.update_one(
                {"email": admin["email"]},
                {
                    "$set": {
                        "role": "admin",
                        "is_blocked": False,
                    }
                },
            )
            continue

        admins_collection.insert_one(
            {
                "name": admin["name"],
                "email": admin["email"],
                "password": hash_password(admin["password"]),
                "role": "admin",
                "is_blocked": False,
            }
        )
        print(
            f"[setup] Created default admin user: {admin['email']} / {admin['password']}"
        )


# Ensure at least one admin exists (useful for initial setup)
_ensure_default_admin()

# Bật CORS cho frontend ở localhost (tất cả port)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002",
    ],
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
app.include_router(contacts_router)
app.include_router(admin_router)
app.include_router(ai_router)
app.include_router(payment.router, prefix="/payment", tags=["Payment"])
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
@app.get("/")
def root():
    return {"choxanhthongminh": "API running"}

# Bắt buộc trên Windows
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)