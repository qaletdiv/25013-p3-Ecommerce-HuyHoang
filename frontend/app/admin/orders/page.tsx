"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import AdminShell from "../components/AdminShell";
import { formatPrice } from "@/utils/formatPrice";

type Order = { id: number; status: string; paymentStatus: string; total: number; createdAt: string; shippingName: string; items?: unknown[] };
const API = process.env.NEXT_PUBLIC_API_BASE;
const statuses = ["pending", "confirmed", "shipping", "delivering", "completed"];
const labels: Record<string, string> = { pending: "Chờ xác nhận", confirmed: "Đã xác nhận", shipping: "Giao hàng", delivering: "Đang giao", completed: "Hoàn thành", cancelled: "Đã hủy" };

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");

  const getToken = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const payload = jwtDecode<{ exp?: number; role?: string }>(token);
      if (payload.exp && payload.exp * 1000 <= Date.now()) throw new Error("expired");
      if (payload.role !== "admin") throw new Error("forbidden");
      return token;
    } catch {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      document.cookie = "token=; Max-Age=0; path=/";
      return null;
    }
  };

  const loadOrders = () => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    fetch(`${API}/api/orders/admin`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        const data = await response.json().catch(() => []);
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          document.cookie = "token=; Max-Age=0; path=/";
          router.replace("/login");
          throw new Error(data.message || "Phiên đăng nhập quản trị đã hết hạn.");
        }
        if (!response.ok) throw new Error(data.message || "Không thể tải đơn hàng");
        setOrders(Array.isArray(data) ? data : []);
      })
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Không thể tải đơn hàng"));
  };

  useEffect(() => {
    loadOrders();
  }, [router]);

  const updateStatus = async (order: Order) => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    const nextIndex = statuses.indexOf(order.status) + 1;
    const nextStatus = statuses[nextIndex];
    if (!nextStatus) return;
    const response = await fetch(`${API}/api/orders/${order.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: nextStatus }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(data.message || "Không thể cập nhật trạng thái");
      return;
    }
    setOrders((current) => current.map((item) => item.id === order.id ? { ...item, status: nextStatus, paymentStatus: nextStatus === "completed" ? "paid" : item.paymentStatus } : item));
  };

  return <AdminShell><div className="mx-auto max-w-[1500px]"><div className="mb-10"><p className="mb-3 text-[10px] uppercase tracking-[0.35em] text-neutral-400">Operations</p><h1 className="text-4xl font-light">Quản lý đơn hàng</h1></div>{error && <p className="mb-5 border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</p>}<div className="space-y-4">{orders.map((order) => <div key={order.id} className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-[#171717]"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.2em] text-neutral-500">#{order.id}</p><p className="mt-2 text-sm">{order.shippingName} · {new Date(order.createdAt).toLocaleDateString("vi-VN")}</p></div><span className="border px-3 py-1 text-xs">{labels[order.status] || order.status}</span></div><div className="mt-5 flex items-center justify-between border-t border-neutral-100 pt-5 dark:border-neutral-800"><span className="text-sm text-neutral-500">{order.items?.length || 0} sản phẩm · {order.paymentStatus}</span><div className="flex items-center gap-5"><strong>{formatPrice(Number(order.total))}₫</strong>{order.status !== "cancelled" && order.status !== "completed" && <button type="button" onClick={() => updateStatus(order)} className="bg-black px-4 py-2 text-xs uppercase tracking-[0.15em] text-white dark:bg-white dark:text-black">Chuyển: {labels[statuses[statuses.indexOf(order.status) + 1]]}</button>}</div></div></div>)}</div>{orders.length === 0 && <p className="text-sm text-neutral-500">Chưa có đơn hàng.</p>}</div></AdminShell>;
}
