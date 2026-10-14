"use client";

import { Mail, MapPin, Phone, Send } from "lucide-react";
import { useState } from "react";
import { useToast } from "../context/ToastContext";

const API = process.env.NEXT_PUBLIC_API_BASE;
const initialForm = { name: "", email: "", phone: "", message: "" };

export default function ContactPage() {
  const { showToast } = useToast();
  const [form, setForm] = useState(initialForm);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSending(true);

    try {
      const response = await fetch(`${API}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        showToast(data.message || "Không thể gửi tin nhắn. Vui lòng thử lại.", "error");
        return;
      }

      showToast("Đã gửi tin nhắn. HyperLane sẽ phản hồi bạn sớm.", "success");
      setForm(initialForm);
    } catch {
      showToast("Không thể kết nối máy chủ. Vui lòng thử lại sau.", "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="bg-white text-neutral-900 dark:bg-[#111] dark:text-neutral-100">
      <section className="border-b border-neutral-200 bg-neutral-50 px-6 py-20 dark:border-neutral-800 dark:bg-[#171717] md:py-28">
        <div className="mx-auto max-w-7xl">
          <p className="mb-5 text-[10px] uppercase tracking-[0.35em] text-neutral-500">HyperLane / Liên hệ</p>
          <div className="grid gap-8 md:grid-cols-[1.15fr_0.85fr] md:items-end">
            <h1 className="max-w-3xl text-4xl font-light leading-tight tracking-tight md:text-6xl">
              Hãy bắt đầu một cuộc trò chuyện.
            </h1>
            <p className="max-w-md text-sm leading-7 text-neutral-500 md:justify-self-end">
              Từ câu hỏi về sản phẩm đến hỗ trợ đơn hàng, đội ngũ HyperLane luôn sẵn sàng lắng nghe và hỗ trợ bạn.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-16 px-6 py-16 md:px-10 md:py-24 lg:grid-cols-[1fr_0.8fr] lg:gap-28">
        <div>
          <div className="mb-10">
            <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-neutral-500">Gửi tin nhắn</p>
            <h2 className="text-3xl font-light tracking-tight md:text-4xl">Chúng tôi có thể giúp gì cho bạn?</h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Họ và tên" required value={form.name} onChange={(value) => setForm({ ...form, name: value })} />
              <Field label="Email" type="email" required value={form.email} onChange={(value) => setForm({ ...form, email: value })} />
            </div>
            <Field label="Số điện thoại" value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} />
            <label className="block">
              <span className="mb-2 block text-xs text-neutral-500">Nội dung tin nhắn <span className="text-neutral-900 dark:text-white">*</span></span>
              <textarea required rows={6} value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} placeholder="Bạn muốn chia sẻ điều gì?" className="w-full resize-none rounded-xl border border-neutral-200 bg-transparent px-4 py-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-900 focus:ring-4 focus:ring-neutral-900/5 dark:border-neutral-700 dark:focus:border-white dark:focus:ring-white/10" />
            </label>
            <button disabled={sending} type="submit" className="inline-flex items-center gap-3 rounded-full bg-neutral-900 px-7 py-3.5 text-xs uppercase tracking-[0.18em] text-white transition hover:bg-neutral-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200">
              <Send size={15} /> {sending ? "Đang gửi..." : "Gửi tin nhắn"}
            </button>
          </form>
        </div>

        <aside className="lg:border-l lg:border-neutral-200 lg:pl-16 dark:lg:border-neutral-800">
          <p className="mb-8 text-[10px] uppercase tracking-[0.3em] text-neutral-500">Thông tin liên hệ</p>
          <div className="space-y-7">
            <ContactDetail icon={<MapPin size={18} />} label="Studio" value="Thanh Hóa, Việt Nam" />
            <ContactDetail icon={<Phone size={18} />} label="Điện thoại" value="0123 456 789" href="tel:0123456789" />
            <ContactDetail icon={<Mail size={18} />} label="Email" value="support@hyperlane.com" href="mailto:support@hyperlane.com" />
          </div>
          <div className="mt-12 overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800">
            <iframe title="Bản đồ HyperLane tại Thanh Hóa" src="https://maps.google.com/maps?q=Thanh%20Hoa&t=&z=13&ie=UTF8&iwloc=&output=embed" className="h-64 w-full" loading="lazy" />
          </div>
          <p className="mt-5 text-xs leading-6 text-neutral-500">Thời gian hỗ trợ: Thứ 2 - Thứ 7, 08:30 - 17:30.</p>
        </aside>
      </section>
    </main>
  );
}

function Field({ label, type = "text", required = false, value, onChange }: { label: string; type?: string; required?: boolean; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs text-neutral-500">{label} {required && <span className="text-neutral-900 dark:text-white">*</span>}</span>
      <input required={required} type={type} value={value} onChange={(event) => onChange(event.target.value)} className="h-12 w-full rounded-xl border border-neutral-200 bg-transparent px-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-900 focus:ring-4 focus:ring-neutral-900/5 dark:border-neutral-700 dark:focus:border-white dark:focus:ring-white/10" />
    </label>
  );
}

function ContactDetail({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href?: string }) {
  const content = href ? <a href={href} className="transition hover:text-neutral-500">{value}</a> : value;
  return <div className="flex gap-4"><span className="mt-0.5 text-neutral-500">{icon}</span><div><p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-neutral-500">{label}</p><p className="text-sm">{content}</p></div></div>;
}
