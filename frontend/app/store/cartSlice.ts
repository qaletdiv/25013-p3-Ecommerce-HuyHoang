import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type CartItem = {
  id: string;
  productId: string;
  variantId: string;
  name: string;
  price: number;
  thumbnail: string;
  size: string;
  color: string;
  stock: number;
  quantity: number;
};

export type CartItemInput = Omit<CartItem, "quantity"> & {
  quantity?: number;
};

type CartState = {
  items: CartItem[];
};

const initialState: CartState = { items: [] };

const normalizeItem = (item: CartItemInput): CartItem => ({
  ...item,
  name: String(item.name || ""),
  price: Number(item.price) || 0,
  thumbnail: String(item.thumbnail || ""),
  size: String(item.size || ""),
  color: String(item.color || ""),
  stock: Math.max(0, Number(item.stock) || 0),
  quantity: Math.max(1, Number(item.quantity) || 1),
});

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItemInput>) => {
      const item = normalizeItem(action.payload);
      const existing = state.items.find((current) => current.id === item.id);

      if (existing) {
        existing.quantity = Math.min(existing.quantity + item.quantity, item.stock);
        existing.stock = item.stock;
        return;
      }

      if (item.stock > 0) {
        state.items.push({ ...item, quantity: Math.min(item.quantity, item.stock) });
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ id: string; quantity: number }>
    ) => {
      const item = state.items.find((current) => current.id === action.payload.id);
      if (item) {
        item.quantity = Math.min(
          Math.max(1, action.payload.quantity),
          item.stock
        );
      }
    },
    updateStock: (state, action: PayloadAction<Record<string, number>>) => {
      state.items = state.items
        .map((item) => {
          const stock = action.payload[item.variantId];
          return stock === undefined
            ? item
            : { ...item, stock, quantity: Math.min(item.quantity, Math.max(0, stock)) };
        })
        .filter((item) => item.stock > 0);
    },
    hydrateCart: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  updateStock,
  hydrateCart,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
