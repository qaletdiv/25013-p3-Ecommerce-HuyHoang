"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
    const pathname = usePathname();

    if (pathname.startsWith("/admin")) return null;

    return (
        <footer className="bg-white border-t border-neutral-200 mt-24">
            <div className="max-w-7xl mx-auto px-8 py-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-14">

                {/* Brand */}
                <div>
                    <h2 className="text-2xl font-light tracking-[0.25em] uppercase text-black mb-6">
                        HyperLane
                    </h2>

                    <p className="text-sm text-neutral-600 leading-7">
                        Những món đồ thời trang thiết yếu hiện đại được thiết kế với kiểu dáng vượt thời gian và được chế tác để mang đến vẻ thanh lịch đương đại.
                    </p>

                    <div className="flex gap-4 mt-8">
                        {["F", "I", "Y"].map((item) => (
                            <div
                                key={item}
                                className="w-10 h-10 border border-neutral-300 rounded-full flex items-center justify-center text-sm hover:bg-black hover:text-white transition cursor-pointer"
                            >
                                {item}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Policies */}
                <div>
                    <h3 className="uppercase tracking-[0.2em] text-sm mb-6 text-black">
                        Chính Sách
                    </h3>

                    <ul className="space-y-4 text-sm text-neutral-600">
                        {[
                            { label: "Chính Sách Bảo Mật", href: "/policy/privacy" },
                            { label: "Chính Sách Hoàn Tiền", href: "/policy/refund" },
                            { label: "Chính Sách Vận Chuyển", href: "/policy/shipping" },
                            { label: "Điều Khoản Dịch Vụ", href: "/policy/terms" },
                        ].map((item) => (
                            <li key={item.label}>
                                <Link
                                    href={item.href}
                                    className="hover:text-black transition"
                                >
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Support */}
                <div>
                    <h3 className="uppercase tracking-[0.2em] text-sm mb-6 text-black">
                        Hỗ Trợ
                    </h3>

                    <ul className="space-y-4 text-sm text-neutral-600">
                        {[
                            { label: "Trung Tâm Trợ Giúp", href: "/help" },
                            { label: "Hướng Dẫn Mua Hàng", href: "/guide" },
                            { label: "Thanh Toán", href: "/payment" },
                            { label: "Liên Hệ", href: "/contact" },
                        ].map((item) => (
                            <li key={item.label}>
                                <Link
                                    href={item.href}
                                    className="hover:text-black transition"
                                >
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Contact */}
                <div>
                    <h3 className="uppercase tracking-[0.2em] text-sm mb-6 text-black">
                        Liên Hệ
                    </h3>

                    <ul className="space-y-5 text-sm text-neutral-600 leading-7">
                        <li>Thanh Hóa, Việt Nam</li>
                        <li>0123 456 789</li>
                        <li>support@hyperlane.com</li>
                    </ul>
                </div>
            </div>

            {/* Bottom */}
            <div className="border-t border-neutral-200 py-6 text-center text-xs tracking-[0.2em] uppercase text-neutral-500">
                © 2026 HYPER LANE — Mọi quyền được bảo lưu
            </div>
        </footer>
    );
}