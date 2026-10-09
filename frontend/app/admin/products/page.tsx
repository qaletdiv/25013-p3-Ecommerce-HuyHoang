"use client";

import Link from "next/link";
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

  const load = async () => {
    const res = await fetch(`${API}/api/products`, { cache: "no-store" });
    setProducts(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    load();
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
      return 0;
    });

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Xóa sản phẩm "${name}"?`)) return;
    const token = localStorage.getItem("token");
    const res = await fetch(`${API}/api/products/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      alert("Đã xóa");
    } else {
      alert("Xóa thất bại: " + (await res.json()).message);
    }
  };

  if (loading) return <AdminShell><main className="max-w-7xl py-16">Đang tải...</main></AdminShell>;

  return (
    <AdminShell>
    <main className="mx-auto max-w-[1500px]">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-4xl font-light">Quản Lý Sản Phẩm</h1>
        <Link href="/admin/products/create" className="px-5 py-3 bg-black text-white">
          Thêm sản phẩm
        </Link>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Tìm sản phẩm..."
          className="border px-3 py-2"
        />
        <select value={category} onChange={(event) => setCategory(event.target.value)} className="border px-3 py-2">
          <option value="all">Tất cả danh mục</option>
          {categories.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
        </select>
        <select value={stockFilter} onChange={(event) => setStockFilter(event.target.value)} className="border px-3 py-2">
          <option value="all">Tất cả tồn kho</option>
          <option value="out">Hết hàng</option>
          <option value="low">Sắp hết (1 - 10)</option>
        </select>
        <select value={sort} onChange={(event) => setSort(event.target.value)} className="border px-3 py-2">
          <option value="default">Sắp xếp mặc định</option>
          <option value="name">Tên A - Z</option>
          <option value="price-low">Giá thấp đến cao</option>
          <option value="price-high">Giá cao đến thấp</option>
        </select>
      </div>

      <div className="overflow-x-auto border">
        <table className="w-full">
          <thead className="bg-neutral-100">
            <tr>
              <th className="text-left p-4">ID</th>
              <th className="text-left p-4">Hình ảnh</th>
              <th className="text-left p-4">Tên sản phẩm</th>
              <th className="text-left p-4">Danh mục</th>
              <th className="text-left p-4">Giá thấp nhất</th>
              <th className="text-left p-4">Tồn kho</th>
              <th className="text-center p-4">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => {
              const minPrice =
                product.variants?.length
                  ? Math.min(...product.variants.map((v) => v.price))
                  : 0;
              const totalStock =
                product.variants?.reduce((total, variant) => total + variant.stock, 0) || 0;
              return (
                <tr key={product.id} className="border-t">
                  <td className="p-4">{product.id}</td>
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
                  <td className="p-4">{product.name}</td>
                  <td className="p-4">{product.category?.name}</td>
                  <td className="p-4">{formatPrice(minPrice)}</td>
                  <td className={`p-4 font-medium ${totalStock === 0 ? "text-red-500" : totalStock <= 10 ? "text-orange-500" : "text-green-600"}`}>
                    {totalStock}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-4">
                      <Link
                        href={`/admin/products/edit/${product.id}`}
                        className="text-blue-500 hover:underline"
                      >
                        Sửa
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        className="text-red-500 hover:underline"
                      >
                        Xóa
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
    </main>
    </AdminShell>
  );
}
