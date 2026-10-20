"use client";

import Link from "next/link";
import { AlertTriangle, ArrowUpRight, BarChart3, CheckCircle2, Package, ShoppingBag, Sparkles, Wallet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import AdminShell from "./components/AdminShell";
import { Product } from "../types/types";

type AdminOrder = {
  id: number;
  status: string;
  total: number;
  createdAt: string;
  shippingName?: string;
};

const API = process.env.NEXT_PUBLIC_API_BASE;
const statusLabels: Record<string, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  shipping: "Giao hàng",
  delivering: "Đang giao",
  completed: "Hoàn tất",
  cancelled: "Đã hủy",
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [userName, setUserName] = useState("bạn");
  const [revenue, setRevenue] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }
    try {
      const payload = jwtDecode<{ exp?: number; role?: string }>(token);
      if (payload.exp && payload.exp * 1000 <= Date.now()) throw new Error("expired");
      if (payload.role !== "admin") throw new Error("forbidden");
    } catch {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      document.cookie = "token=; Max-Age=0; path=/";
      router.replace("/login");
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch(`${API}/api/products`).then((response) => (response.ok ? response.json() : [])),
      fetch(`${API}/api/orders/admin`, { headers }).then((response) => (response.ok ? response.json() : [])),
      fetch(`${API}/api/orders/admin/revenue`, { headers }).then((response) => (response.ok ? response.json() : null)),
    ]).then(([productData, orderData, revenueData]) => {
      setProducts(Array.isArray(productData) ? productData : []);
      setOrders(Array.isArray(orderData) ? orderData : []);
      if (revenueData) {
        setRevenue(Number(revenueData.revenue) || 0);
        setMonthlyRevenue(revenueData.byMonth || {});
      }
    }).catch(() => {
      setProducts([]);
      setOrders([]);
    }).finally(() => setLoading(false));

    const savedUser = localStorage.getItem("user");
    if (savedUser && savedUser !== "undefined") {
      try {
        const user = JSON.parse(savedUser);
        setUserName(user.name || user.username || "bạn");
      } catch {
        localStorage.removeItem("user");
      }
    }
  }, [router]);

  const totalStock = useMemo(() => products.reduce((total, product) => total + (product.variants?.reduce((sum, variant) => sum + variant.stock, 0) || 0), 0), [products]);
  const lowStock = products.filter((product) => (product.variants?.reduce((sum, variant) => sum + variant.stock, 0) || 0) <= 10);
  const pendingOrders = orders.filter((order) => order.status === "pending").length;
  const completedOrders = orders.filter((order) => order.status === "completed").length;
  const chartEntries = Object.entries(monthlyRevenue).slice(-8);
  const chartMax = Math.max(...chartEntries.map(([, amount]) => amount), 1);

  return (
    <AdminShell>
      <div className="mx-auto max-w-[1500px]">
        <section className="relative mb-8 overflow-hidden rounded-[2rem] bg-neutral-950 px-7 py-9 text-white shadow-xl shadow-neutral-900/10 md:px-10 md:py-12">
          <div className="relative z-10 max-w-2xl">
            <p className="mb-4 flex items-center gap-2 text-[10px] uppercase tracking-[0.35em] text-neutral-400"><Sparkles size={13} /> Command center</p>
            <h1 className="text-3xl font-light tracking-tight md:text-5xl">Chào buổi sáng, {userName}.</h1>
            <p className="mt-4 max-w-lg text-sm leading-6 text-neutral-400">Theo dõi doanh thu, đơn hàng và tình trạng kho của HyperLane từ một nơi.</p>
          </div>
          <div className="absolute -right-16 -top-28 h-72 w-72 rounded-full border border-white/10" />
          <div className="absolute -bottom-40 right-12 h-80 w-80 rounded-full border border-white/10" />
        </section>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Doanh thu", value: `${revenue.toLocaleString("vi-VN")}₫`, note: "Từ đơn hoàn thành", icon: Wallet, accent: "text-emerald-600" },
            { label: "Đơn hàng", value: orders.length, note: `${pendingOrders} đơn chờ xử lý`, icon: ShoppingBag, accent: "text-blue-600" },
            { label: "Tồn kho", value: totalStock, note: "Đơn vị đang sẵn sàng", icon: Package, accent: "text-orange-600" },
            { label: "Sản phẩm", value: products.length, note: `${completedOrders} đơn đã hoàn tất`, icon: BarChart3, accent: "text-violet-600" },
          ].map(({ label, value, note, icon: Icon, accent }) => (
            <div key={label} className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-[#171717]">
              <div className="flex items-start justify-between"><span className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">{label}</span><Icon size={19} strokeWidth={1.5} className={accent} /></div>
              <p className="mt-7 text-3xl font-light tracking-tight">{loading ? "—" : value}</p>
              <p className="mt-2 text-xs text-neutral-400">{note}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-[1.35fr_0.65fr]">
          <section className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-[#171717] md:p-8">
            <div className="mb-8 flex items-end justify-between">
              <div><p className="text-[10px] uppercase tracking-[0.25em] text-neutral-400">Business overview</p><h2 className="mt-2 text-2xl font-light">Doanh thu theo tháng</h2></div>
              <span className="hidden text-xs text-neutral-400 sm:block">8 tháng gần nhất</span>
            </div>
            {chartEntries.length === 0 ? <div className="flex h-56 items-center justify-center text-sm text-neutral-400">Chưa có dữ liệu doanh thu.</div> : <div className="flex h-56 items-end gap-3 border-b border-neutral-200 dark:border-neutral-800">{chartEntries.map(([month, amount]) => <div key={month} className="group flex h-full flex-1 flex-col items-center justify-end gap-3"><div className="relative w-full max-w-12 rounded-t-lg bg-neutral-900 transition-all group-hover:bg-neutral-600 dark:bg-white dark:group-hover:bg-neutral-300" style={{ height: `${Math.max(5, (amount / chartMax) * 100)}%` }}><span className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-neutral-900 px-2 py-1 text-[10px] text-white group-hover:block dark:bg-white dark:text-black">{amount.toLocaleString("vi-VN")}₫</span></div><span className="text-[10px] text-neutral-400">{month.slice(5)}</span></div>)}</div>}
            <div className="mt-5 flex items-center justify-between text-xs text-neutral-400"><span>Tổng doanh thu</span><strong className="font-medium text-neutral-900 dark:text-white">{revenue.toLocaleString("vi-VN")}₫</strong></div>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-[#171717] md:p-8">
            <div className="mb-7 flex items-start justify-between"><div><p className="text-[10px] uppercase tracking-[0.25em] text-neutral-400">Inventory</p><h2 className="mt-2 text-2xl font-light">Cần chú ý</h2></div><AlertTriangle size={19} className="text-orange-500" /></div>
            {lowStock.length === 0 ? <div className="py-8 text-center"><CheckCircle2 className="mx-auto text-emerald-500" size={28} /><p className="mt-3 text-sm text-neutral-500">Kho hàng đang ổn định.</p></div> : <div className="space-y-4">{lowStock.slice(0, 4).map((product) => { const stock = product.variants?.reduce((sum, variant) => sum + variant.stock, 0) || 0; return <Link href={`/admin/products/edit/${product.id}`} key={product.id} className="flex items-center justify-between border-b border-neutral-100 pb-4 transition hover:translate-x-1 dark:border-neutral-800"><div><p className="text-sm">{product.name}</p><p className="mt-1 text-xs text-neutral-400">{product.category?.name || "Chưa phân loại"}</p></div><span className={`text-sm font-medium ${stock === 0 ? "text-red-500" : "text-orange-500"}`}>{stock} sp</span></Link>; })}</div>}
            <Link href="/admin/products" className="mt-6 flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-neutral-400 hover:text-black dark:hover:text-white">Quản lý sản phẩm <ArrowUpRight size={14} /></Link>
          </section>
        </div>

        <section className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-[#171717] md:p-8">
          <div className="mb-6 flex items-center justify-between"><div><p className="text-[10px] uppercase tracking-[0.25em] text-neutral-400">Latest activity</p><h2 className="mt-2 text-2xl font-light">Đơn hàng gần đây</h2></div><Link href="/admin/orders" className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-neutral-400 hover:text-black dark:hover:text-white">Xem tất cả <ArrowUpRight size={14} /></Link></div>
          {orders.length === 0 ? <p className="py-8 text-sm text-neutral-400">Chưa có đơn hàng nào.</p> : <div className="grid gap-3 md:grid-cols-3">{orders.slice(0, 3).map((order) => <Link href="/admin/orders" key={order.id} className="rounded-xl border border-neutral-100 p-4 transition hover:border-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-600"><div className="flex justify-between gap-3"><span className="text-xs font-medium">#{order.id}</span><span className="text-[10px] text-neutral-400">{new Date(order.createdAt).toLocaleDateString("vi-VN")}</span></div><p className="mt-5 truncate text-sm">{order.shippingName || "Khách hàng"}</p><div className="mt-3 flex items-center justify-between"><span className="text-xs text-neutral-500">{statusLabels[order.status] || order.status}</span><strong className="text-sm">{Number(order.total).toLocaleString("vi-VN")}₫</strong></div></Link>)}</div>}
        </section>
      </div>
    </AdminShell>
  );
}
