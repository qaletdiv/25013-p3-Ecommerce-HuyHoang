"use client";

import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../store/store";
import { removeFromCart, updateQuantity } from "../store/cartSlice";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { formatPrice } from "@/utils/formatPrice";

export default function CartPage() {
  const router = useRouter();

  const [loading, setLoading] =
    useState(true);

  const dispatch = useDispatch<AppDispatch>();
  const cart = useSelector((state: RootState) => state.cart.items);

  useEffect(() => {
    const user =
      localStorage.getItem("user");

    if (
      !user ||
      user === "undefined"
    ) {
      router.replace("/login");
      return;
    }

    try {
      if (JSON.parse(user).role === "admin") {
      router.replace("/admin");
      return;
      }
    } catch {
      router.replace("/login");
      return;
    }

    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Đang kiểm tra đăng nhập...
      </div>
    );
  }
  const total = cart.reduce(
    (sum, item) =>
      sum + item.price * item.quantity,
    0
  );

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-white px-8">
        <h1 className="text-5xl font-light tracking-[0.15em] uppercase mb-6">
          Giỏ hàng trống
        </h1>

        <p className="text-neutral-500 mb-10 tracking-wide">
          Túi mua sắm của bạn đang chờ sẵn.
        </p>

        <Link
          href="/sanpham"
          className="bg-black text-white px-10 py-4 uppercase text-sm tracking-[0.2em]"
        >
          Tiếp Tục Mua Sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-20">
      <h1 className="text-5xl font-light uppercase tracking-[0.18em] mb-16">
        Túi Mua Sắm Của Bạn
      </h1>

      <div className="grid lg:grid-cols-3 gap-16">
        {/* Danh sách sản phẩm */}
        <div className="lg:col-span-2 space-y-10">
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex gap-8 border-b border-neutral-200 pb-10"
            >
              <img
                src={item.thumbnail || "/placeholder-product.svg"}
                alt={item.name}
                className="w-44 h-56 object-cover bg-neutral-100"
              />

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="text-2xl font-light">
                    {item.name}
                  </h2>

                  <p className="uppercase tracking-[0.15em] text-sm text-neutral-500 mt-3">
                    {item.color} / {item.size}
                  </p>

                  <p className="text-xl mt-5">
                    {formatPrice(item.price)}₫
                  </p>
                  <p className={`mt-2 text-sm ${item.stock <= 10 ? "text-orange-500" : "text-neutral-500"}`}>
                    Còn {item.stock} sản phẩm
                  </p>
                </div>

                <div className="flex items-center gap-5 mt-8">
                  <button
                    onClick={() =>
                      dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))
                    }
                    disabled={item.quantity <= 1}
                    className="w-12 h-12 border"
                  >
                    −
                  </button>

                  <span className="w-8 text-center">
                    {item.quantity}
                  </span>

                  <button
                    onClick={() =>
                      dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))
                    }
                    className="w-12 h-12 border"
                    disabled={item.quantity >= item.stock}
                    title={item.quantity >= item.stock ? "Đã đạt số lượng tồn kho" : "Tăng số lượng"}
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={() =>
                  dispatch(removeFromCart(item.id))
                }
                className="text-sm text-red-500"
              >
                Xóa
              </button>
            </div>
          ))}
        </div>

        {/* Tổng đơn hàng */}
        <div className="border border-neutral-200 p-10 h-fit sticky top-28">
          <h2 className="text-2xl font-light uppercase mb-8">
            Đơn Hàng Của Bạn
          </h2>

          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Tạm tính</span>
              <span>
                {formatPrice(total)}₫
              </span>
            </div>

            <div className="flex justify-between">
              <span>Vận chuyển</span>
              <span>Miễn phí</span>
            </div>
          </div>

          <div className="border-t mt-6 pt-6 flex justify-between text-xl font-semibold">
            <span>Tổng cộng</span>
            <span>
              {formatPrice(total)}₫
            </span>
          </div>

          <button
            onClick={() =>
              router.push("/checkout")
            }
            className="w-full mt-8 bg-black text-white py-4"
          >
            Thanh Toán
          </button>

          <Link
            href="/sanpham"
            className="block text-center mt-5 text-sm"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    </div>
  );
}