"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/utils/formatPrice";
import { Check, CircleDot, PackageCheck, Truck, X } from "lucide-react";

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
    paymentMethod?: string;
    paymentStatus?: string;
    subtotal?: number;
    discountAmount?: number;
    discountCode?: string;
    shippingFee?: number;
    shippingName?: string;
    shippingPhone?: string;
    shippingAddress?: string;
    createdAt?: string;
    date?: string;
    items?: Array<{
        id: number | string;
        productName?: string;
        name?: string;
        thumbnail?: string;
        unitPrice?: number;
        price?: number;
        quantity: number;
    }>;
};

const statusLabels: Record<string, string> = {
    pending: "Chờ xác nhận",
    confirmed: "Đã xác nhận",
    shipping: "Giao hàng",
    delivering: "Đang giao",
    completed: "Hoàn tất",
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
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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

            fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/orders/mine`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
                },
            })
                .then(async (response) => {
                    if (response.status === 429) {
                        const retryAfter = response.headers.get("Retry-After");
                        throw new Error(retryAfter
                            ? `Bạn thao tác quá nhanh. Vui lòng thử lại sau ${retryAfter} giây.`
                            : "Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút.");
                    }
                    if (response.status === 401 || response.status === 403) {
                        localStorage.removeItem("user");
                        localStorage.removeItem("token");
                        router.replace("/login");
                        return [];
                    }
                    return response.ok ? response.json() : [];
                })
                .then((data) => setOrders(Array.isArray(data) ? data : []))
                .catch((requestError) => {
                    setOrders([]);
                    setNotice(requestError instanceof Error ? requestError.message : "Không thể tải lịch sử đơn hàng.");
                })
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

    const handleCancelOrder = async (orderId: string) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/orders/${orderId}/cancel`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `******"token") || ""}`,
            },
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            setNotice(data.message || "Không thể hủy đơn hàng.");
            return;
        }
        setOrders((current) => current.map((order) => order.id === orderId ? { ...order, status: "cancelled" } : order));
        setNotice("Đã hủy đơn hàng.");
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
                                    <div key={order.id} role="button" tabIndex={0} onClick={() => setSelectedOrder(order)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setSelectedOrder(order); }} className="block w-full cursor-pointer border border-neutral-200 bg-white p-6 text-left transition hover:border-black dark:border-neutral-800 dark:bg-[#181818] dark:hover:border-white">
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
                                        {["pending", "confirmed"].includes(order.status || "") && (
                                            <button type="button" onClick={() => handleCancelOrder(order.id)} className="mt-4 text-xs uppercase tracking-[0.16em] text-red-500 underline underline-offset-4">
                                                Hủy đơn hàng
                                            </button>
                                        )}
                                        <p className="mt-4 text-[10px] uppercase tracking-[0.16em] text-neutral-400">Xem chi tiết đơn hàng →</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>
            {selectedOrder && <OrderDetail order={selectedOrder} onClose={() => setSelectedOrder(null)} onCancel={handleCancelOrder} />}
        </main>
    );
}

