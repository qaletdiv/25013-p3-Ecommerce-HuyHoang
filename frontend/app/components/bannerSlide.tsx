"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const slides = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c",
    title: "HÀNG MỚI VỀ",
    subtitle:
      "Những đường nét tinh tế dành cho cuộc sống hiện đại",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b",
    title: "NHỮNG ĐIỀU THIẾT YẾU",
    subtitle:
      "Những món đồ thời trang thời thượng được tái định nghĩa",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f",
    title: "HYPERLANE",
    subtitle:
      "Thiết kế tối giản. Sức ảnh hưởng tối đa.",
  },
];

export default function BannerSlider() {
  const [current, setCurrent] =
    useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent(
        (prev) =>
          (prev + 1) % slides.length
      );
    }, 5000);

    return () =>
      clearInterval(interval);
  }, []);

  const prevSlide = () => {
    setCurrent(
      current === 0
        ? slides.length - 1
        : current - 1
    );
  };

  const nextSlide = () => {
    setCurrent(
      (current + 1) % slides.length
    );
  };

  return (
    <section className="relative w-full h-[88vh] overflow-hidden bg-black">

      {/* Slides */}
      <div
        className="flex h-full transition-transform duration-1000 ease-out"
        style={{
          transform: `translateX(-${current * 100}%)`,
        }}
      >
        {slides.map((slide) => (
          <div
            key={slide.id}
            className="relative w-full h-full flex-shrink-0"
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/35 flex flex-col justify-center px-8 md:px-24 text-white">

              <p className="uppercase tracking-[0.35em] text-sm mb-6 opacity-80">
                HyperLane
              </p>

              <h2 className="text-5xl md:text-8xl font-light tracking-[0.15em] mb-6 max-w-4xl">
                {slide.title}
              </h2>

              <p className="text-base md:text-xl tracking-[0.08em] uppercase opacity-90 max-w-xl">
                {slide.subtitle}
              </p>
              <Link
                href="/sanpham"
                className="mt-9 w-fit border border-white/70 px-6 py-4 text-xs uppercase tracking-[0.22em] transition hover:bg-white hover:text-black"
              >
                Khám phá ngay <span className="ml-5">↗</span>
              </Link>

            </div>
          </div>
        ))}
      </div>

      {/* Prev */}
      <button
        onClick={prevSlide}
        className="absolute left-8 top-1/2 -translate-y-1/2 text-white text-5xl opacity-60 hover:opacity-100 transition"
      >
        ‹
      </button>

      {/* Next */}
      <button
        onClick={nextSlide}
        className="absolute right-8 top-1/2 -translate-y-1/2 text-white text-5xl opacity-60 hover:opacity-100 transition"
      >
        ›
      </button>

      {/* Dots */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-4">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() =>
              setCurrent(index)
            }
            className={`h-[2px] transition-all duration-500 ${
              current === index
                ? "w-16 bg-white"
                : "w-8 bg-white/40"
            }`}
          />
        ))}
      </div>

    </section>
  );
}