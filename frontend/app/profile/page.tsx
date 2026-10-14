"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/utils/formatPrice";

type User = {
    id: string;
    name?: string;
    username?: string;
    email?: string;
    role?: string;
    address?: string;
    avatar?: string;
};

type Order = {
    id: string;
    total?: number;
    status?: string;
    createdAt?: string;
    date?: string;
    items?: unknown[];
};

const statusLabels: Record<string, string> = {
    pending: "Đang xử lý",
    processing: "Đang chuẩn bị",
    shipped: "Đang giao",
    completed: "Hoàn tất",
    delivered: "Đã giao",
    cancelled: "Đã hủy",
};

function getInitials(user: User) {
    const value = user.name || user.username || "HL";
    return value
        .split(/\s+/)
        .filter(Boolean)
        .slice(-2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
}

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [notice, setNotice] = useState("");
    const [form, setForm] = useState({ username: "", email: "", address: "" });
    const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser || storedUser === "undefined") {
            router.replace("/login");
            return;
        }

        try {
            const parsed: User = JSON.parse(storedUser);
            if (parsed.role === "admin") {
                router.replace("/admin");
                return;
            }
            setUser(parsed);
            setForm({
                username: parsed.username || parsed.name || "",
                email: parsed.email || "",
                address: parsed.address || "",
            });

            fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/orders/${parsed.id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
                },
            })
                .then((response) => (response.ok ? response.json() : []))
                .then((data) => setOrders(Array.isArray(data) ? data : []))
                .catch(() => setOrders([]))
                .finally(() => setLoadingOrders(false));
        } catch {
            localStorage.removeItem("user");
            router.replace("/login");
        }
    }, [router]);

    const totalSpent = useMemo(
        () => orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0),
        [orders]
    );

    const handleSave = async (event: FormEvent) => {
        event.preventDefault();
        if (!user) return;
        setSaving(true);
        setNotice("");

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/auth/me`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
                },
                body: JSON.stringify(form),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                setNotice(data.message || "Không thể cập nhật thông tin.");
                return;
            }

            const updatedUser = {
                ...user,
                username: data.user?.username || form.username,
                name: data.user?.name || data.user?.username || form.username,
                email: data.user?.email || form.email,
                address: data.user?.address || form.address,
                avatar: data.user?.avatar || user.avatar,
            };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            setUser(updatedUser);
            setForm({
                username: updatedUser.username || updatedUser.name || "",
                email: updatedUser.email || "",
                address: updatedUser.address || "",
            });
            setEditing(false);
            setNotice("Thông tin tài khoản đã được cập nhật.");
        } catch {
            setNotice("Không thể kết nối máy chủ. Vui lòng thử lại.");
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (event: FormEvent) => {
        event.preventDefault();
        setSaving(true);
        setNotice("");
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/auth/change-password`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", Authorization: `******"token") || ""}` },
                body: JSON.stringify(passwordForm),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                setNotice(data.message || "Không thể đổi mật khẩu.");
                return;
            }
            setPasswordForm({ currentPassword: "", newPassword: "" });
            setNotice("Mật khẩu đã được cập nhật.");
        } catch {
            setNotice("Không thể kết nối máy chủ. Vui lòng thử lại.");
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user) return;
        const body = new FormData();
        body.append("avatar", file);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/auth/update-my-avatar`, {
                method: "PATCH",
                headers: { Authorization: `******"token") || ""}` },
                body,
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                setNotice(data.message || "Không thể cập nhật ảnh đại diện.");
                return;
            }
            const updatedUser = { ...user, ...data.user };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            setUser(updatedUser);
            setNotice("Ảnh đại diện đã được cập nhật.");
        } catch {
            setNotice("Không thể kết nối máy chủ. Vui lòng thử lại.");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        router.push("/login");
    };

    if (!user) return <div className="min-h-screen" />;

    return (
        <main className="min-h-screen bg-neutral-50 text-neutral-950 dark:bg-[#111] dark:text-neutral-100">
            <section className="relative overflow-hidden bg-[#171717] text-white">
                <div className="absolute -right-24 -top-36 h-96 w-96 rounded-full border border-white/10" />
                <div className="absolute -right-8 -top-20 h-64 w-64 rounded-full border border-white/10" />
                <div className="relative mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24">
                    <p className="mb-5 text-[11px] uppercase tracking-[0.4em] text-white/50">Tài khoản HyperLane</p>
                    <div className="flex flex-col justify-between gap-10 md:flex-row md:items-end">
                        <div className="flex items-center gap-6">
                            <label className="group relative flex h-20 w-20 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-white text-2xl font-light tracking-widest text-neutral-900">
                                {user.avatar ? <img src={`${process.env.NEXT_PUBLIC_API_BASE}${user.avatar}`} alt="Ảnh đại diện" className="h-full w-full object-cover" /> : getInitials(user)}
                                <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-[9px] uppercase tracking-wider text-white opacity-0 transition group-hover:opacity-100">Đổi ảnh</span>
                                <input type="file" accept="image/*" className="sr-only" onChange={handleAvatarUpload} />
                            </label>
                            <div>
                                <p className="mb-2 text-sm text-white/50">Chào mừng trở lại,</p>
                                <h1 className="text-4xl font-light tracking-tight md:text-6xl">
                                    {user.name || user.username || "Bạn"}
                                </h1>
                            </div>
                        </div>
                        <Link href="/sanpham" className="inline-flex w-fit items-center gap-3 border border-white/30 px-5 py-3 text-xs uppercase tracking-[0.2em] transition hover:bg-white hover:text-black">
                            Khám phá bộ sưu tập <span aria-hidden="true">↗</span>
                        </Link>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-6 py-10 md:px-10 md:py-16">
                <div className="mb-10 grid gap-px overflow-hidden border border-neutral-200 bg-neutral-200 md:grid-cols-3 dark:border-neutral-800 dark:bg-neutral-800">
                    <Stat label="Đơn hàng" value={String(orders.length)} />
                    <Stat label="Tổng chi tiêu" value={`${formatPrice(totalSpent)}₫`} />
                    <Stat label="Trạng thái" value="Thành viên" />
                </div>

                {notice && (
                    <div className="mb-8 border border-neutral-200 bg-white px-5 py-4 text-sm dark:border-neutral-800 dark:bg-[#181818]">
                        {notice}
                    </div>
                )}

                <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
                    <div className="space-y-6">
                        <div className="border border-neutral-200 bg-white p-7 dark:border-neutral-800 dark:bg-[#181818] md:p-9">
                            <div className="mb-8 flex items-start justify-between gap-4">
                                <div>
                                    <p className="mb-2 text-[11px] uppercase tracking-[0.3em] text-neutral-500">Hồ sơ cá nhân</p>
                                    <h2 className="text-2xl font-light">Thông tin của bạn</h2>
                                </div>
                                <button onClick={() => setEditing((value) => !value)} className="text-xs uppercase tracking-[0.18em] text-neutral-500 underline underline-offset-4 hover:text-black dark:hover:text-white">
                                    {editing ? "Đóng" : "Chỉnh sửa"}
                                </button>
                            </div>

                            {editing ? (
                                <form onSubmit={handleSave} className="space-y-5">
                                    <Field label="Tên hiển thị" value={form.username} onChange={(value) => setForm({ ...form, username: value })} />
                                    <Field label="Email" type="email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} />
                                    <Field label="Địa chỉ" value={form.address} onChange={(value) => setForm({ ...form, address: value })} />
                                    <button disabled={saving} className="w-full bg-black py-3 text-xs uppercase tracking-[0.2em] text-white transition hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-black">
                                        {saving ? "Đang lưu..." : "Lưu thay đổi"}
                                    </button>
                                </form>
                            ) : (
                                <div className="space-y-6">
                                    <InfoRow label="Tên hiển thị" value={user.name || user.username || "Chưa cập nhật"} />
                                    <InfoRow label="Email" value={user.email || "Chưa cập nhật"} />
                                    <InfoRow label="Địa chỉ" value={user.address || "Chưa cập nhật"} />
                                    <InfoRow label="Loại tài khoản" value="Khách hàng" />
                                </div>
                            )}
                        </div>

                        <div className="border border-neutral-200 bg-white p-7 dark:border-neutral-800 dark:bg-[#181818] md:p-9">
                            <p className="mb-2 text-[11px] uppercase tracking-[0.3em] text-neutral-500">Bảo mật</p>
                            <h2 className="mb-8 text-2xl font-light">Đổi mật khẩu</h2>
                            <form onSubmit={handleChangePassword} className="space-y-5">
                                <Field label="Mật khẩu hiện tại" type="password" value={passwordForm.currentPassword} onChange={(value) => setPasswordForm({ ...passwordForm, currentPassword: value })} />
                                <Field label="Mật khẩu mới" type="password" value={passwordForm.newPassword} onChange={(value) => setPasswordForm({ ...passwordForm, newPassword: value })} />
                                <button disabled={saving} className="w-full rounded-full bg-black py-3 text-xs uppercase tracking-[0.2em] text-white transition hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-black">{saving ? "Đang cập nhật..." : "Cập nhật mật khẩu"}</button>
                            </form>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Link href="/cart" className="flex-1 border border-neutral-300 bg-white px-5 py-4 text-center text-xs uppercase tracking-[0.18em] transition hover:border-black dark:border-neutral-700 dark:bg-[#181818] dark:hover:border-white">Giỏ hàng</Link>
                            <button onClick={handleLogout} className="flex-1 border border-neutral-300 px-5 py-4 text-xs uppercase tracking-[0.18em] text-neutral-500 transition hover:border-red-500 hover:text-red-500 dark:border-neutral-700">Đăng xuất</button>
                        </div>
                    </div>

                    <div>
                        <div className="mb-6 flex items-end justify-between border-b border-neutral-200 pb-5 dark:border-neutral-800">
                            <div>
                                <p className="mb-2 text-[11px] uppercase tracking-[0.3em] text-neutral-500">Theo dõi hành trình</p>
                                <h2 className="text-3xl font-light">Đơn hàng gần đây</h2>
                            </div>
                            <span className="text-sm text-neutral-500">{orders.length} đơn</span>
                        </div>
                        {loadingOrders ? (
                            <div className="border border-neutral-200 bg-white p-8 text-sm text-neutral-500 dark:border-neutral-800 dark:bg-[#181818]">Đang tải lịch sử đơn hàng...</div>
                        ) : orders.length === 0 ? (
                            <div className="border border-dashed border-neutral-300 bg-white p-10 text-center dark:border-neutral-700 dark:bg-[#181818]">
                                <p className="mb-3 text-4xl font-light">—</p>
                                <h3 className="mb-2 text-xl font-light">Hành trình của bạn bắt đầu từ đây</h3>
                                <p className="mb-7 text-sm text-neutral-500">Khám phá những thiết kế mới nhất của HyperLane.</p>
                                <Link href="/sanpham" className="inline-block bg-black px-6 py-3 text-xs uppercase tracking-[0.18em] text-white dark:bg-white dark:text-black">Mua sắm ngay</Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {orders.slice(0, 6).map((order) => (
                                    <div key={order.id} className="border border-neutral-200 bg-white p-6 transition hover:border-black dark:border-neutral-800 dark:bg-[#181818] dark:hover:border-white">
                                        <div className="flex flex-wrap items-start justify-between gap-4">
                                            <div>
                                                <p className="mb-2 text-xs uppercase tracking-[0.2em] text-neutral-500">#{order.id}</p>
                                                <p className="text-sm text-neutral-500">{order.createdAt ? new Date(order.createdAt).toLocaleDateString("vi-VN") : order.date || "—"}</p>
                                            </div>
                                            <span className="border border-neutral-200 px-3 py-1 text-[10px] uppercase tracking-[0.16em] dark:border-neutral-700">{statusLabels[order.status || ""] || order.status || "Đang xử lý"}</span>
                                        </div>
                                        <div className="mt-6 flex items-end justify-between border-t border-neutral-100 pt-5 dark:border-neutral-800">
                                            <span className="text-sm text-neutral-500">{order.items?.length || 0} sản phẩm</span>
                                            <span className="text-lg">{formatPrice(Number(order.total) || 0)}₫</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
}

function Stat({ label, value }: { label: string; value: string }) {
    return <div className="bg-white p-6 dark:bg-[#181818]"><p className="mb-3 text-[10px] uppercase tracking-[0.25em] text-neutral-500">{label}</p><p className="text-2xl font-light">{value}</p></div>;
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return <div><p className="mb-2 text-[10px] uppercase tracking-[0.22em] text-neutral-500">{label}</p><p className="break-all text-base">{value}</p></div>;
}

function Field({ label, value, type = "text", required = true, onChange }: { label: string; value: string; type?: string; required?: boolean; onChange: (value: string) => void }) {
    return <label className="block"><span className="mb-2 block text-[10px] uppercase tracking-[0.22em] text-neutral-500">{label}</span><input type={type} value={value} onChange={(event) => onChange(event.target.value)} required={required} className="w-full border-b border-neutral-300 bg-transparent px-0 py-3 outline-none focus:border-black dark:border-neutral-700 dark:focus:border-white" /></label>;
}
