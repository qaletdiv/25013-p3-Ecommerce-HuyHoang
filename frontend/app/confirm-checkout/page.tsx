"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useDispatch } from "react-redux";
import { formatPrice } from "@/utils/formatPrice";
import { clearCart } from "../store/cartSlice";
import { AppDispatch } from "../store/store";

type Order = {
  id: number | string;
  total: number;
  status?: string;
  createdAt?: string;
  date?: string;
  items: Array<{
    id: number | string;
    name?: string;
    productName?: string;
    thumbnail?: string;
    variant?: { product?: { thumbnail?: string } };
    color?: string;
    size?: string;
    price: number;
    unitPrice?: number;
    quantity: number;
  }>;
};

export default function OrderSuccessPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get("session_id");
    if (sessionId) {
      const token = localStorage.getItem("token");
      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const payload = jwtDecode<{ exp?: number }>(token);
        if (payload.exp && payload.exp * 1000 <= Date.now()) {
          throw new Error("expired");
        }
      } catch {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        document.cookie = "token=; Max-Age=0; path=/";
        router.replace("/login");
        return;
      }

      fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/payments/stripe/confirm?session_id=${encodeURIComponent(sessionId)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(async (response) => {
          const data = await response.json().catch(() => ({}));
          if (response.status === 401 || response.status === 403) {
            throw new Error(data.message || "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          }
          if (!response.ok) {
            throw new Error(data.message || "Không thể xác nhận thanh toán Stripe.");
          }
          return data as Order;
        })
        .then((result) => {
          const orders = JSON.parse(localStorage.getItem("orders") || "[]");
          const savedOrder: Order = {
            ...result,
            id: result.id ?? (result as Order & { orderId?: number }).orderId!,
            status: result.status || "pending",
          };
          localStorage.setItem("orders", JSON.stringify([...(Array.isArray(orders) ? orders : []), savedOrder]));
          dispatch(clearCart());
          setOrder(savedOrder);
        })
        .catch((requestError) => {
          setError(requestError instanceof Error ? requestError.message : "Không thể xác nhận thanh toán.");
        });
      return;
    }

    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    if (Array.isArray(orders) && orders.length > 0) {
      setOrder(orders[orders.length - 1]);
    }
  }, [dispatch, router]);

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-6 text-neutral-950 dark:bg-[#111] dark:text-neutral-100">
        <div className="w-full max-w-md border border-red-200 bg-white p-8 text-center shadow-sm dark:border-red-900 dark:bg-[#181818]">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-xl text-red-600 dark:bg-red-950/40">
            !
          </div>
          <p className="text-lg font-medium">Không thể xác nhận thanh toán</p>
          <p className="mt-3 text-sm leading-6 text-neutral-500">{error}</p>
          <button
            type="button"
            onClick={() => router.push("/checkout")}
            className="mt-7 w-full bg-black px-6 py-3 text-xs uppercase tracking-[0.18em] text-white transition hover:bg-neutral-700 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
          >
            Quay lại thanh toán
          </button>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-6 text-neutral-950 dark:bg-[#111] dark:text-neutral-100">
        <div className="text-center">
          <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-2 border-neutral-200 border-t-black dark:border-neutral-700 dark:border-t-white" />
          <p className="text-sm font-medium">Đang xác nhận thanh toán</p>
          <p className="mt-2 text-xs text-neutral-500">Vui lòng không đóng trang này.</p>
        </div>
      </main>
    );
  }

  const statusLabel: Record<string, string> = {
    pending: "Chờ xác nhận",
    confirmed: "Đã xác nhận",
    shipping: "Giao hàng",
    delivering: "Đang giao",
    completed: "Hoàn tất",
  };
  const orderDate = order.date || (order.createdAt ? new Date(order.createdAt).toLocaleDateString("vi-VN") : "");
  const progressSteps = [
    { key: "pending", label: "Đã đặt hàng" },
    { key: "confirmed", label: "Đã xác nhận" },
    { key: "delivering", label: "Đang giao" },
    { key: "completed", label: "Hoàn tất" },
  ];
  const progressIndex = Math.max(0, progressSteps.findIndex((step) => step.key === order.status));

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-950 dark:bg-[#111] dark:text-neutral-100">
      <div className="mx-auto max-w-6xl px-5 py-10 md:px-10 md:py-16">
        <div className="mb-10 flex items-center justify-between border-b border-neutral-200 pb-6 dark:border-neutral-800">
          <div>
            <p className="mb-3 text-[10px] uppercase tracking-[0.35em] text-neutral-500">HyperLane / Order confirmed</p>
            <h1 className="text-3xl font-light tracking-tight md:text-5xl">Đặt hàng thành công</h1>
          </div>
          <div className="hidden h-10 w-10 items-center justify-center rounded-full bg-black text-lg text-white dark:bg-white dark:text-black sm:flex">✓</div>
        </div>

        <section className="mb-8 border border-emerald-200 bg-emerald-50 px-6 py-5 dark:border-emerald-900 dark:bg-emerald-950/20 md:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-900 dark:text-emerald-200">Thanh toán Stripe thành công</p>
              <p className="mt-1 text-sm text-emerald-800/70 dark:text-emerald-300/70">Đơn hàng của bạn đã được ghi nhận và đang chờ cửa hàng xác nhận.</p>
            </div>
            <span className="w-fit rounded-full bg-white px-4 py-2 text-xs font-medium text-emerald-700 shadow-sm dark:bg-emerald-950 dark:text-emerald-300">
              {statusLabel[order.status || "pending"] || "Chờ xác nhận"}
            </span>
          </div>
        </section>

        <section className="mb-8 rounded-2xl border border-neutral-200 bg-white px-5 py-7 dark:border-neutral-800 dark:bg-[#181818] md:px-8">
          <div className="mb-7 flex items-center justify-between">
            <div><p className="text-[10px] uppercase tracking-[0.25em] text-neutral-400">Order journey</p><h2 className="mt-2 text-xl font-light">Theo dõi tiến trình</h2></div>
            <span className="text-xs text-neutral-400">{progressIndex + 1}/{progressSteps.length}</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {progressSteps.map((step, index) => {
              const active = index <= progressIndex;
              return <div key={step.key} className="relative text-center">
                {index < progressSteps.length - 1 && <div className={`absolute left-1/2 top-3 h-px w-full ${index < progressIndex ? "bg-black dark:bg-white" : "bg-neutral-200 dark:bg-neutral-700"}`} />}
                <div className={`relative z-10 mx-auto flex h-6 w-6 items-center justify-center rounded-full text-[10px] ${active ? "bg-black text-white dark:bg-white dark:text-black" : "border border-neutral-300 bg-white text-neutral-400 dark:border-neutral-700 dark:bg-[#181818]"}`}>{active ? "✓" : index + 1}</div>
                <p className={`mt-3 text-[10px] sm:text-xs ${active ? "font-medium text-neutral-900 dark:text-white" : "text-neutral-400"}`}>{step.label}</p>
              </div>;
            })}
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[1fr_0.72fr]">
          <section className="border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-[#181818]">
            <div className="flex flex-col gap-4 border-b border-neutral-200 p-6 dark:border-neutral-800 sm:flex-row sm:items-center sm:justify-between md:p-8">
              <div>
                <p className="mb-2 text-[10px] uppercase tracking-[0.25em] text-neutral-500">Mã đơn hàng</p>
                <p className="text-xl font-medium">#{order.id}</p>
              </div>
              <div className="sm:text-right">
                <p className="mb-2 text-[10px] uppercase tracking-[0.25em] text-neutral-500">Ngày đặt</p>
                <p className="text-sm">{orderDate}</p>
              </div>
            </div>

            <div className="p-6 md:p-8">
              <div className="mb-7 flex items-center justify-between">
                <h2 className="text-xl font-light">Sản phẩm đã mua</h2>
                <span className="text-xs text-neutral-500">{order.items.length} sản phẩm</span>
              </div>
              <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4 py-5 first:pt-0 last:pb-0">
                    <img
                      src={item.thumbnail || item.variant?.product?.thumbnail || "/placeholder-product.svg"}
                      alt={item.name || item.productName || "Sản phẩm HyperLane"}
                      className="h-16 w-16 shrink-0 bg-neutral-100 object-cover dark:bg-neutral-800"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.name || item.productName || "Sản phẩm HyperLane"}</p>
                      <p className="mt-1 text-xs text-neutral-500">{[item.color, item.size].filter(Boolean).join(" / ") || "Phiên bản tiêu chuẩn"} · SL {item.quantity}</p>
                    </div>
                    <p className="whitespace-nowrap text-sm font-medium">{formatPrice((item.price || item.unitPrice || 0) * item.quantity)} ₫</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="h-fit border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-[#181818] md:p-8">
            <p className="mb-6 text-[10px] uppercase tracking-[0.25em] text-neutral-500">Tóm tắt đơn hàng</p>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between"><span className="text-neutral-500">Trạng thái</span><span>{statusLabel[order.status || "pending"] || "Chờ xác nhận"}</span></div>
              <div className="flex justify-between"><span className="text-neutral-500">Thanh toán</span><span>Stripe</span></div>
              <div className="flex justify-between border-t border-neutral-200 pt-5 text-lg dark:border-neutral-800"><span>Tổng cộng</span><span className="font-medium">{formatPrice(order.total)} ₫</span></div>
            </div>
            <div className="mt-8 border-t border-neutral-200 pt-7 dark:border-neutral-800">
              <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em]">Tiếp theo</p>
              <div className="space-y-4 text-sm text-neutral-500">
                <div className="flex gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-black dark:bg-white" /><p>Cửa hàng sẽ xác nhận đơn hàng của bạn.</p></div>
                <div className="flex gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-neutral-300 dark:bg-neutral-600" /><p>Bạn có thể theo dõi đơn trong lịch sử mua hàng.</p></div>
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link href="/sanpham" className="border border-neutral-300 px-7 py-3 text-center text-xs uppercase tracking-[0.15em] transition hover:bg-black hover:text-white dark:border-neutral-700 dark:hover:bg-white dark:hover:text-black">
            Tiếp tục mua sắm
          </Link>
          <Link href="/profile" className="bg-black px-7 py-3 text-center text-xs uppercase tracking-[0.15em] text-white transition hover:bg-neutral-700 dark:bg-white dark:text-black dark:hover:bg-neutral-200">
            Xem lịch sử mua hàng
          </Link>
        </div>
      </div>
    </main>
  );
}
