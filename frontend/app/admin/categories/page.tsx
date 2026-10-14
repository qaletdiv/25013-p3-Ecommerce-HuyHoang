"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AdminShell from "../components/AdminShell";

const API = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001";

type Product = { id: string; name: string; slug: string };
type Category = { id: number; name: string; slug: string; products?: Product[] };

const slugify = (value: string) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadCategories = async () => {
    const response = await fetch(`${API}/api/categories`, { cache: "no-store" });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(data?.message || `Không thể tải danh mục (HTTP ${response.status})`);
    }
    if (!Array.isArray(data)) throw new Error("Dữ liệu danh mục từ máy chủ không hợp lệ");
    setCategories(data);
    setLoading(false);
  };

  const fetchCategories = () => {
    setLoading(true);
    setError("");
    loadCategories()
      .catch((loadError: Error) => setError(
        loadError instanceof TypeError
          ? "Không thể kết nối máy chủ API. Hãy kiểm tra backend đang chạy tại " + API
          : loadError.message
      ))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetch(`${API}/api/categories`, { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(data?.message || `Không thể tải danh mục (HTTP ${response.status})`);
        }
        if (!Array.isArray(data)) throw new Error("Dữ liệu danh mục từ máy chủ không hợp lệ");
        return data as Category[];
      })
      .then((data) => {
        setCategories(data);
        setLoading(false);
      })
      .catch((loadError: Error) => {
        setError(
          loadError instanceof TypeError
            ? "Không thể kết nối máy chủ API. Hãy kiểm tra backend đang chạy tại " + API
            : loadError.message
        );
        setLoading(false);
      });
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setSlug("");
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSaving(true);
    const token = localStorage.getItem("token");
    const response = await fetch(`${API}/api/categories${editingId ? `/${editingId}` : ""}`, {
      method: editingId ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + (token || ""),
      },
      body: JSON.stringify({ name, slug: slug || slugify(name) }),
    });
    setSaving(false);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.message || "Không thể lưu danh mục");
      return;
    }
    resetForm();
    await loadCategories();
  };

  const remove = async (category: Category) => {
    if (!confirm("Xóa danh mục \"" + category.name + "\"? Sản phẩm liên kết có thể bị ảnh hưởng.")) return;
    const token = localStorage.getItem("token");
    const response = await fetch(API + "/api/categories/" + category.id, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + (token || "") },
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.message || "Không thể xóa danh mục");
      return;
    }
    await loadCategories();
  };

  if (loading) return <AdminShell><main className="mx-auto max-w-6xl">Đang tải danh mục...</main></AdminShell>;

  return (
    <AdminShell>
      <main className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-neutral-400">Catalog studio</p>
            <h1 className="text-4xl font-light tracking-tight">Quản Lý Danh Mục</h1>
            <p className="mt-3 text-sm text-neutral-500">Tổ chức sản phẩm theo nhóm để catalogue dễ quản lý hơn.</p>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white px-5 py-3 dark:border-neutral-800 dark:bg-[#171717]">
            <p className="text-[10px] uppercase tracking-[0.18em] text-neutral-400">Tổng danh mục</p>
            <p className="mt-1 text-2xl font-light">{categories.length}</p>
          </div>
        </div>
        {error && (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-950 dark:bg-red-950/20 dark:text-red-300">
            <span>{error}</span>
            <button type="button" onClick={fetchCategories} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium hover:bg-red-100 dark:border-red-900 dark:hover:bg-red-950/40">Thử lại</button>
          </div>
        )}
        <form onSubmit={submit} className="mb-10 max-w-4xl space-y-5 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-[#171717]">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm">
              Tên danh mục <span className="text-red-500">*</span>
              <input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Ví dụ: Thời trang nam" className="mt-1 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 outline-none transition duration-200 hover:border-neutral-300 focus:border-neutral-900 focus:bg-white focus:ring-4 focus:ring-neutral-900/5 active:scale-[0.995] dark:border-neutral-700 dark:bg-[#151515] dark:hover:border-neutral-600 dark:focus:border-white dark:focus:bg-[#151515]" />
            </label>
            <label className="block text-sm">
              Slug
              <input value={slug} onChange={(event) => setSlug(event.target.value)} placeholder="Tự tạo nếu bỏ trống" className="mt-1 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 outline-none transition duration-200 hover:border-neutral-300 focus:border-neutral-900 focus:bg-white focus:ring-4 focus:ring-neutral-900/5 active:scale-[0.995] dark:border-neutral-700 dark:bg-[#151515] dark:hover:border-neutral-600 dark:focus:border-white dark:focus:bg-[#151515]" />
            </label>
          </div>
          <div className="flex gap-3">
            <button disabled={saving} className="rounded-xl bg-neutral-900 px-5 py-3 text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-neutral-700 hover:shadow-md active:translate-y-0 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200">{saving ? "Đang lưu..." : editingId ? "Cập nhật danh mục" : "Thêm danh mục"}</button>
            {editingId && <button type="button" onClick={resetForm} className="rounded-xl border border-neutral-200 px-5 py-3 transition hover:bg-neutral-100 active:scale-95 dark:border-neutral-700 dark:hover:bg-neutral-800">Hủy</button>}
          </div>
        </form>
        <div className="grid gap-5 md:grid-cols-2">
          {categories.map((category) => (
            <section key={category.id} className="rounded-2xl border border-neutral-200 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-neutral-200/50 dark:border-neutral-800 dark:bg-[#171717] dark:hover:shadow-black/20">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl">{category.name}</h2>
                  <p className="mt-1 text-xs text-neutral-400">/{category.slug}</p>
                </div>
                <div className="flex gap-2 text-xs">
                  <button onClick={() => { setEditingId(category.id); setName(category.name); setSlug(category.slug); }} className="rounded-full border border-neutral-200 px-3 py-1.5 text-neutral-600 transition duration-200 hover:-translate-y-0.5 hover:border-black hover:text-black hover:shadow-sm active:translate-y-0 active:scale-95 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-white dark:hover:text-white">Sửa</button>
                  <button onClick={() => remove(category)} className="rounded-full border border-red-100 px-3 py-1.5 text-red-500 transition duration-200 hover:-translate-y-0.5 hover:bg-red-50 hover:shadow-sm active:translate-y-0 active:scale-95 dark:border-red-950 dark:hover:bg-red-950/30">Xóa</button>
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-neutral-100 pt-4 text-xs dark:border-neutral-800">
                <span className="text-neutral-400">{category.products?.length || 0} sản phẩm liên kết</span>
                <Link href={`/admin/products?category=${category.id}`} className="rounded-full px-2 py-1 text-neutral-500 transition hover:bg-neutral-100 hover:text-black active:scale-95 dark:hover:bg-neutral-800 dark:hover:text-white">Xem sản phẩm →</Link>
              </div>
              <div className="mt-3 border-t border-neutral-100 pt-1 dark:border-neutral-800">
                {category.products?.length ? category.products.map((product) => (
                  <Link key={product.id} href={`/admin/products/edit/${product.id}`} className="group flex items-center justify-between border-b border-neutral-100 py-2 text-sm transition hover:pl-2 hover:text-neutral-600 last:border-0 dark:border-neutral-800 dark:hover:text-white"><span>{product.name}</span><span className="translate-x-1 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100">→</span></Link>
                )) : <p className="text-sm text-neutral-400">Chưa có sản phẩm liên kết.</p>}
              </div>
            </section>
          ))}
        </div>
      </main>
    </AdminShell>
  );
}
