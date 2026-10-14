import Image from "next/image";
import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="bg-white text-neutral-900 dark:bg-[#111] dark:text-neutral-100">
      <section className="relative min-h-[68vh] overflow-hidden">
        <Image src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b" alt="Không gian thời trang HyperLane" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative z-10 mx-auto flex min-h-[68vh] max-w-7xl flex-col justify-end px-6 pb-14 text-white md:px-10 md:pb-20">
          <p className="mb-5 text-[10px] uppercase tracking-[0.35em] text-white/70">Về HyperLane</p>
          <h1 className="max-w-3xl text-5xl font-light leading-none tracking-tight md:text-8xl">Ít hơn, nhưng tốt hơn.</h1>
        </div>
      </section>

      <section className="mx-auto max-w-7xl border-b border-neutral-200 px-6 py-20 dark:border-neutral-800 md:px-10 md:py-28">
        <div className="grid gap-10 md:grid-cols-[0.8fr_1.2fr] md:gap-20">
          <p className="text-[10px] uppercase tracking-[0.35em] text-neutral-500">01 / Câu chuyện</p>
          <div>
            <h2 className="max-w-4xl text-3xl font-light leading-tight tracking-tight md:text-5xl">Định nghĩa lại thời trang đương đại bằng sự đơn giản vượt thời gian.</h2>
            <p className="mt-8 max-w-2xl text-sm leading-8 text-neutral-500">HyperLane là thương hiệu thời trang Việt Nam dành cho những người yêu thiết kế tinh tế, chất lượng bền lâu và sự tự tin tự nhiên. Chúng tôi tạo ra những món đồ thiết yếu để bạn mặc, sống và thể hiện bản thân theo cách riêng.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-2 md:px-10 md:py-28">
        <div className="relative min-h-[440px] overflow-hidden md:min-h-[620px]">
          <Image src="https://images.unsplash.com/photo-1445205170230-053b83016050" alt="Không gian bộ sưu tập HyperLane" fill className="object-cover transition duration-700 hover:scale-105" />
        </div>
        <div className="flex flex-col justify-center md:pl-10">
          <p className="mb-5 text-[10px] uppercase tracking-[0.35em] text-neutral-500">02 / Triết lý</p>
          <h2 className="text-4xl font-light leading-tight tracking-tight md:text-5xl">Được thiết kế cho cuộc sống hàng ngày.</h2>
          <div className="mt-10 space-y-6 text-sm leading-7 text-neutral-500">
            <p>Chúng tôi chọn chất liệu chú trọng vào cảm giác khi mặc, độ bền và khả năng đồng hành qua nhiều mùa.</p>
            <p>Đường nét tối giản giúp mỗi sản phẩm dễ kết hợp, nhưng vẫn đủ dấu ấn để trở thành phong cách của riêng bạn.</p>
            <p>Từ thiết kế đến trải nghiệm mua sắm, mọi chi tiết đều được tinh chỉnh với sự rõ ràng và chủ đích.</p>
          </div>
        </div>
      </section>

      <section className="bg-neutral-100 dark:bg-[#1a1a1a]">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
          <p className="mb-12 text-[10px] uppercase tracking-[0.35em] text-neutral-500">03 / Giá trị cốt lõi</p>
          <div className="grid gap-10 md:grid-cols-3 md:gap-14">
            <Value number="01" title="Có chủ đích" text="Mỗi đường nét, chất liệu và chi tiết đều có lý do để tồn tại." />
            <Value number="02" title="Bền lâu" text="Tạo nên những lựa chọn vượt qua mùa mốt và đồng hành lâu dài." />
            <Value number="03" title="Là chính bạn" text="Phong cách không phải khuôn mẫu; đó là cách bạn kể câu chuyện của mình." />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 text-center md:px-10 md:py-28">
        <p className="mb-5 text-[10px] uppercase tracking-[0.35em] text-neutral-500">Bộ sưu tập hiện tại</p>
        <h2 className="mx-auto max-w-2xl text-4xl font-light leading-tight md:text-6xl">Những món đồ thiết yếu, dành cho bạn.</h2>
        <Link href="/sanpham" className="mt-9 inline-flex rounded-full bg-neutral-900 px-7 py-3.5 text-xs uppercase tracking-[0.18em] text-white transition hover:bg-neutral-700 dark:bg-white dark:text-black dark:hover:bg-neutral-200">Khám phá sản phẩm <span className="ml-4">↗</span></Link>
      </section>
    </main>
  );
}

function Value({ number, title, text }: { number: string; title: string; text: string }) {
  return <div><p className="mb-6 text-xs text-neutral-400">{number}</p><h3 className="mb-3 text-2xl font-light">{title}</h3><p className="max-w-xs text-sm leading-7 text-neutral-500">{text}</p></div>;
}
