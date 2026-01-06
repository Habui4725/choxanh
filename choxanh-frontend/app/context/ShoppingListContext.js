"use client";

import { createContext, useContext, useState } from "react";

const ShoppingListContext = createContext();

export function ShoppingListProvider({ children }) {
  const [items, setItems] = useState([]);

  const addItem = (item) => {
    setItems((prev) => {
      if (prev.find((i) => i.name === item.name)) return prev;
      return [...prev, item];
    });
  };

  const removeItem = (name) => {
    setItems((prev) => prev.filter((i) => i.name !== name));
  };

  const clearList = () => setItems([]);

  return (
    <ShoppingListContext.Provider
      value={{ items, addItem, removeItem, clearList }}
    >
      {children}
    </ShoppingListContext.Provider>
  );
}

export const useShoppingList = () => useContext(ShoppingListContext);
