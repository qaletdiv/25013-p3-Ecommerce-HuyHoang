import Link from "next/link";
import ProductsCard from "./components/productsCard";
import { Product } from "./types/types";
import BannerSlider from "./components/bannerSlide";

export const dynamic = "force-dynamic";

const categorySections = [
  { id: "1", label: "Thời trang nam", eyebrow: "Form dáng chuẩn mực", image: "https://images.unsplash.com/photo-1610652492500-ded49ceeb378?auto=format&fit=crop&w=1000&q=85" },
  { id: "2", label: "Thời trang nữ", eyebrow: "Tinh thần tự do", image: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=1000&q=85" },
  { id: "3", label: "Trẻ em", eyebrow: "Những ngày thật vui", image: "https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?auto=format&fit=crop&w=1000&q=85" },
];

export default async function Home() {
  let products: Product[] = [];

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/products`, { cache: "no-store" });
    if (!response.ok) throw new Error(`Products request failed with status ${response.status}`);
    const data = await response.json();
    products = Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn("Không thể tải danh sách sản phẩm trên trang chủ:", error);
  }

  const featured = products.filter((product) => product.hot).slice(0, 4);

  return (
    <main className="bg-white text-neutral-900 dark:bg-[#111] dark:text-neutral-100">
      <BannerSlider />

      <section className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24">
        <div className="grid gap-8 border-y border-neutral-200 py-8 md:grid-cols-3 md:gap-12 dark:border-neutral-800">
          <BrandValue number="01" title="Thiết kế có chủ đích" text="Những đường nét tinh giản, được chọn lọc để đồng hành cùng bạn mỗi ngày." />
          <BrandValue number="02" title="Chất lượng lâu dài" text="Chất liệu được tuyển chọn và hoàn thiện với sự quan tâm đến từng chi tiết." />
          <BrandValue number="03" title="Phong cách của bạn" text="Các thiết yếu hiện đại để bạn tự do thể hiện cá tính riêng." />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24 md:px-10 md:pb-32">
        <SectionHeading eyebrow="Được tuyển chọn cho bạn" title="Những thiết kế nổi bật" href="/sanpham" />
        {featured.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4 md:gap-x-8">
            {featured.map((product) => <ProductsCard key={product.id} product={product} />)}
          </div>
        ) : (
          <div className="border border-dashed border-neutral-300 py-16 text-center text-sm text-neutral-500 dark:border-neutral-700">
            Bộ sưu tập đang được cập nhật.
          </div>
        )}
      </section>

      <section className="bg-neutral-100 dark:bg-[#1a1a1a]">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 md:grid-cols-[0.9fr_1.1fr] md:px-10 md:py-24">
          <div className="order-2 md:order-1">
            <p className="mb-5 text-[11px] uppercase tracking-[0.35em] text-neutral-500">Câu chuyện HyperLane</p>
            <h2 className="max-w-lg text-4xl font-light leading-tight tracking-tight md:text-6xl">Ít hơn, nhưng tốt hơn.</h2>
            <p className="mt-7 max-w-md text-sm leading-7 text-neutral-600 dark:text-neutral-400">
              Chúng tôi tin rằng phong cách đích thực không cần lên tiếng quá lớn. HyperLane tạo nên những món đồ vượt qua mùa mốt, để mỗi lựa chọn đều trở thành một phần tự nhiên trong câu chuyện của bạn.
            </p>
            <Link href="/about" className="mt-9 inline-flex border-b border-black pb-2 text-xs uppercase tracking-[0.2em] dark:border-white">Khám phá thương hiệu <span className="ml-5">↗</span></Link>
          </div>
          <div className="order-1 aspect-[4/3] overflow-hidden md:order-2">
            <img src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1400&q=85" alt="Phong cách HyperLane" className="h-full w-full object-cover grayscale-[15%] transition duration-700 hover:scale-105" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
        <SectionHeading eyebrow="Khám phá theo phong cách" title="Bộ sưu tập dành cho bạn" />
        <div className="grid gap-5 md:grid-cols-3">
          {categorySections.map((category) => (
            <Link key={category.id} href="/sanpham" className="group relative aspect-[4/5] overflow-hidden bg-neutral-200">
              <img src={category.image} alt={category.label} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 p-7 text-white">
                <p className="mb-3 text-[10px] uppercase tracking-[0.25em] text-white/70">{category.eyebrow}</p>
                <h3 className="text-3xl font-light">{category.label}</h3>
                <span className="mt-5 inline-block border-b border-white/70 pb-1 text-[10px] uppercase tracking-[0.2em]">Xem bộ sưu tập&nbsp; ↗</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-neutral-200 px-6 py-24 text-center dark:border-neutral-800 md:py-32">
        <p className="mb-6 text-[11px] uppercase tracking-[0.4em] text-neutral-500">HyperLane Journal</p>
        <h2 className="mx-auto max-w-3xl text-4xl font-light leading-tight md:text-6xl">Phong cách tốt bắt đầu từ những điều thiết yếu.</h2>
        <p className="mx-auto mt-7 max-w-xl text-sm leading-7 text-neutral-500">Đăng ký để nhận những câu chuyện, bộ sưu tập mới và cảm hứng được tuyển chọn riêng cho bạn.</p>
        <Link href="/register" className="mt-9 inline-block bg-black px-8 py-4 text-xs uppercase tracking-[0.22em] text-white transition hover:bg-neutral-700 dark:bg-white dark:text-black dark:hover:bg-neutral-300">Tham gia HyperLane</Link>
      </section>
    </main>
  );
}

function SectionHeading({ eyebrow, title, href }: { eyebrow: string; title: string; href?: string }) {
  return (
    <div className="mb-12 flex flex-col justify-between gap-5 border-b border-neutral-200 pb-6 md:flex-row md:items-end dark:border-neutral-800">
      <div>
        <p className="mb-4 text-[11px] uppercase tracking-[0.35em] text-neutral-500">{eyebrow}</p>
        <h2 className="text-4xl font-light tracking-tight md:text-5xl">{title}</h2>
      </div>
      {href && <Link href={href} className="w-fit border-b border-neutral-900 pb-1 text-xs uppercase tracking-[0.2em] dark:border-white">Xem tất cả <span className="ml-4">↗</span></Link>}
    </div>
  );
}

function BrandValue({ number, title, text }: { number: string; title: string; text: string }) {
  return <div><p className="mb-5 text-xs text-neutral-400">{number}</p><h3 className="mb-3 text-lg font-light">{title}</h3><p className="max-w-xs text-sm leading-6 text-neutral-500">{text}</p></div>;
}