function OrderDetail({ order, onClose, onCancel }: { order: Order; onClose: () => void; onCancel: (id: string) => void }) {
    const steps = [
        { key: "pending", label: "Chờ xác nhận", icon: CircleDot },
        { key: "confirmed", label: "Đã xác nhận", icon: Check },
        { key: "shipping", label: "Giao hàng", icon: PackageCheck },
        { key: "delivering", label: "Đang giao", icon: Truck },
        { key: "completed", label: "Hoàn tất", icon: Check },
    ];
    const currentIndex = order.status === "cancelled" ? -1 : Math.max(0, steps.findIndex((step) => step.key === order.status));
    return <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-6">
        <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto bg-white text-neutral-950 shadow-2xl dark:bg-[#181818] dark:text-neutral-100">
            <div className="sticky top-0 z-10 flex items-start justify-between border-b border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-[#181818]">
                <div><p className="text-[10px] uppercase tracking-[0.25em] text-neutral-500">Chi tiết giao dịch</p><h2 className="mt-2 text-2xl font-light">Đơn hàng #{order.id}</h2></div>
                <button type="button" onClick={onClose} aria-label="Đóng" className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"><X size={20} /></button>
            </div>
            <div className="space-y-8 p-6 md:p-8">
                <div className="rounded-xl border border-neutral-200 p-5 dark:border-neutral-800">
                    <p className="mb-6 text-xs font-medium uppercase tracking-[0.18em]">Trạng thái đơn hàng</p>
                    {order.status === "cancelled" ? <p className="text-sm text-red-500">Đơn hàng đã được hủy.</p> : <div className="space-y-5">{steps.map((step, index) => { const Icon = step.icon; const active = index <= currentIndex; return <div key={step.key} className="flex items-center gap-4"><div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${active ? "bg-black text-white dark:bg-white dark:text-black" : "bg-neutral-100 text-neutral-400 dark:bg-neutral-800"}`}><Icon size={16} /></div><div className="flex-1"><p className={`text-sm ${active ? "font-medium" : "text-neutral-400"}`}>{step.label}</p><div className="mt-2 h-1 rounded-full bg-neutral-100 dark:bg-neutral-800"><div className={`h-full rounded-full bg-black transition-all dark:bg-white ${active ? "w-full" : "w-0"}`} /></div></div></div>; })}</div>}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    <InfoRow label="Thanh toán" value={order.paymentMethod === "stripe" ? "Stripe online" : "Thanh toán khi nhận hàng"} />
                    <InfoRow label="Tình trạng thanh toán" value={order.paymentStatus === "paid" ? "Đã thanh toán" : "Chưa thanh toán"} />
                    <InfoRow label="Người nhận" value={order.shippingName || "—"} />
                    <InfoRow label="Số điện thoại" value={order.shippingPhone || "—"} />
                    <div className="sm:col-span-2"><InfoRow label="Địa chỉ giao hàng" value={order.shippingAddress || "—"} /></div>
                </div>
                <div>
                    <h3 className="mb-4 text-lg font-light">Sản phẩm</h3>
                    <div className="divide-y divide-neutral-200 border-y border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">{(order.items || []).map((item) => <div key={item.id} className="flex items-center gap-3 py-4"><img src={item.thumbnail || "/placeholder-product.svg"} alt={item.productName || item.name || "Sản phẩm"} className="h-14 w-12 object-cover bg-neutral-100 dark:bg-neutral-800" /><div className="min-w-0 flex-1"><p className="truncate text-sm">{item.productName || item.name || "Sản phẩm"}</p><p className="mt-1 text-xs text-neutral-500">Số lượng: {item.quantity}</p></div><span className="text-sm">{formatPrice(Number(item.unitPrice || item.price || 0) * item.quantity)}₫</span></div>)}</div>
                </div>
                <div className="space-y-3 border-t border-neutral-200 pt-5 text-sm dark:border-neutral-800"><div className="flex justify-between text-neutral-500"><span>Tạm tính</span><span>{formatPrice(Number(order.subtotal) || 0)}₫</span></div><div className="flex justify-between text-neutral-500"><span>Phí vận chuyển</span><span>{Number(order.shippingFee) ? `${formatPrice(Number(order.shippingFee))}₫` : "Miễn phí"}</span></div>{Number(order.discountAmount) > 0 && <div className="flex justify-between text-emerald-600"><span>Giảm giá {order.discountCode ? `(${order.discountCode})` : ""}</span><span>-{formatPrice(Number(order.discountAmount))}₫</span></div>}<div className="flex justify-between border-t border-neutral-200 pt-4 text-lg dark:border-neutral-800"><span>Tổng thanh toán</span><strong>{formatPrice(Number(order.total) || 0)}₫</strong></div></div>
                {["pending", "confirmed"].includes(order.status || "") && <button type="button" onClick={() => { onCancel(order.id); onClose(); }} className="w-full border border-red-200 py-3 text-xs uppercase tracking-[0.16em] text-red-500 transition hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/30">Hủy đơn hàng</button>}
            </div>
        </div>
    </div>;
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
