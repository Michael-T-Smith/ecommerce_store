"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "lambs_cart";

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage once on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // Corrupted storage — start fresh
    }
    setHydrated(true);
  }, []);

  // Persist to localStorage whenever cart changes (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage full or unavailable — non-fatal
    }
  }, [items, hydrated]);

  const cartKey = (id, size) => `${id}__${size}`;

  /** Add one unit of product+size. Creates the line item if new. */
  const addItem = useCallback((product, size) => {
    const resolvedSize = size ?? product.sizes?.[0] ?? null;
    const key = cartKey(product.id, resolvedSize);
    setItems((prev) => {
      const existing = prev.find((i) => cartKey(i.id, i.size) === key);
      if (existing) {
        return prev.map((i) =>
          cartKey(i.id, i.size) === key ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [
        ...prev,
        {
          id      : product.id,
          name    : product.name,
          price   : product.price,
          emoji   : product.emoji,
          category: product.category,
          size    : resolvedSize,
          qty     : 1,
        },
      ];
    });
  }, []);

  /** Remove a line item entirely. */
  const removeItem = useCallback((id, size) => {
    const key = cartKey(id, size);
    setItems((prev) => prev.filter((i) => cartKey(i.id, i.size) !== key));
  }, []);

  /** Set qty for a line item. Removes it if qty reaches 0. */
  const updateQty = useCallback((id, size, qty) => {
    const key = cartKey(id, size);
    if (qty <= 0) {
      setItems((prev) => prev.filter((i) => cartKey(i.id, i.size) !== key));
    } else {
      setItems((prev) =>
        prev.map((i) => (cartKey(i.id, i.size) === key ? { ...i, qty } : i))
      );
    }
  }, []);

  /** Empty the entire cart. Called after a successful order. */
  const clearCart = useCallback(() => setItems([]), []);

  // Derived values
  const itemCount = items.reduce((sum, i) => sum + i.qty, 0);
  const subtotal  = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQty, clearCart, itemCount, subtotal, hydrated }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}