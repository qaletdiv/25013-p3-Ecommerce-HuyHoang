"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { useToast } from "./ToastContext";

type CartItem = {
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

type StoredCartItem = Partial<CartItem> & {
  color?: string | { name?: string };
  size?: string | { name?: string };
};

const asText = (value: unknown) =>
  typeof value === "object" && value !== null
    ? String((value as { name?: unknown }).name || "")
    : String(value || "");

type CartContextType = {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const userKeyRef = useRef<string | null | undefined>(undefined);
  const { showToast } = useToast();

  // Load cart for current user when component mounts
  useEffect(() => {
    const loadCartForUser = () => {
      const user = localStorage.getItem("user");
      let parsedUser: { id?: string; role?: string } | null = null;
      try {
        parsedUser = user && user !== "undefined" ? JSON.parse(user) : null;
      } catch {
        localStorage.removeItem("user");
      }
      const userId = parsedUser?.id ? String(parsedUser.id) : null;
      const userKey = parsedUser?.role === "admin"
        ? "admin"
        : userId
          ? `user:${userId}`
          : null;

      if (userKey === userKeyRef.current) return;
      userKeyRef.current = userKey;

      if (parsedUser?.role === "admin") {
        setCurrentUserId(null);
        setCart([]);
      } else if (userId) {
        setCurrentUserId(userId);
        const savedCart = localStorage.getItem(`cart_${userId}`);
        if (savedCart) {
          try {
            const parsedCart: unknown = JSON.parse(savedCart);
            if (!Array.isArray(parsedCart)) throw new Error("Invalid cart format");
            setCart(
              parsedCart
                .filter((item): item is StoredCartItem => Boolean(item && typeof item === "object"))
                .map((item) => ({
                  ...item,
                  id: String(item.id),
                  productId: String(item.productId),
                  variantId: String(item.variantId),
                  name: asText(item.name),
                  price: Number(item.price) || 0,
                  thumbnail: asText(item.thumbnail),
                  size: asText(item.size),
                  color: asText(item.color),
                  stock: Number.isFinite(Number(item.stock))
                    ? Math.max(0, Number(item.stock))
                    : Number.MAX_SAFE_INTEGER,
                  quantity: Math.max(1, Number(item.quantity) || 1),
                }))
                .filter((item) => item.id && item.productId && item.variantId)
            );
          } catch {
            localStorage.removeItem(`cart_${userId}`);
            setCart([]);
          }
        } else {
          setCart([]);
        }
      } else {
        setCurrentUserId(null);
        setCart([]);
      }
    };

    loadCartForUser();
    setMounted(true);

    // Monitor login/logout without reloading the cart on every interval.
    const interval = setInterval(loadCartForUser, 500);
    return () => clearInterval(interval);
  }, []);

  // Save cart to localStorage when it changes
  useEffect(() => {
    if (!mounted || !currentUserId) return;

    localStorage.setItem(
      `cart_${currentUserId}`,
      JSON.stringify(cart)
    );
  }, [cart, mounted, currentUserId]);

  useEffect(() => {
    if (!mounted || !currentUserId) return;

    const refreshStock = async () => {
      try {
        const savedUser = localStorage.getItem("user");
        if (!savedUser || savedUser === "undefined") return;
        const user = JSON.parse(savedUser);
        if (user.role === "admin") return;

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/api/products`,
          { cache: "no-store" }
        );
        if (!response.ok) {
          throw new Error(`Stock request failed with status ${response.status}`);
        }
        const products = await response.json();
        const stockByVariant = new Map<string, number>();
        products.forEach((product: { variants?: Array<{ id: number; stock: number }> }) => {
          product.variants?.forEach((variant) => {
            stockByVariant.set(String(variant.id), variant.stock);
          });
        });

        setCart((currentCart) =>
          currentCart
            .map((item) => {
              const stock = stockByVariant.get(item.variantId);
              return stock === undefined
                ? item
                : { ...item, stock, quantity: Math.min(item.quantity, Math.max(0, stock)) };
            })
            .filter((item) => item.stock > 0)
        );
      } catch (error) {
        console.warn("Không thể cập nhật tồn kho giỏ hàng:", error);
      }
    };

    refreshStock();
  }, [mounted, currentUserId]);

  const addToCart = (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    const normalizedItem = {
      ...item,
      name: asText(item.name),
      price: Number(item.price) || 0,
      thumbnail: asText(item.thumbnail),
      size: asText(item.size),
      color: asText(item.color),
      stock: Math.max(0, Number(item.stock) || 0),
    };

    setCart((prev) => {
      const exist = prev.find((p) => p.id === normalizedItem.id);
      const quantityToAdd = normalizedItem.quantity ?? 1;
      const availableStock = normalizedItem.stock;

      if (exist) {
        const nextQuantity = Math.min(exist.quantity + quantityToAdd, availableStock);
        if (nextQuantity === exist.quantity) {
          showToast(`"${normalizedItem.name}" đã đạt số lượng tồn kho tối đa`, "info");
          return prev;
        }
        showToast(`Đã cập nhật "${normalizedItem.name}" trong giỏ hàng`, "info");
        return prev.map((p) =>
          p.id === normalizedItem.id
            ? {
              ...p,
              quantity: nextQuantity,
              stock: availableStock,
            }
            : p
        );
      }

      if (availableStock <= 0) {
        showToast(`"${normalizedItem.name}" hiện đã hết hàng`, "info");
        return prev;
      }

      showToast(`Đã thêm "${normalizedItem.name}" vào giỏ hàng`, "success");
      return [...prev, { ...normalizedItem, quantity: Math.min(quantityToAdd, availableStock) }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((p) => p.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    setCart((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, quantity: Math.min(Math.max(1, quantity), p.stock) }
          : p
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

const defaultCartContext: CartContextType = {
  cart: [],
  addToCart: () => { },
  removeFromCart: () => { },
  updateQuantity: () => { },
  clearCart: () => { },
};

export const useCart = () => {
  const context = useContext(CartContext);
  return context ?? defaultCartContext;
};