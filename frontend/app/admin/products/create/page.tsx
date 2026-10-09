"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import AdminShell from "../../components/AdminShell";

const API = process.env.NEXT_PUBLIC_API_BASE;

type VariantRow = { size: string; color: string; price: string; stock: string };

export default function AdminProductCreatePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState("1");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [images, setImages] = useState("");
  const [specs, setSpecs] = useState("");
  const [hot, setHot] = useState(false);
  const [variants, setVariants] = useState<VariantRow[]>([
    { size: "M", color: "Đen", price: "0", stock: "0" },
  ]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

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
    <main className="mx-auto max-w-3xl">
      <h1 className="text-4xl font-light mb-10">Thêm Sản Phẩm</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Tên" value={name} onChange={setName} required />
          <Field label="Slug" value={slug} onChange={setSlug} required />
        </div>
        <div>
          <label className="block text-sm mb-1">Danh mục</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full border px-3 py-2"
          >
            <option value="1">Thời trang nam</option>
            <option value="2">Thời trang nữ</option>
            <option value="3">Phụ kiện</option>
            <option value="4">Giày dép</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Mô tả</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border px-3 py-2"
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
              <input
                placeholder="Size"
                value={v.size}
                onChange={(e) => updateVariant(i, "size", e.target.value)}
                className="w-20 border px-2 py-1"
              />
              <input
                placeholder="Màu"
                value={v.color}
                onChange={(e) => updateVariant(i, "color", e.target.value)}
                className="w-28 border px-2 py-1"
              />
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
