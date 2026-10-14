"use client";

import { X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function SiteBanner() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(sessionStorage.getItem("hyperlane-banner-hidden") !== "true");
  }, []);

  if (pathname.startsWith("/admin") || !visible) return null;

  return (
    <div className="relative z-40 flex min-h-9 items-center justify-center bg-neutral-900 px-10 py-2 text-center text-[10px] uppercase tracking-[0.18em] text-white dark:bg-white dark:text-black">
      <span>Miễn phí vận chuyển cho đơn hàng từ 500.000₫</span>
      <button
        type="button"
        aria-label="Đóng thông báo"
        onClick={() => {
          sessionStorage.setItem("hyperlane-banner-hidden", "true");
          setVisible(false);
        }}
        className="absolute right-4 rounded-full p-1 opacity-70 transition hover:bg-white/15 hover:opacity-100 dark:hover:bg-black/10"
      >
        <X size={14} />
      </button>
    </div>
  );
}
