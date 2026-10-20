"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, Boxes, LayoutDashboard, LogOut, Menu, Moon, Settings, ShoppingBag, Sun, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "../../context/ThemeContext";

const navigation = [
  { href: "/admin", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/admin/products", label: "Sản phẩm", icon: ShoppingBag },
  { href: "/admin/categories", label: "Danh mục", icon: Boxes },
  { href: "/admin/orders", label: "Đơn hàng", icon: BarChart3 },
  { href: "#", label: "Khách hàng", icon: Users },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<{ name?: string; username?: string; role?: string } | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const savedUser = localStorage.getItem("user");
      if (!savedUser || savedUser === "undefined") return;
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("user");
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-neutral-900 dark:bg-[#101010] dark:text-neutral-100">
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-neutral-200/80 bg-white px-5 py-6 shadow-[4px_0_24px_rgba(0,0,0,0.03)] transition-transform dark:border-neutral-800 dark:bg-[#151515] lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between">
          <Link href="/admin" className="text-lg font-medium tracking-[0.3em]">HYPERLANE</Link>
          <button className="lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Đóng menu"><X size={20} /></button>
        </div>
        <p className="mt-2 text-[10px] uppercase tracking-[0.25em] text-neutral-400">Studio console <span className="text-neutral-300">/</span> 2026</p>

        <nav className="mt-12 space-y-1.5">
          <p className="mb-4 text-[10px] uppercase tracking-[0.25em] text-neutral-400">Quản trị</p>
          {navigation.map(({ href, label, icon: Icon }) => {
            const active = href !== "#" && (pathname === href || (href !== "/admin" && pathname.startsWith(href)));
            return href === "#" ? (
              <span key={label} className="flex cursor-not-allowed items-center gap-3 rounded-xl px-4 py-3 text-sm text-neutral-300 dark:text-neutral-600">
                <Icon size={18} strokeWidth={1.5} /> {label}
                <span className="ml-auto text-[9px] uppercase tracking-wider">Sớm</span>
              </span>
            ) : (
              <Link key={label} href={href} onClick={() => setMobileOpen(false)} className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${active ? "bg-neutral-900 text-white shadow-sm dark:bg-white dark:text-black" : "text-neutral-500 hover:bg-neutral-100 hover:text-black dark:hover:bg-neutral-800 dark:hover:text-white"}`}>
                <Icon size={18} strokeWidth={1.5} /> {label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-2 border-t border-neutral-200 pt-5 dark:border-neutral-800">
          <button onClick={toggleTheme} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800">
            {theme === "dark" ? <Sun size={18} strokeWidth={1.5} /> : <Moon size={18} strokeWidth={1.5} />}
            {theme === "dark" ? "Chế độ sáng" : "Chế độ tối"}
          </button>
          <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"><LogOut size={18} strokeWidth={1.5} /> Đăng xuất</button>
        </div>
      </aside>

      {mobileOpen && <button className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Đóng menu" />}
      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-neutral-200/80 bg-[#f7f7f5]/90 px-6 backdrop-blur dark:border-neutral-800/80 dark:bg-[#101010]/90 lg:px-10">
          <button className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Mở menu"><Menu size={22} /></button>
          <div className="hidden text-xs uppercase tracking-[0.18em] text-neutral-400 sm:block">Thứ Sáu, 09 tháng 10, 2026</div>
          <div className="ml-auto flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm">{user?.name || user?.username || "Quản trị viên"}</p>
              <p className="text-[10px] uppercase tracking-wider text-neutral-400">{user?.role === "admin" ? "Quản trị viên" : "Tài khoản"}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-xs font-medium text-white ring-4 ring-neutral-900/5 dark:bg-white dark:text-black dark:ring-white/10">
              {(user?.name || user?.username || "AD").slice(0, 2).toUpperCase()}
            </div>
          </div>
        </header>
        <main className="px-5 py-8 sm:px-8 lg:px-10 lg:py-12">{children}</main>
      </div>
    </div>
  );
}
