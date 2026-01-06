"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();

  /* ===============================
     LOAD CART TỪ LOCALSTORAGE
  =============================== */
  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    }
  }, []);

  /* ===============================
     LƯU CART VÀO LOCALSTORAGE
  =============================== */
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart, mounted]);

  /* ===============================
     THÊM VÀO GIỎ
  =============================== */
  const addToCart = (product) => {
    const productId = product._id || product.id;

    setCart((prev) => {
      const exists = prev.find(
        (item) => (item._id || item.id) === productId
      );

      if (exists) {
        return prev.map((item) =>
          (item._id || item.id) === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prev, { ...product, quantity: 1 }];
    });

    // Sync to backend when user is logged in
    try {
      const userId = user?.id;
      if (userId) {
        const item = {
          product_id: String(productId),
          name: product.name,
          price: Number(product.price || 0),
          quantity: 1,
          image: product.image || null,
        };

        fetch("http://127.0.0.1:8000/api/cart/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId, item }),
        }).catch(() => {
          /* ignore network errors; local cart still works */
        });
      }
    } catch (e) {
      // no-op
    }
  };

  /* ===============================
     XOÁ SẢN PHẨM
  =============================== */
  const removeFromCart = (id) => {
    setCart((prev) =>
      prev.filter((item) => (item._id || item.id) !== id)
    );

    // Sync delete to backend when user is logged in
    try {
      const userId = user?.id;
      if (userId) {
        fetch(`http://127.0.0.1:8000/api/cart/${userId}/item/${encodeURIComponent(id)}`, {
          method: "DELETE",
        }).catch(() => {});
      }
    } catch (e) {}
  };

  /* ===============================
     CẬP NHẬT SỐ LƯỢNG
  =============================== */
  const updateQuantity = (id, newQty) => {
    if (newQty <= 0) {
      removeFromCart(id);
      return;
    }

    setCart((prev) =>
      prev.map((item) =>
        (item._id || item.id) === id
          ? { ...item, quantity: newQty }
          : item
      )
    );
  };

  /* ===============================
     XOÁ TOÀN BỘ GIỎ
  =============================== */
  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  /* ===============================
     TỔNG SỐ LƯỢNG
  =============================== */
  const getTotalQuantity = () =>
    cart.reduce((total, item) => total + item.quantity, 0);

  /* ===============================
     TỔNG TIỀN
  =============================== */
  const getTotalPrice = () =>
    cart.reduce(
      (total, item) => total + item.quantity * Number(item.price || 0),
      0
    );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalQuantity,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/* ===============================
   CUSTOM HOOK
=============================== */
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart phải được dùng trong CartProvider");
  }
  return context;
}
