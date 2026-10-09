import Image from "next/image";

export default function AboutPage() {
  return (
    <main className="bg-white text-neutral-900">

      {/* HERO */}
      <section className="relative h-[75vh] w-full">
        <Image
          src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b"
          alt="about-banner"
          fill
          priority
          className="object-cover"
        />

        <div className="absolute inset-0 bg-black/35 flex flex-col justify-center items-center text-white">

          <p className="uppercase tracking-[0.35em] text-sm mb-6 opacity-80">
            Về Chúng Tôi
          </p>

          <h1 className="text-6xl md:text-7xl font-light tracking-[0.08em]">
            HyperLane
          </h1>

        </div>
      </section>

      {/* INTRO */}
      <section className="max-w-6xl mx-auto px-8 py-28 border-b border-neutral-200 text-center">

        <p className="uppercase tracking-[0.3em] text-sm text-neutral-500 mb-8">
          Bắt đầu năm 2026
        </p>

        <h2 className="text-5xl font-light max-w-4xl mx-auto leading-tight mb-10">
          Định nghĩa lại thời trang đương đại thông qua sự đơn giản vượt thời gian.
        </h2>

        <p className="text-neutral-600 leading-8 max-w-3xl mx-auto">
          HyperLane là một thương hiệu thời trang đương đại của Việt Nam, được tạo ra dành cho
          những người coi trọng thiết kế tinh tế, những món đồ thiết yếu cao cấp và sự tự tin hiện đại.
        </p>

      </section>

      {/* CONTENT */}
      <section className="max-w-5xl mx-auto px-8 py-24 space-y-28">

        {/* SECTION */}
        <div>
          <p className="uppercase tracking-[0.25em] text-sm text-neutral-500 mb-6">
            Hành trình
          </p>

          <h3 className="text-4xl font-light mb-8">
            Sự phát triển của chúng tôi
          </h3>

          <p className="leading-8 text-neutral-600 mb-8">
            Khởi đầu từ một tầm nhìn địa phương tập trung, nay đã phát triển thành một điểm đến thời trang hiện đại, phục vụ khách hàng trên toàn quốc thông qua thiết kế cao cấp và sự sang trọng dễ tiếp cận.
          </p>

          <ul className="space-y-4 text-neutral-700 border-l border-neutral-300 pl-8">
            <li>2026 — Thành lập tại Việt Nam</li>
            <li>Được xây dựng dựa trên những món đồ thiết yếu trong tủ quần áo.</li>
            <li>Mở rộng thông qua thương mại điện tử</li>
            <li>Phát triển theo hướng sự hiện diện quốc tế</li>
          </ul>
        </div>

        {/* IMAGE */}
        <div className="relative h-[650px]">
          <Image
            src="https://images.unsplash.com/photo-1445205170230-053b83016050"
            alt="fashion"
            fill
            className="object-cover"
          />
        </div>

        {/* PHILOSOPHY */}
        <div>
          <p className="uppercase tracking-[0.25em] text-sm text-neutral-500 mb-6">
            Triết lý
          </p>

          <h3 className="text-4xl font-light mb-8">
            Được Thiết Kế Cho Sự Sang Trọng Hàng Ngày
          </h3>

          <div className="space-y-6 text-neutral-600 leading-8">
            <p>
              Vật liệu cao cấp được lựa chọn để đảm bảo sự thoải mái và độ bền.
            </p>
            <p>
              Đường nét tối giản được tinh chỉnh với sự chính xác hiện đại.
            </p>
            <p>
              Sự cân bằng trong nghệ thuật thủ công giữa chất lượng và khả năng tiếp cận.
            </p>
            <p>
              Tiếp cận thời gian không giới hạn vượt qua các xu hướng tạm thời.
            </p>
          </div>
        </div>

        {/* CATEGORIES */}
        <div>
          <p className="uppercase tracking-[0.25em] text-sm text-neutral-500 mb-6">
            Bộ Sưu Tập
          </p>

          <h3 className="text-4xl font-light mb-10">
            Signature Essentials
          </h3>

          <div className="grid md:grid-cols-2 gap-y-5 text-lg">
            <p>Áo sơ mi</p>
            <p>Áo thun & Áo polo</p>
            <p>Quần & Short</p>
            <p>Áo khoác</p>
            <p>Phụ kiện</p>
            <p>Thành phần capsule theo mùa</p>
          </div>
        </div>

        {/* VISION */}
        <div className="border-t border-neutral-200 pt-20 text-center">

          <p className="uppercase tracking-[0.3em] text-sm text-neutral-500 mb-6">   
            Tầm nhìn
          </p>

          <h3 className="text-5xl font-light mb-10">
            Thời trang định hình bản sắc
          </h3>

          <p className="max-w-3xl mx-auto leading-8 text-neutral-600">
            HyperLane ra đời để thúc đẩy sự thể hiện bản thân thông qua những sản phẩm thiết yếu cao cấp, kết hợp giữa sự tự tin, thoải mái và thiết kế hiện đại.
          </p>

        </div>

      </section>
    </main>
  );
}