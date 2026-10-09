"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AdminShell from "../../../components/AdminShell";

const API = process.env.NEXT_PUBLIC_API_BASE;

type VariantRow = { id?: number; size: string; color: string; price: string; stock: string };

export default function AdminProductEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState("1");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [images, setImages] = useState("");
  const [specs, setSpecs] = useState("");
  const [hot, setHot] = useState(false);
  const [variants, setVariants] = useState<VariantRow[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  useEffect(() => {
    if (!id) return;
    // lấy sản phẩm theo id qua danh sách
    fetch(`${API}/api/products`, { cache: "no-store" })
      .then((r) => r.json())
      .then((list: any[]) => {
        const prod = list.find((p) => String(p.id) === id);
        if (prod) {
          setName(prod.name);
          setSlug(prod.slug);
          setCategoryId(prod.categoryId);
          setDescription(prod.description || "");
          setThumbnail(prod.thumbnail || "");
          setImages((prod.images || []).join("\n"));
          setSpecs((prod.specs || []).join("\n"));
          setHot(!!prod.hot);
          setVariants(
            (prod.variants || []).map((v: any) => ({
              id: v.id,
              size: typeof v.size === "object" ? v.size.name : v.size,
              color: typeof v.color === "object" ? v.color.name : v.color,
              price: String(v.price),
              stock: String(v.stock),
            }))
          );
        }
        setLoading(false);
      });
  }, [id]);

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
      images: images.split("\n").map((s) => s.trim()).filter(Boolean),
      specs: specs.split("\n").map((s) => s.trim()).filter(Boolean),
      hot,
      variants: variants.map((variant) => ({
        id: variant.id,
        size: variant.size,
        color: variant.color,
        price: Number(variant.price),
        stock: Number(variant.stock),
      })),
    };
    const res = await fetch(`${API}/api/products/${id}`, {
      method: "PUT",
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
      setError(data.message || "Cập nhật thất bại");
    }
  };

  if (loading) return <AdminShell><main className="mx-auto max-w-3xl">Đang tải...</main></AdminShell>;

  return (
    <AdminShell>
    <main className="mx-auto max-w-3xl">
      <div className="mb-10 flex items-end justify-between gap-6">
        <div>
          <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-neutral-400">Product studio</p>
          <h1 className="text-4xl font-light">Sửa Sản Phẩm</h1>
        </div>
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={name || "Ảnh sản phẩm"}
            className="h-24 w-24 rounded-xl border border-neutral-200 object-cover dark:border-neutral-700"
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-neutral-100 text-center text-[10px] uppercase text-neutral-400 dark:bg-neutral-800">
            Chưa có ảnh
          </div>
        )}
      </div>
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
          <p className="text-sm mb-2 font-medium">Biến thể và tồn kho</p>
          {variants.map((v, i) => (
            <div key={i} className="flex gap-2 mb-2 text-sm text-neutral-600">
              <span className="w-20">Size: {v.size}</span>
              <span className="w-28">Màu: {v.color}</span>
              <span className="w-28">Giá: {v.price}</span>
              <label className="flex items-center gap-2">
                Kho:
                <input
                  type="number"
                  min="0"
                  value={v.stock}
                  onChange={(event) => updateVariant(i, "stock", event.target.value)}
                  className="w-20 border px-2 py-1"
                />
              </label>
            </div>
          ))}
          <p className="text-xs text-neutral-400">Thay đổi tồn kho rồi bấm Cập nhật để lưu.</p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-black text-white py-3 uppercase disabled:opacity-50"
        >
          {saving ? "Đang lưu..." : "Cập nhật"}
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
