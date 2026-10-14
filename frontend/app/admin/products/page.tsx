"use client";

import Link from "next/link";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Product } from "../../types/types";
import AdminShell from "../components/AdminShell";

const API = process.env.NEXT_PUBLIC_API_BASE;

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("default");
  const [stockFilter, setStockFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API}/api/products/admin`, { cache: "no-store", headers: { Authorization: `Bearer ${token}` } })
      .then((response) => response.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN").format(price) + "₫";

  const categories = [...new Map(
    products
      .filter((product) => product.category)
      .map((product) => [String(product.categoryId), product.category.name])
  )];
  const filteredProducts = products
    .filter((product) => product.name.toLowerCase().includes(search.toLowerCase()))
    .filter((product) => category === "all" || String(product.categoryId) === category)
    .filter((product) => {
      const stock = product.variants?.reduce((total, variant) => total + variant.stock, 0) || 0;
      return stockFilter === "all" || (stockFilter === "out" ? stock === 0 : stock > 0 && stock <= 10);
    })
    .sort((a, b) => {
      const priceA = a.variants?.length ? Math.min(...a.variants.map((variant) => variant.price)) : 0;
      const priceB = b.variants?.length ? Math.min(...b.variants.map((variant) => variant.price)) : 0;
      if (sort === "price-low") return priceA - priceB;
      if (sort === "price-high") return priceB - priceA;
      if (sort === "name") return a.name.localeCompare(b.name, "vi");
      return (new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()) || Number(b.id) - Number(a.id);
    });

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const paginatedProducts = filteredProducts.slice((page - 1) * pageSize, page * pageSize);

  const handleVisibility = async (product: Product) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API}/api/products/${product.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ hidden: !product.hidden }),
    });
    if (res.ok) {
      setProducts((prev) => prev.map((item) => item.id === product.id ? { ...item, hidden: !product.hidden } : item));
    } else {
      alert("Kh�ng th? thay d?i tr?ng th�i s?n ph?m");
    }
  };

  if (loading) return <AdminShell><main className="max-w-7xl py-16">Đang tải...</main></AdminShell>;

  return (
    <AdminShell>
    <main className="mx-auto max-w-[1500px]">
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-neutral-400">Catalogue studio</p>
          <h1 className="text-4xl font-light tracking-tight">Quản Lý Sản Phẩm</h1>
          <p className="mt-3 text-sm text-neutral-500">{products.length} sản phẩm trong catalogue</p>
        </div>
        <Link href="/admin/products/create" className="inline-flex items-center justify-center rounded-full bg-neutral-900 px-5 py-3 text-xs uppercase tracking-[0.15em] text-white transition hover:bg-neutral-700 dark:bg-white dark:text-black">
          + Thêm sản phẩm
        </Link>
      </div>

      <div className="mb-8 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-[#171717]">
        <div className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-neutral-400">
          <SlidersHorizontal size={14} /> Bộ lọc sản phẩm
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={17} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm theo tên sản phẩm..."
              aria-label="Tìm sản phẩm"
              className="h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-10 pr-10 text-sm outline-none transition duration-200 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-neutral-900 focus:bg-white focus:ring-4 focus:ring-neutral-900/5 active:scale-[0.995] dark:border-neutral-700 dark:bg-[#151515] dark:hover:border-neutral-600 dark:focus:border-white dark:focus:bg-[#151515]"
            />
            {search && <button type="button" onClick={() => setSearch("")} aria-label="Xóa tìm kiếm" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-neutral-400 transition hover:bg-neutral-200 hover:text-black active:scale-90 dark:hover:bg-neutral-700 dark:hover:text-white"><X size={16} /></button>}
          </div>
          <FilterSelect label="Danh mục" value={category} onChange={setCategory}>
            <option value="all">Tất cả danh mục</option>
            {categories.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
          </FilterSelect>
          <FilterSelect label="Tồn kho" value={stockFilter} onChange={setStockFilter}>
            <option value="all">Tất cả tồn kho</option>
            <option value="out">Hết hàng</option>
            <option value="low">Sắp hết (1 - 10)</option>
          </FilterSelect>
          <FilterSelect label="Sắp xếp" value={sort} onChange={setSort}>
            <option value="default">Mặc định</option>
            <option value="name">Tên A - Z</option>
            <option value="price-low">Giá thấp đến cao</option>
            <option value="price-high">Giá cao đến thấp</option>
          </FilterSelect>
        </div>
        {(search || category !== "all" || stockFilter !== "all" || sort !== "default") && (
          <button type="button" onClick={() => { setSearch(""); setCategory("all"); setStockFilter("all"); setSort("default"); }} className="mt-4 rounded-full border border-neutral-200 px-3 py-1.5 text-xs text-neutral-500 transition hover:border-black hover:text-black active:scale-95 dark:border-neutral-700 dark:hover:border-white dark:hover:text-white">Xóa tất cả bộ lọc</button>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-[#171717]">
        <table className="w-full">
          <thead className="bg-neutral-50 dark:bg-[#1d1d1d]">
            <tr>
              <th className="text-left p-4">STT</th>
              <th className="text-left p-4">Hình ảnh</th>
              <th className="text-left p-4">Tên sản phẩm</th>
              <th className="text-left p-4">Danh mục</th>
              <th className="text-left p-4">Giá thấp nhất</th>
              <th className="text-left p-4">Tồn kho</th>
              <th className="text-center p-4">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.map((product, index) => {
              const minPrice =
                product.variants?.length
                  ? Math.min(...product.variants.map((v) => v.price))
                  : 0;
              const totalStock =
                product.variants?.reduce((total, variant) => total + variant.stock, 0) || 0;
              return (
                <tr key={product.id} className={`border-t border-neutral-100 transition hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800/40 ${product.hidden ? "opacity-60" : ""}`}>
                  <td className="p-4 text-sm text-neutral-400">{(page - 1) * pageSize + index + 1}</td>
                  <td className="p-4">
                    {product.thumbnail ? (
                      <img
                        src={product.thumbnail}
                        alt={product.name}
                        className="h-14 w-14 rounded-lg object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-neutral-100 text-[9px] uppercase text-neutral-400 dark:bg-neutral-800">
                        No image
                      </div>
                    )}
                  </td>
                  <td className="p-4"><p className="font-medium">{product.name}</p><p className="mt-1 text-xs text-neutral-400">/{product.slug}</p></td>
                  <td className="p-4"><span className="rounded-full bg-neutral-100 px-3 py-1 text-xs dark:bg-neutral-800">{product.category?.name || "Chưa phân loại"}</span>{product.hidden && <span className="ml-2 rounded-full bg-orange-100 px-3 py-1 text-xs text-orange-700">Đang ẩn</span>}</td>
                  <td className="p-4 font-medium">{formatPrice(minPrice)}</td>
                  <td className={`p-4 font-medium ${totalStock === 0 ? "text-red-500" : totalStock <= 10 ? "text-orange-500" : "text-green-600"}`}>
                    {totalStock}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <Link
                        href={`/admin/products/edit/${product.id}`}
                        className="rounded-full border border-neutral-200 px-3 py-1.5 text-xs text-neutral-600 hover:border-black hover:text-black dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-white dark:hover:text-white"
                      >
                        Sửa
                      </Link>
                      <button
                        onClick={() => handleVisibility(product)}
                        className="rounded-full border border-orange-200 px-3 py-1.5 text-xs text-orange-600 hover:bg-orange-50 dark:border-orange-950 dark:hover:bg-orange-950/30"
                      >
                        {product.hidden ? "Hiện" : "Ẩn"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredProducts.length === 0 && <p className="p-8 text-center text-neutral-500">Không tìm thấy sản phẩm phù hợp.</p>}
      </div>
      {totalPages > 1 && <div className="mt-5 flex items-center justify-between text-sm"><span className="text-neutral-500">Trang {page} / {totalPages}</span><div className="flex gap-2"><button disabled={page === 1} onClick={() => setPage((value) => value - 1)} className="rounded-lg border px-3 py-2 disabled:opacity-40">Trước</button><button disabled={page === totalPages} onClick={() => setPage((value) => value + 1)} className="rounded-lg border px-3 py-2 disabled:opacity-40">Sau</button></div></div>}
    </main>
    </AdminShell>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="relative block">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
        className="h-11 w-full appearance-none rounded-xl border border-neutral-200 bg-neutral-50 px-3 pr-10 text-sm outline-none transition duration-200 hover:border-neutral-300 focus:border-neutral-900 focus:bg-white focus:ring-4 focus:ring-neutral-900/5 active:scale-[0.98] dark:border-neutral-700 dark:bg-[#151515] dark:hover:border-neutral-600 dark:focus:border-white dark:focus:bg-[#151515]"
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
    </label>
  );
}
