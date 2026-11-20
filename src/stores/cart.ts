import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "../types";

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string, size: number) => void;
  updateQuantity: (productId: string, size: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
  addItem: (item, quantity = 1) =>
    set((state) => {
      const found = state.items.find(
        (i) => i.productId === item.productId && i.size === item.size && i.colorName === item.colorName,
      );
      if (found) {
        return {
          items: state.items.map((i) =>
            i === found ? { ...i, quantity: i.quantity + quantity } : i,
          ),
        };
      }
      return { items: [...state.items, { ...item, quantity }] };
    }),
  removeItem: (productId, size) =>
    set((state) => ({
      items: state.items.filter((i) => !(i.productId === productId && i.size === size)),
    })),
  updateQuantity: (productId, size, quantity) =>
    set((state) => ({
      items:
        quantity <= 0
          ? state.items.filter((i) => !(i.productId === productId && i.size === size))
          : state.items.map((i) =>
              i.productId === productId && i.size === size ? { ...i, quantity } : i,
            ),
    })),
  clearCart: () => set({ items: [] }),
  totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
  totalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: "amazing-cart" },
  ),
);
