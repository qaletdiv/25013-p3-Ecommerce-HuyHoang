"use client";

import { useEffect, useMemo, useState } from "react";
import ProductsCard from "../components/productsCard";

type Variant = {
  id: string;
  size: string;
  color: string;
  price: number;
  stock: number;
};

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  thumbnail: string;
  category: Category;
  variants: Variant[];
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [price, setPrice] = useState("all");
  const [sort, setSort] = useState("default");

  const [currentPage, setCurrentPage] = useState(1);
  const PRODUCTS_PER_PAGE = 8;

  const changePage = (page: number) => {
    setCurrentPage(page);

    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/products`,
        { cache: "no-store" }
      );
      if (!response.ok) {
        throw new Error(`Products request failed with status ${response.status}`);
      }
      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (requestError) {
      console.warn("Không thể tải danh sách sản phẩm:", requestError);
      setProducts([]);
      setError("Không thể kết nối đến hệ thống sản phẩm. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const categories = useMemo(() => {
    return [...new Map(
      products
        .filter((product) => product.category?.slug)
        .map((product) => [product.category.slug, product.category.name])
    )];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let data = [...products];

    // Search
    data = data.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );

    // Category
    if (category !== "all") {
      data = data.filter((p) => p.category?.slug === category);
    }

    // Price
    if (price !== "all") {
      data = data.filter((p) => {
        const minPrice = p.variants?.length
          ? Math.min(...p.variants.map((v) => v.price))
          : 0;

        switch (price) {
          case "under200":
            return minPrice < 200000;
          case "200to400":
            return minPrice >= 200000 && minPrice <= 400000;
          case "above400":
            return minPrice > 400000;
          default:
            return true;
        }
      });
    }

    // Sort
    if (sort === "low") {
      data.sort(
        (a, b) =>
          (a.variants?.length ? Math.min(...a.variants.map((v) => v.price)) : 0) -
          (b.variants?.length ? Math.min(...b.variants.map((v) => v.price)) : 0)
      );
    }

    if (sort === "high") {
      data.sort(
        (a, b) =>
          (b.variants?.length ? Math.min(...b.variants.map((v) => v.price)) : 0) -
          (a.variants?.length ? Math.min(...a.variants.map((v) => v.price)) : 0)
      );
    }

    return data;
  }, [products, search, category, price, sort]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, category, price, sort]);

  // Pagination calculations
  const totalPages = Math.ceil(
    filteredProducts.length / PRODUCTS_PER_PAGE
  );

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  if (loading) {
    return (
      <div className="p-10 text-center text-xl">Đang tải sản phẩm...</div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-8 text-center">
        <h1 className="text-3xl font-light">Sản phẩm đang tạm thời không khả dụng</h1>
        <p className="text-neutral-500">{error}</p>
        <button
          type="button"
          onClick={loadProducts}
          className="bg-black px-8 py-3 text-sm uppercase tracking-[0.15em] text-white"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 md:px-10 md:py-20">

      {/* Header */}
      <div className="mb-14 border-b border-neutral-200 pb-10 dark:border-neutral-800">
        <p className="mb-5 text-[11px] uppercase tracking-[0.35em] text-neutral-500">
          HyperLane / Collections
        </p>
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
        <h1 className="text-5xl font-light tracking-tight md:text-7xl">
          Sản Phẩm
        </h1>
        <p className="mt-5 max-w-xl leading-7 text-neutral-500">
          Khám phá những món đồ thiết yếu vượt thời gian được chế tác dành cho
          sự thanh lịch hiện đại.
        </p>
        </div>
        <p className="text-sm text-neutral-500">{filteredProducts.length} sản phẩm</p>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-16 grid gap-4 border-b border-neutral-200 pb-8 md:grid-cols-4 dark:border-neutral-800">

        <input
          type="text"
          placeholder="Tìm kiếm sản phẩm"
          className="border border-neutral-200 bg-transparent px-4 py-3 text-sm outline-none transition focus:border-black dark:border-neutral-700 dark:focus:border-white"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        <select
          className="border border-neutral-200 bg-transparent px-4 py-3 text-sm outline-none transition focus:border-black dark:border-neutral-700 dark:focus:border-white"
          value={category}
          onChange={(e) =>
            setCategory(e.target.value)
          }
        >
          <option value="all">
            Tất cả danh mục
          </option>

          {categories.map(([slug, name]) => (
            <option key={slug} value={slug}>{name}</option>
          ))}
        </select>

        <select
          className="border border-neutral-200 bg-transparent px-4 py-3 text-sm outline-none transition focus:border-black dark:border-neutral-700 dark:focus:border-white"
          value={price}
          onChange={(e) =>
            setPrice(e.target.value)
          }
        >
          <option value="all">
            Tất cả giá
          </option>

          <option value="under200">
            Dưới 200k
          </option>

          <option value="200to400">
            200K — 400K
          </option>

          <option value="above400">
            Trên 400k
          </option>
        </select>

        <select
          className="border border-neutral-200 bg-transparent px-4 py-3 text-sm outline-none transition focus:border-black dark:border-neutral-700 dark:focus:border-white"
          value={sort}
          onChange={(e) =>
            setSort(e.target.value)
          }
        >
          <option value="default">
            Mặc định
          </option>

          <option value="low">
            Giá tăng dần
          </option>

          <option value="high">
            Giá giảm dần
          </option>
        </select>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 gap-x-5 gap-y-14 md:grid-cols-3 lg:grid-cols-4 md:gap-x-8 md:gap-y-20">
        {paginatedProducts.map((product) => (
          <ProductsCard key={product.id} product={product} />
        ))}
      </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-12">
            <button
              onClick={() => changePage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border disabled:opacity-30"
            >
              ←
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => changePage(page)}
                className={`w-10 h-10 border transition ${
                  currentPage === page
                    ? "bg-black text-white"
                    : "hover:bg-neutral-100"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => changePage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border disabled:opacity-30"
            >
              →
            </button>
          </div>
        )}

      {/* Empty */}
      {filteredProducts.length ===
        0 && (
          <div className="text-center py-32 text-neutral-500 uppercase tracking-[0.15em]">
            Không tìm thấy sản phẩm
          </div>
        )}
    </div>
  );
}