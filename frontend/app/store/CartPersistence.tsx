"use client";

import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CartItem, hydrateCart, updateStock } from "./cartSlice";
import { RootState, AppDispatch } from "./store";

type StoredCartItem = Partial<CartItem> & {
  color?: string | { name?: string };
  size?: string | { name?: string };
};

const asText = (value: unknown) =>
  typeof value === "object" && value !== null
    ? String((value as { name?: unknown }).name || "")
    : String(value || "");

const parseCart = (value: string, userId: string): CartItem[] => {
  const parsed: unknown = JSON.parse(value);
  if (!Array.isArray(parsed)) throw new Error("Invalid cart format");

  return parsed
    .filter((item): item is StoredCartItem => Boolean(item && typeof item === "object"))
    .map((item) => ({
      id: String(item.id || ""),
      productId: String(item.productId || ""),
      variantId: String(item.variantId || ""),
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
    .filter((item) => item.id && item.productId && item.variantId && item.quantity > 0)
    .map((item) => ({ ...item, quantity: Math.min(item.quantity, item.stock) }))
    .filter((item) => item.stock > 0 || item.quantity > 0);
};

export default function CartPersistence({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const cart = useSelector((state: RootState) => state.cart.items);
  const [mounted, setMounted] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const userKeyRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const loadCartForUser = () => {
      const savedUser = localStorage.getItem("user");
      let user: { id?: string; role?: string } | null = null;
      try {
        user = savedUser && savedUser !== "undefined" ? JSON.parse(savedUser) : null;
      } catch {
        localStorage.removeItem("user");
      }

      const userId = user?.id ? String(user.id) : null;
      const userKey = user?.role === "admin" ? "admin" : userId ? `user:${userId}` : null;
      if (userKey === userKeyRef.current) return;
      userKeyRef.current = userKey;

      if (!userId || user?.role === "admin") {
        setCurrentUserId(null);
        dispatch(hydrateCart([]));
        return;
      }

      setCurrentUserId(userId);
      const savedCart = localStorage.getItem(`cart_${userId}`);
      if (!savedCart) {
        dispatch(hydrateCart([]));
        return;
      }

      try {
        dispatch(hydrateCart(parseCart(savedCart, userId)));
      } catch {
        localStorage.removeItem(`cart_${userId}`);
        dispatch(hydrateCart([]));
      }
    };

    loadCartForUser();
    setMounted(true);
    const interval = window.setInterval(loadCartForUser, 500);
    return () => window.clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    if (!mounted || !currentUserId) return;
    localStorage.setItem(`cart_${currentUserId}`, JSON.stringify(cart));
  }, [cart, currentUserId, mounted]);

  useEffect(() => {
    if (!mounted || !currentUserId) return;

    const refreshStock = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/products`, {
          cache: "no-store",
        });
        if (!response.ok) throw new Error(`Stock request failed with status ${response.status}`);
        const products = await response.json();
        const stockByVariant: Record<string, number> = {};
        products.forEach((product: { variants?: Array<{ id: number; stock: number }> }) => {
          product.variants?.forEach((variant) => {
            stockByVariant[String(variant.id)] = variant.stock;
          });
        });
        dispatch(updateStock(stockByVariant));
      } catch (error) {
        console.warn("Không thể cập nhật tồn kho giỏ hàng:", error);
      }
    };

    refreshStock();
  }, [currentUserId, dispatch, mounted]);

  return <>{children}</>;
}
