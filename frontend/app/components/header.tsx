"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";
import { Search, X } from "lucide-react";

export default function Header() {
    const [open, setOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<{ id: string; name: string; slug: string; thumbnail?: string }[]>([]);

    const pathname = usePathname();
    const { cart } = useCart();
    const { theme, toggleTheme } = useTheme();
    const isAdminArea = pathname.startsWith("/admin");
    const isAdminUser = user?.role === "admin";

    const totalItems = cart.reduce(
        (sum, item) => sum + item.quantity,
        0
    );

    useEffect(() => {
        const savedUser =
            localStorage.getItem("user");

        if (
            savedUser &&
            savedUser !== "undefined"
        ) {
            setUser(JSON.parse(savedUser));
        } else {
            setUser(null);
        }
    }, [pathname]);

    useEffect(() => {
        const value = query.trim();
        if (!value) {
            setResults([]);
            return;
        }
        const timer = window.setTimeout(() => {
            fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/products`)
                .then((response) => response.json())
                .then((data) => setResults(Array.isArray(data) ? data.filter((product) => product.name?.toLowerCase().includes(value.toLowerCase())).slice(0, 5) : []))
                .catch(() => setResults([]));
        }, 250);
        return () => window.clearTimeout(timer);
    }, [query]);

    const logout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");

        setUser(null);

        window.location.href = "/";
    };

    if (isAdminArea) return null;

    return (
        <header className="w-full bg-white border-b border-neutral-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-8">
                <div className="flex min-h-20 items-center justify-between gap-5 py-3">

                    <Link
                        href="/"
                        className="text-2xl font-light tracking-[0.35em] uppercase"
                    >
                        HyperLane
                    </Link>

                    <nav className="hidden lg:flex gap-8 text-xs uppercase tracking-[0.18em] text-neutral-500">
                        <Link href="/">Trang Chủ</Link>
                        <Link href={isAdminUser || isAdminArea ? "/admin/products" : "/sanpham"}>Sản Phẩm</Link>
                        <Link href="/about">Giới Thiệu</Link>
                        <Link href="/contact">Liên Hệ</Link>
                    </nav>

                    <div className="relative hidden md:block md:w-48 lg:w-64">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm sản phẩm..." aria-label="Tìm sản phẩm" className="h-10 w-full rounded-full border border-neutral-200 bg-neutral-50 pl-9 pr-9 text-xs outline-none transition focus:border-neutral-900 focus:bg-white dark:border-neutral-700 dark:bg-[#181818] dark:focus:border-white" />
                        {query && <button type="button" aria-label="Xóa tìm kiếm" onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"><X size={14} /></button>}
                        {query && <div className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-2xl border border-neutral-200 bg-white p-2 shadow-xl dark:border-neutral-700 dark:bg-[#181818]">{results.length ? results.map((product) => <Link key={product.id} href={`/sanpham/${product.slug}`} onClick={() => setQuery("")} className="flex items-center gap-3 rounded-xl p-2 text-xs transition hover:bg-neutral-100 dark:hover:bg-neutral-800"><img src={product.thumbnail || "/placeholder-product.svg"} alt="" className="h-10 w-8 rounded object-cover" /><span>{product.name}</span></Link>) : <p className="p-3 text-xs text-neutral-500">Không tìm thấy sản phẩm</p>}</div>}
                    </div>

                    <div className="hidden md:flex items-center gap-5">
                        <button
                            type="button"
                            onClick={toggleTheme}
                            aria-label={theme === "light" ? "Bật chế độ tối" : "Bật chế độ sáng"}
                            title={theme === "light" ? "Chế độ tối" : "Chế độ sáng"}
                            className="text-neutral-500 hover:text-black dark:hover:text-white transition"
                        >
                            {theme === "light" ? (
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                    <path d="M21 12.8A8.5 8.5 0 1111.2 3 6.7 6.7 0 0021 12.8z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                    <circle cx="12" cy="12" r="4" />
                                    <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" />
                                </svg>
                            )}
                        </button>

                        {!isAdminArea && !isAdminUser && (
                            <Link
                                href={user ? "/cart" : "/login"}
                                className="relative text-neutral-500 hover:text-black transition"
                            >
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    viewBox="0 0 24 24"
                                >
                                    <circle cx="9" cy="21" r="1" />
                                    <circle cx="20" cy="21" r="1" />
                                    <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
                                </svg>
                                {totalItems > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full px-2">
                                        {totalItems}
                                    </span>
                                )}
                            </Link>
                        )}

                        {user ? (
                            <div className="flex items-center gap-4">
                                <Link
                                    href={user.role === "admin" ? "/admin" : "/profile"}
                                    className="text-sm font-medium hover:text-black dark:hover:text-white"
                                >
                                    {user.name || user.username}
                                </Link>
                            </div>
                        ) : (
                            <Link href="/login">
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M20 21a8 8 0 10-16 0" />
                                    <circle
                                        cx="12"
                                        cy="7"
                                        r="4"
                                    />
                                </svg>
                            </Link>
                        )}
                    </div>

                    <button
                        className="md:hidden text-2xl"
                        onClick={() =>
                            setOpen(!open)
                        }
                        aria-label="Mở menu"
                    >
                        {open ? "✕" : "☰"}
                    </button>
                </div>

                {/* MOBILE MENU */}
                {open && (
                    <div className="md:hidden border-t border-neutral-200 py-4">
                        <nav className="flex flex-col gap-3 text-sm uppercase tracking-[0.18em] text-neutral-600">
                            <Link href="/" onClick={() => setOpen(false)}>Trang Chủ</Link>
                            <Link href={isAdminUser || isAdminArea ? "/admin/products" : "/sanpham"} onClick={() => setOpen(false)}>Sản Phẩm</Link>
                            <Link href="/about" onClick={() => setOpen(false)}>Giới Thiệu</Link>
                            <Link href="/contact" onClick={() => setOpen(false)}>Liên Hệ</Link>
                            {!isAdminArea && !isAdminUser && (
                                <Link href={user ? "/cart" : "/login"} onClick={() => setOpen(false)}>Giỏ Hàng</Link>
                            )}
                            <button
                                type="button"
                                onClick={toggleTheme}
                                className="text-left uppercase tracking-[0.18em] text-neutral-600 dark:text-neutral-300"
                            >
                                {theme === "light" ? "Chế độ tối" : "Chế độ sáng"}
                            </button>
                            {user ? (
                                <>
                                    <Link href={user.role === "admin" ? "/admin" : "/profile"} onClick={() => setOpen(false)}>{user.name || user.username}</Link>
                                    <button
                                        onClick={() => { logout(); setOpen(false); }}
                                        className="text-left uppercase tracking-[0.18em] text-neutral-600"
                                    >
                                        Đăng Xuất
                                    </button>
                                </>
                            ) : (
                                <Link href="/login" onClick={() => setOpen(false)}>Đăng Nhập</Link>
                            )}
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}