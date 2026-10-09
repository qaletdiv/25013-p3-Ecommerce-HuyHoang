"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatPrice } from "@/utils/formatPrice";

export default function OrderSuccessPage() {
  const [order, setOrder] =
    useState<any>(null);

  useEffect(() => {
    const orders =
      JSON.parse(
        localStorage.getItem(
          "orders"
        ) || "[]"
      );

    if (orders.length > 0) {
      setOrder(orders[orders.length - 1]);
    }
  }, []);

  if (!order) {
    return (
      <div className="h-screen flex items-center justify-center text-neutral-500">
        Không tìm thấy thông tin đơn hàng.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-8 py-20">

      {/* Success */}
      <div className="text-center mb-20">
        <div className="w-24 h-24 mx-auto rounded-full border flex items-center justify-center text-4xl mb-8">
          ✓
        </div>

        <h1 className="text-5xl font-light uppercase tracking-[0.15em] mb-6">
          Xác nhận đơn hàng
        </h1>

        <p className="text-neutral-500 text-lg">
          Cảm ơn bạn đã mua sắm tại
          HyperLane.
        </p>
      </div>

      {/* Order Summary */}
      <div className="border p-10 bg-neutral-50">

        <div className="flex justify-between mb-10">
          <div>
            <p className="text-sm text-neutral-500 uppercase">
              Order ID
            </p>

            <p className="text-lg">
              {order.id}
            </p>
          </div>

          <div>
            <p className="text-sm text-neutral-500 uppercase">
              Ngày
            </p>

            <p>
              {order.date || new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-light mb-8">
          Chi tiết đơn hàng
        </h2>

        <div className="space-y-6">
          {order.items.map(
            (
              item: any
            ) => (
              <div
                key={
                  item.id
                }
                className="flex justify-between border-b pb-4"
              >
                <div>
                  <p className="font-medium">
                    {
                      item.name
                    }
                  </p>

                  <p className="text-sm text-neutral-500">
                    {
                      item.color
                    }{" "}
                    /{" "}
                    {
                      item.size
                    }{" "}
                    ×
                    {
                      item.quantity
                    }
                  </p>
                </div>

                <p>
                  {formatPrice(item.price * item.quantity)}
                  ₫
                </p>
              </div>
            )
          )}
        </div>

        <div className="flex justify-between text-2xl mt-10 pt-8 border-t">
          <span>
            Tổng
          </span>

          <span>
            {formatPrice(order.total)}
            ₫
          </span>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-center gap-6 mt-16">

        <Link
          href="/sanpham"
          className="px-10 py-4 border uppercase tracking-[0.15em] hover:bg-black hover:text-white transition"
        >
          Tiếp tục mua sắm
        </Link>

        <Link
          href="/profile"
          className="px-10 py-4 bg-black text-white uppercase tracking-[0.15em] hover:bg-neutral-800 transition"
        >
          Lịch sử mua hàng
        </Link>

      </div>
    </div>
  );
}