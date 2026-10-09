"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/utils/formatPrice";
import { useCart } from "../../context/CartContext";

type ProductVariant = {
  id: number | string;
  price: number;
  stock: number;
  size: string;
  color: string;
};

type ProductData = {
  id: number | string;
  name: string;
  slug?: string;
  description?: string;
  thumbnail: string;
  images?: string[];
  specs?: unknown[];
  category?: { name?: string };
  variants: ProductVariant[];
};

const textValue = (value: unknown) =>
  typeof value === "object" && value !== null
    ? String((value as { name?: unknown }).name || "")
    : String(value || "");

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [slug, setSlug] = useState<string | null>(null);
  const [product, setProduct] = useState<ProductData | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ProductData[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState("");
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (!savedUser || savedUser === "undefined") return;
    try {
      setIsAdmin(JSON.parse(savedUser).role === "admin");
    } catch {
      localStorage.removeItem("user");
    }
  }, []);

  useEffect(() => {
    params.then((resolved) => setSlug(resolved.slug));
  }, [params]);

  useEffect(() => {
    if (!slug) return;
    const fetchData = async () => {
      try {
        setError("");
        const [productRes, relatedRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/products/slug/${encodeURIComponent(slug)}`),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/products/related/${encodeURIComponent(slug)}`),
        ]);
        if (!productRes.ok) throw new Error("Không tìm thấy sản phẩm");

        const normalizeProduct = (data: Record<string, unknown>): ProductData => ({
          ...data,
          id: data.id as number | string,
          name: String(data.name || "Sản phẩm"),
          thumbnail: String(data.thumbnail || "/placeholder-product.svg"),
          variants: Array.isArray(data.variants)
            ? data.variants.map((variant) => {
                const item = variant as Record<string, unknown>;
                return {
                  id: item.id as number | string,
                  price: Number(item.price) || 0,
                  stock: Math.max(0, Number(item.stock) || 0),
                  size: textValue(item.size),
                  color: textValue(item.color),
                };
              })
            : [],
        });

        const productData = normalizeProduct(await productRes.json());
        if (!productData.variants.length) throw new Error("Sản phẩm chưa có biến thể");
        const relatedData = relatedRes.ok ? await relatedRes.json() : [];
        const first = productData.variants[0];
        setProduct(productData);
        setRelatedProducts(Array.isArray(relatedData) ? relatedData.slice(0, 4).map(normalizeProduct) : []);
        setSelectedVariant(first);
        setSelectedColor(first.color);
        setSelectedImage(productData.images?.[0] || productData.thumbnail);
      } catch (requestError) {
        console.warn("Không thể tải chi tiết sản phẩm:", requestError);
        setError(requestError instanceof Error ? requestError.message : "Không thể tải sản phẩm");
      }
    };
    fetchData();
  }, [slug]);

  const colors = useMemo(
    () => (product ? [...new Set(product.variants.map((variant) => variant.color).filter(Boolean))] : []),
    [product]
  );
  const sizes = useMemo(
    () => product?.variants.filter((variant) => variant.color === selectedColor) || [],
    [product, selectedColor]
  );
  const gallery = product ? [...new Set([product.thumbnail, ...(product.images || [])].filter(Boolean))] : [];

  const selectColor = (color: string) => {
    if (!product) return;
    const variant = product.variants.find((item) => item.color === color);
    if (variant) {
      setSelectedColor(color);
      setSelectedVariant(variant);
      setQuantity(1);
    }
  };

  const selectSize = (size: string) => {
    const variant = sizes.find((item) => item.size === size);
    if (variant) {
      setSelectedVariant(variant);
      setQuantity(1);
    }
  };

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;
    const user = localStorage.getItem("user");
    if (!user || user === "undefined") {
      router.push("/login");
      return;
    }
    addToCart({
      id: `${product.id}-${selectedVariant.id}`,
      productId: String(product.id),
      variantId: String(selectedVariant.id),
      name: product.name,
      price: selectedVariant.price,
      thumbnail: selectedImage || product.thumbnail,
      size: selectedVariant.size,
      color: selectedVariant.color,
      stock: selectedVariant.stock,
      quantity,
    });
  };

  if (error) {
    return <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-8 text-center"><p className="text-neutral-600 dark:text-neutral-400">{error}</p><Link href="/sanpham" className="border border-black px-6 py-3 text-xs uppercase tracking-[0.18em] dark:border-white">Quay lại sản phẩm</Link></div>;
  }
  if (!product || !selectedVariant) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-neutral-500">Đang tải sản phẩm...</div>;
  }

  const inStock = selectedVariant.stock > 0;

  return (
    <main className="bg-white text-neutral-950 dark:bg-[#111] dark:text-neutral-100">
      <div className="mx-auto max-w-7xl px-6 py-8 md:px-10 md:py-12">
        <nav className="mb-10 text-[10px] uppercase tracking-[0.22em] text-neutral-500">
          <Link href="/" className="hover:text-black dark:hover:text-white">Trang chủ</Link><span className="mx-3">/</span><Link href="/sanpham" className="hover:text-black dark:hover:text-white">Sản phẩm</Link><span className="mx-3">/</span><span>{product.name}</span>
        </nav>

        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          <div>
            <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100 dark:bg-neutral-800">
              <img src={selectedImage || "/placeholder-product.svg"} alt={product.name} className="h-full w-full object-cover" />
              <span className="absolute left-5 top-5 bg-white/90 px-3 py-2 text-[10px] uppercase tracking-[0.16em] text-neutral-700">{inStock ? "Bộ sưu tập mới" : "Hết hàng"}</span>
            </div>
            {gallery.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {gallery.map((image) => <button key={image} type="button" onClick={() => setSelectedImage(image)} className={`aspect-[4/5] overflow-hidden border ${selectedImage === image ? "border-black dark:border-white" : "border-transparent"}`}><img src={image} alt="" className="h-full w-full object-cover" /></button>)}
              </div>
            )}
          </div>

          <div className="lg:sticky lg:top-28 lg:h-fit">
            <p className="mb-4 text-[11px] uppercase tracking-[0.32em] text-neutral-500">{product.category?.name || "HyperLane Essentials"}</p>
            <h1 className="max-w-xl text-4xl font-light leading-tight tracking-tight md:text-6xl">{product.name}</h1>
            <p className="mt-6 text-2xl">{formatPrice(selectedVariant.price)}₫</p>
            <div className="my-8 border-y border-neutral-200 py-7 dark:border-neutral-800">
              <p className="text-sm leading-7 text-neutral-600 dark:text-neutral-400">{product.description || "Một thiết kế vượt thời gian, được hoàn thiện cho nhịp sống hiện đại."}</p>
            </div>

            {colors.length > 0 && <div className="mb-8"><div className="mb-4 flex justify-between text-xs uppercase tracking-[0.18em]"><span>Màu sắc</span><span className="text-neutral-500">{selectedColor}</span></div><div className="flex flex-wrap gap-3">{colors.map((color) => <button key={color} type="button" onClick={() => selectColor(color)} className={`border px-4 py-3 text-sm transition ${selectedColor === color ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black" : "border-neutral-300 hover:border-black dark:border-neutral-700 dark:hover:border-white"}`}>{color}</button>)}</div></div>}

            <div className="mb-8"><div className="mb-4 flex justify-between text-xs uppercase tracking-[0.18em]"><span>Kích thước</span><span className="text-neutral-500">{selectedVariant.size}</span></div><div className="flex flex-wrap gap-3">{sizes.map((variant) => <button key={variant.id} type="button" onClick={() => selectSize(variant.size)} disabled={variant.stock <= 0} className={`h-12 min-w-12 border px-4 text-sm transition ${selectedVariant.id === variant.id ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black" : "border-neutral-300 hover:border-black dark:border-neutral-700 dark:hover:border-white"} disabled:cursor-not-allowed disabled:opacity-30`}>{variant.size}</button>)}</div></div>

            <div className="mb-4 flex items-center justify-between"><span className={`text-xs uppercase tracking-[0.16em] ${inStock ? "text-green-700 dark:text-green-400" : "text-red-600"}`}>{inStock ? `Còn ${selectedVariant.stock} sản phẩm` : "Hết hàng"}</span>{inStock && <span className="text-xs text-neutral-500">Giao hàng toàn quốc</span>}</div>
            {!isAdmin && <div className="flex gap-3"><div className="flex h-14 items-center border border-neutral-300 dark:border-neutral-700"><button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="h-full w-12 text-xl">−</button><span className="w-10 text-center text-sm">{quantity}</span><button type="button" onClick={() => setQuantity(Math.min(selectedVariant.stock, quantity + 1))} disabled={!inStock || quantity >= selectedVariant.stock} className="h-full w-12 text-xl disabled:opacity-30">+</button></div><button type="button" onClick={handleAddToCart} disabled={!inStock} className="h-14 flex-1 bg-black text-xs uppercase tracking-[0.2em] text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:bg-neutral-300 dark:bg-white dark:text-black dark:hover:bg-neutral-300">Thêm vào giỏ hàng</button></div>}
            {isAdmin && <Link href={`/admin/products/edit/${product.id}`} className="block border border-black py-4 text-center text-xs uppercase tracking-[0.2em] dark:border-white">Quản lý sản phẩm ↗</Link>}

            <div className="mt-10 divide-y divide-neutral-200 border-y border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
              <Details title="Thông tin sản phẩm"><p>{product.description || "Thiết kế tối giản, linh hoạt và phù hợp cho nhiều hoàn cảnh sử dụng."}</p></Details>
              <Details title="Thông số kỹ thuật"><SpecList specs={product.specs} /></Details>
              <Details title="Vận chuyển & đổi trả"><p>Miễn phí vận chuyển cho đơn hàng đủ điều kiện. Hỗ trợ đổi sản phẩm theo chính sách của HyperLane.</p></Details>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && <section className="mt-28 border-t border-neutral-200 pt-12 dark:border-neutral-800"><div className="mb-8 flex items-end justify-between"><div><p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-neutral-500">Bạn có thể thích</p><h2 className="text-3xl font-light">Hoàn thiện phong cách</h2></div><Link href="/sanpham" className="text-xs uppercase tracking-[0.18em] underline underline-offset-4">Xem tất cả</Link></div><div className="grid grid-cols-2 gap-5 md:grid-cols-4">{relatedProducts.map((item) => <Link key={item.id} href={`/sanpham/${item.slug || ""}`} className="group"><div className="aspect-[3/4] overflow-hidden bg-neutral-100 dark:bg-neutral-800"><img src={item.thumbnail || "/placeholder-product.svg"} alt={item.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /></div><p className="mt-4 text-sm">{item.name}</p><p className="mt-2 text-sm text-neutral-500">{formatPrice(Number(item.variants[0]?.price || 0))}₫</p></Link>)}</div></section>}
      </div>
    </main>
  );
}

function Details({ title, children }: { title: string; children: React.ReactNode }) {
  return <details className="group py-5"><summary className="flex cursor-pointer list-none justify-between text-xs uppercase tracking-[0.18em]">{title}<span className="text-lg font-light transition group-open:rotate-45">+</span></summary><div className="pt-4 text-sm leading-7 text-neutral-500">{children}</div></details>;
}

function SpecList({ specs }: { specs?: unknown[] }) {
  if (!specs?.length) return <p>Thông số đang được cập nhật.</p>;
  return <ul className="space-y-2">{specs.map((spec, index) => { const item = spec as { label?: string; value?: string }; return <li key={index} className="flex gap-4"><span className="w-28 text-neutral-400">{typeof spec === "object" ? item.label : "Chi tiết"}</span><span>{typeof spec === "object" ? item.value : String(spec)}</span></li>; })}</ul>;
}
