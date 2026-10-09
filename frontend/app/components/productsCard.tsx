"use client";
// This component is a client component because it uses useState and useEffect

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Product } from "../types/types";
import { useCart } from "../context/CartContext";
import { formatPrice } from "@/utils/formatPrice";

export default function ProductsCard({
  product,
}: {
  product: Product;
}) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (!savedUser || savedUser === "undefined") return;
    try {
      setIsAdmin(JSON.parse(savedUser).role === "admin");
    } catch {
      localStorage.removeItem("user");
    }
  }, []);

  const firstVariant =
    product.variants?.[0];
  const stock = Number(firstVariant?.stock || 0);

  const handleAddToCart = (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();

    const user = localStorage.getItem("user");

    if (!user || user === "undefined") {
      router.push("/login");
      return;
    }

    if (!firstVariant) return;

    const rawColor: unknown = firstVariant.color;
    const rawSize: unknown = firstVariant.size;

    addToCart({
      id: `${product.id}-${firstVariant.id}`,
      productId: product.id.toString(),
      variantId: firstVariant.id.toString(),
      name: product.name,
      price: Number(firstVariant.price),
      thumbnail: product.thumbnail,
      color: typeof rawColor === "object" && rawColor !== null
        ? String((rawColor as { name?: unknown }).name || "")
        : String(rawColor || ""),
      size: typeof rawSize === "object" && rawSize !== null
        ? String((rawSize as { name?: unknown }).name || "")
        : String(rawSize || ""),
      stock: Number(firstVariant.stock),
      quantity: 1,
    });
  };

  return (
    <article className="group block">
      <Link href={`/sanpham/${product.slug}`} className="group block">
        <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100 dark:bg-neutral-800">
          <img
            src={product.thumbnail || "/placeholder-product.svg"}
            alt={product.name}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
          <div className="absolute left-4 top-4">
            {stock <= 0 ? (
              <span className="bg-white/90 px-3 py-2 text-[10px] uppercase tracking-[0.16em] text-neutral-700">Hết hàng</span>
            ) : product.hot ? (
              <span className="bg-black/90 px-3 py-2 text-[10px] uppercase tracking-[0.16em] text-white">Nổi bật</span>
            ) : null}
          </div>
          <span className="absolute bottom-4 right-4 translate-y-2 bg-white px-4 py-3 text-[10px] uppercase tracking-[0.16em] opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            Xem sản phẩm&nbsp; ↗
          </span>
        </div>

        <div className="space-y-2 pt-5">
          <p className="text-[10px] uppercase tracking-[0.22em] text-neutral-500">{product.category?.name || "HyperLane"}</p>
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base font-light leading-6">{product.name}</h3>
            <p className="whitespace-nowrap text-sm">{formatPrice(Number(firstVariant?.price || 0))}₫</p>
          </div>
          <p className="text-xs text-neutral-500">{firstVariant?.size ? `Size ${firstVariant.size}` : "Thiết kế mới nhất"}</p>
        </div>
      </Link>

      {!isAdmin && (
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={stock <= 0}
          className="mt-4 w-full border border-black py-3 text-xs uppercase tracking-[0.16em] transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:border-neutral-300 disabled:text-neutral-400"
        >
          {stock > 0 ? "Thêm vào giỏ hàng" : "Hết hàng"}
        </button>
      )}
    </article>
  );
}