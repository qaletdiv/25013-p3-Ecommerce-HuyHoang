"use client";

import Link from "next/link";
import { ArrowUpRight, Package, ShoppingBag, TrendingUp, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import AdminShell from "./components/AdminShell";
import { Product } from "../types/types";

const API = process.env.NEXT_PUBLIC_API_BASE;

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [userName, setUserName] = useState("bạn");

  useEffect(() => {
    fetch(`${API}/api/products`).then((res) => res.json()).then(setProducts).catch(() => setProducts([]));
    const savedUser = localStorage.getItem("user");
    if (savedUser && savedUser !== "undefined") {
      try {
        const user = JSON.parse(savedUser);
        setUserName(user.name || user.username || "bạn");
      } catch {
        localStorage.removeItem("user");
      }
    }
  }, []);

  const totalStock = useMemo(() => products.reduce((total, product) => total + (product.variants?.reduce((sum, variant) => sum + variant.stock, 0) || 0), 0), [products]);
  const lowStock = products.filter((product) => (product.variants?.reduce((sum, variant) => sum + variant.stock, 0) || 0) <= 10);
  const featured = products.filter((product) => product.hot).length;

  return (
    <AdminShell>
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div><p className="mb-3 text-[10px] uppercase tracking-[0.35em] text-neutral-400">Command center</p><h1 className="text-4xl font-light tracking-tight lg:text-5xl">Chào buổi sáng, {userName}.</h1><p className="mt-3 text-sm text-neutral-500">Đây là những gì đang diễn ra với HyperLane hôm nay.</p></div>
          <Link href="/admin/products/create" className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-5 py-3 text-xs uppercase tracking-[0.15em] text-white transition hover:bg-neutral-700 dark:bg-white dark:text-black">Thêm sản phẩm <ArrowUpRight size={15} /></Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Tổng sản phẩm", value: products.length, note: "Trong catalogue", icon: ShoppingBag },
            { label: "Tồn kho", value: totalStock, note: "Đơn vị đang sẵn sàng", icon: Package },
            { label: "Sản phẩm nổi bật", value: featured, note: "Đang được ưu tiên", icon: TrendingUp },
            { label: "Khách hàng", value: "—", note: "Kết nối dữ liệu sớm", icon: Users },
          ].map(({ label, value, note, icon: Icon }) => <div key={label} className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-[#171717]"><div className="mb-8 flex items-center justify-between"><span className="text-xs uppercase tracking-[0.18em] text-neutral-400">{label}</span><Icon size={19} strokeWidth={1.4} className="text-neutral-400" /></div><p className="text-4xl font-light">{value}</p><p className="mt-2 text-xs text-neutral-400">{note}</p></div>)}
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-[1.4fr_1fr]">
          <section className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-[#171717]">
            <div className="mb-8 flex items-center justify-between"><div><p className="text-[10px] uppercase tracking-[0.25em] text-neutral-400">Hiệu suất</p><h2 className="mt-2 text-xl font-light">Hoạt động catalogue</h2></div><span className="rounded-full bg-green-50 px-3 py-1 text-xs text-green-700 dark:bg-green-950/40 dark:text-green-400">Đang hoạt động</span></div>
            <div className="flex h-48 items-end gap-2 border-b border-neutral-200 pb-0 dark:border-neutral-800">{[35, 48, 42, 65, 52, 76, 68, 88, 72, 95, 82, 100].map((height, index) => <div key={index} className="group flex h-full flex-1 items-end"><div style={{ height: `${height}%` }} className="w-full rounded-t-sm bg-neutral-200 transition group-hover:bg-black dark:bg-neutral-700 dark:group-hover:bg-white" /></div>)}</div>
            <div className="mt-4 flex justify-between text-[10px] uppercase tracking-wider text-neutral-400"><span>Tháng 1</span><span>Tháng 12</span></div>
          </section>
          <section className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-[#171717]"><div className="mb-6 flex items-center justify-between"><div><p className="text-[10px] uppercase tracking-[0.25em] text-neutral-400">Cần chú ý</p><h2 className="mt-2 text-xl font-light">Tồn kho thấp</h2></div><Link href="/admin/products" className="text-xs text-neutral-400 hover:text-black dark:hover:text-white">Xem tất cả</Link></div>{lowStock.length === 0 ? <p className="py-10 text-sm text-neutral-400">Tất cả sản phẩm đều đủ hàng.</p> : <div className="space-y-4">{lowStock.slice(0, 4).map((product) => { const stock = product.variants?.reduce((sum, variant) => sum + variant.stock, 0) || 0; return <Link href={`/admin/products/edit/${product.id}`} key={product.id} className="flex items-center justify-between border-b border-neutral-100 pb-4 dark:border-neutral-800"><div><p className="text-sm">{product.name}</p><p className="mt-1 text-xs text-neutral-400">{product.category?.name || "Chưa phân loại"}</p></div><span className={`text-sm ${stock === 0 ? "text-red-500" : "text-orange-500"}`}>{stock} sp</span></Link> })}</div>}</section>
        </div>
      </div>
    </AdminShell>
  );
}
