"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AdminShell from "../../components/AdminShell";

const API = process.env.NEXT_PUBLIC_API_BASE;

type VariantRow = { size: string; color: string; price: string; stock: string };
type ProductOptions = { sizes: string[]; colors: string[] };
type CategoryOption = { id: number; name: string };

export default function AdminProductCreatePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [images, setImages] = useState("");
  const [specs, setSpecs] = useState("");
  const [hot, setHot] = useState(false);
  const [variants, setVariants] = useState<VariantRow[]>([
    { size: "", color: "", price: "0", stock: "0" },
  ]);
  const [options, setOptions] = useState<ProductOptions>({ sizes: [], colors: [] });
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/categories`)
      .then((response) => response.json())
      .then((data: CategoryOption[]) => {
        setCategories(data);
        if (data[0]) setCategoryId(String(data[0].id));
      })
      .catch(() => setError("Không thể tải danh sách danh mục"));
  }, []);

  useEffect(() => {
    fetch(`${API}/api/products/options`)
      .then((response) => {
        if (!response.ok) throw new Error("Không thể tải danh sách biến thể");
        return response.json();
      })
      .then((data: { sizes?: Array<{ name: string }>; colors?: Array<{ name: string }> }) => {
        setOptions({
          sizes: (data.sizes || []).map((item) => item.name),
          colors: (data.colors || []).map((item) => item.name),
        });
      })
      .catch(() => setError("Không thể tải danh sách size và màu từ cơ sở dữ liệu"));
  }, []);

  const updateVariant = (i: number, field: keyof VariantRow, value: string) => {
    setVariants((prev) => prev.map((v, idx) => (idx === i ? { ...v, [field]: value } : v)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    const token = localStorage.getItem("token");
    const payload = {
      name,
      slug,
      categoryId,
      description,
      thumbnail,
      images: images
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      specs: specs
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      hot,
      variants: variants.map((v) => ({
        size: v.size,
        color: v.color,
        price: Number(v.price),
        stock: Number(v.stock),
      })),
    };
    const res = await fetch(`${API}/api/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (res.ok) {
      router.push("/admin/products");
    } else {
      const data = await res.json();
      setError(data.message || "Tạo thất bại");
    }
  };

  return (
    <AdminShell>
    <main className="mx-auto max-w-4xl">
      <div className="mb-10">
        <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-neutral-400">Catalogue studio</p>
        <h1 className="text-4xl font-light tracking-tight">Thêm Sản Phẩm</h1>
        <p className="mt-3 text-sm text-neutral-500">Tạo sản phẩm mới và cấu hình các biến thể trong một bước.</p>
      </div>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-[#171717] sm:p-8">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Tên" value={name} onChange={setName} required />
          <Field label="Slug" value={slug} onChange={setSlug} required />
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label htmlFor="product-category" className="block text-sm">Danh mục <span className="text-red-500">*</span></label>
            <Link href="/admin/categories" className="text-xs text-blue-500 hover:underline">Quản lý danh mục</Link>
          </div>
          <select
            id="product-category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full border px-3 py-2 dark:border-neutral-700 dark:bg-[#151515]"
            required
          >
            <option value="">Chọn danh mục</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Mô tả</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border px-3 py-2 outline-none transition focus:border-black focus:ring-2 focus:ring-black/5 dark:border-neutral-700 dark:bg-[#151515] dark:focus:border-white"
            rows={3}
          />
        </div>
        <Field label="Ảnh đại diện (URL)" value={thumbnail} onChange={setThumbnail} />
        {thumbnail && (
          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800">
            <img
              src={thumbnail}
              alt="Xem trước ảnh đại diện"
              className="h-64 w-full object-contain"
            />
          </div>
        )}
        <div>
          <label className="block text-sm mb-1">Các ảnh (mỗi dòng 1 URL)</label>
          <textarea
            value={images}
            onChange={(e) => setImages(e.target.value)}
            className="w-full border px-3 py-2"
            rows={3}
          />
        </div>
        {images.split("\n").map((image) => image.trim()).filter(Boolean).length > 0 && (
          <div className="grid grid-cols-4 gap-3">
            {images.split("\n").map((image) => image.trim()).filter(Boolean).map((image) => (
              <img
                key={image}
                src={image}
                alt="Ảnh sản phẩm"
                className="h-24 w-full rounded-lg border border-neutral-200 object-cover dark:border-neutral-700"
              />
            ))}
          </div>
        )}
        <div>
          <label className="block text-sm mb-1">Thông số (mỗi dòng 1 dòng text)</label>
          <textarea
            value={specs}
            onChange={(e) => setSpecs(e.target.value)}
            className="w-full border px-3 py-2"
            rows={3}
          />
        </div>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={hot} onChange={(e) => setHot(e.target.checked)} />
          Sản phẩm nổi bật
        </label>

        <div>
          <p className="text-sm mb-2 font-medium">Biến thể (size / màu / giá / tồn kho)</p>
          {variants.map((v, i) => (
            <div key={i} className="flex gap-2 mb-2 items-center">
              <select
                value={v.size}
                onChange={(e) => updateVariant(i, "size", e.target.value)}
                className="w-20 border px-2 py-1"
                required
              >
                <option value="">Size</option>
                {options.sizes.map((size) => <option key={size} value={size}>{size}</option>)}
              </select>
              <select
                value={v.color}
                onChange={(e) => updateVariant(i, "color", e.target.value)}
                className="w-28 border px-2 py-1"
                required
              >
                <option value="">Màu</option>
                {options.colors.map((color) => <option key={color} value={color}>{color}</option>)}
              </select>
              <input
                placeholder="Giá"
                value={v.price}
                onChange={(e) => updateVariant(i, "price", e.target.value)}
                className="w-28 border px-2 py-1"
                type="number"
              />
              <input
                placeholder="Tồn kho"
                value={v.stock}
                onChange={(e) => updateVariant(i, "stock", e.target.value)}
                className="w-24 border px-2 py-1"
                type="number"
              />
              <button
                type="button"
                onClick={() => setVariants((prev) => prev.filter((_, idx) => idx !== i))}
                className="text-red-500 text-sm"
              >
                Xóa
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setVariants((prev) => [
                ...prev,
                { size: "", color: "", price: "0", stock: "0" },
              ])
            }
            className="text-blue-500 text-sm"
          >
            + Thêm biến thể
          </button>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-black text-white py-3 uppercase disabled:opacity-50"
        >
          {saving ? "Đang lưu..." : "Tạo sản phẩm"}
        </button>
      </form>
    </main>
    </AdminShell>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm mb-1">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border px-3 py-2"
      />
    </div>
  );
}
