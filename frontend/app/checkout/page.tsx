"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";
import { formatPrice } from "@/utils/formatPrice";

type Payment = {
    id: string;
    name: string;
    type: "cash" | "bank" | "qr";
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    qr?: string;
};

const mockQrPayment: Payment = {
    id: "mock-qr",
    name: "Quét mã QR (mô phỏng)",
    type: "qr",
};

const mockCashPayment: Payment = {
    id: "cod",
    name: "Thanh toán khi nhận hàng",
    type: "cash",
};

type Shipping = {
    name: string;
    phone: string;
    address: string;
};

export default function CheckoutPage() {
    const router = useRouter();
    const { cart, clearCart } = useCart();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [payments, setPayments] = useState<Payment[]>([]);
    const [paymentMethod, setPaymentMethod] = useState("");
    const [shipping, setShipping] = useState<Shipping>({ name: "", phone: "", address: "" });

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser || storedUser === "undefined") {
            router.replace("/login");
            return;
        }

        try {
            const user = JSON.parse(storedUser);
            if (user.role === "admin") {
                router.replace("/admin");
                return;
            }
            setShipping((current) => ({ ...current, name: user.name || user.username || "" }));
        } catch {
            localStorage.removeItem("user");
            router.replace("/login");
            return;
        }

        fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/payments`)
            .then(async (response) => {
                if (!response.ok) return [];
                const data = await response.json();
                return Array.isArray(data) ? data : [];
            })
            .then((data: Payment[]) => {
                const availablePayments = data.length
                    ? data.some((payment) => payment.type === "qr")
                        ? data
                        : [...data, mockQrPayment]
                    : [mockCashPayment, mockQrPayment];
                setPayments(availablePayments);
                setPaymentMethod(availablePayments[0]?.id || "cod");
            })
            .catch(() => {
                setPayments([mockCashPayment, mockQrPayment]);
                setPaymentMethod(mockCashPayment.id);
            })
            .finally(() => setLoading(false));
    }, [router]);

    useEffect(() => {
        if (!loading && cart.length === 0) router.replace("/cart");
    }, [cart.length, loading, router]);

    const total = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
    const selectedPayment = payments.find((payment) => payment.id === paymentMethod);
    const paymentLabel = selectedPayment?.name || "Thanh toán khi nhận hàng";

    const updateShipping = (key: keyof Shipping, value: string) => {
        setShipping((current) => ({ ...current, [key]: value }));
        setError("");
    };

    const handleConfirm = async () => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            router.push("/login");
            return;
        }

        let user: { id: string };
        try {
            user = JSON.parse(storedUser);
        } catch {
            router.push("/login");
            return;
        }

        if (!shipping.name.trim() || !shipping.phone.trim() || !shipping.address.trim()) {
            setError("Vui lòng điền đầy đủ thông tin giao hàng.");
            return;
        }
        if (!/^[0-9+\s()-]{8,}$/.test(shipping.phone.trim())) {
            setError("Số điện thoại không hợp lệ.");
            return;
        }
        if (!paymentMethod) {
            setError("Vui lòng chọn phương thức thanh toán.");
            return;
        }
        if (!cart.length) {
            setError("Giỏ hàng đang trống.");
            return;
        }

        setSubmitting(true);
        setError("");
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/orders`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
                },
                body: JSON.stringify({
                    userId: user.id,
                    name: shipping.name.trim(),
                    phone: shipping.phone.trim(),
                    address: shipping.address.trim(),
                    items: cart.map((item) => ({ variantId: item.variantId, quantity: item.quantity })),
                    paymentMethod,
                }),
            });
            const result = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(result.message || "Không thể tạo đơn hàng. Vui lòng thử lại.");

            const savedOrder = {
                id: result.orderId || `o-${Date.now()}`,
                userId: user.id,
                ...shipping,
                items: cart,
                total,
                paymentMethod,
                status: "pending",
                createdAt: new Date().toISOString(),
                date: new Date().toLocaleDateString("vi-VN"),
            };
            const storedOrders = JSON.parse(localStorage.getItem("orders") || "[]");
            localStorage.setItem("orders", JSON.stringify([...(Array.isArray(storedOrders) ? storedOrders : []), savedOrder]));
            clearCart();
            router.push("/confirm-checkout");
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : "Không thể tạo đơn hàng.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <PageMessage text="Đang chuẩn bị thanh toán..." />;
    if (!cart.length) return <PageMessage text="Đang chuyển đến giỏ hàng..." />;

    return (
        <main className="min-h-screen bg-neutral-50 text-neutral-950 dark:bg-[#111] dark:text-neutral-100">
            <div className="mx-auto max-w-7xl px-6 py-10 md:px-10 md:py-16">
                <div className="mb-12 border-b border-neutral-200 pb-8 dark:border-neutral-800">
                    <p className="mb-4 text-[11px] uppercase tracking-[0.35em] text-neutral-500">HyperLane / Checkout</p>
                    <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
                        <div>
                            <h1 className="text-4xl font-light tracking-tight md:text-6xl">Hoàn tất đơn hàng</h1>
                            <p className="mt-4 text-sm text-neutral-500">Kiểm tra thông tin trước khi đơn hàng được gửi đi.</p>
                        </div>
                        <Link href="/cart" className="text-xs uppercase tracking-[0.18em] underline underline-offset-4">← Quay lại giỏ hàng</Link>
                    </div>
                </div>

                {error && <div className="mb-8 border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">{error}</div>}

                <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr]">
                    <div className="space-y-8">
                        <section className="border border-neutral-200 bg-white p-7 dark:border-neutral-800 dark:bg-[#181818] md:p-10">
                            <SectionTitle number="01" title="Thông tin giao hàng" />
                            <div className="grid gap-6 md:grid-cols-2">
                                <Field label="Họ và tên" value={shipping.name} onChange={(value) => updateShipping("name", value)} />
                                <Field label="Số điện thoại" value={shipping.phone} type="tel" onChange={(value) => updateShipping("phone", value)} />
                                <div className="md:col-span-2"><Field label="Địa chỉ nhận hàng" value={shipping.address} multiline onChange={(value) => updateShipping("address", value)} /></div>
                            </div>
                        </section>

                        <section className="border border-neutral-200 bg-white p-7 dark:border-neutral-800 dark:bg-[#181818] md:p-10">
                            <SectionTitle number="02" title="Phương thức thanh toán" />
                            <div className="space-y-3">
                                {payments.map((payment) => (
                                    <label key={payment.id} className={`flex cursor-pointer items-center justify-between border p-5 transition ${paymentMethod === payment.id ? "border-black dark:border-white" : "border-neutral-200 dark:border-neutral-700"}`}>
                                        <span className="flex items-center gap-4"><input type="radio" name="payment" checked={paymentMethod === payment.id} onChange={() => setPaymentMethod(payment.id)} /> <span className="text-sm">{payment.name}</span></span>
                                        <span className="text-xs text-neutral-400">{payment.type === "cash" ? "COD" : payment.type === "bank" ? "BANK" : "QR"}</span>
                                    </label>
                                ))}
                            </div>
                            <PaymentDetail payment={selectedPayment} label={paymentLabel} />
                        </section>
                    </div>

                    <aside className="h-fit border border-neutral-200 bg-white p-7 lg:sticky lg:top-28 dark:border-neutral-800 dark:bg-[#181818] md:p-10">
                        <div className="mb-8 flex items-end justify-between border-b border-neutral-200 pb-6 dark:border-neutral-800"><div><p className="mb-2 text-[10px] uppercase tracking-[0.25em] text-neutral-500">03 / Review</p><h2 className="text-2xl font-light">Đơn hàng của bạn</h2></div><span className="text-sm text-neutral-500">{cart.length} món</span></div>
                        <div className="space-y-5">
                            {cart.map((item) => <div key={item.id} className="flex gap-4"><img src={item.thumbnail || "/placeholder-product.svg"} alt={item.name} className="h-20 w-16 object-cover bg-neutral-100 dark:bg-neutral-800" /><div className="min-w-0 flex-1"><p className="truncate text-sm">{item.name}</p><p className="mt-1 text-xs text-neutral-500">{item.color} / {item.size} · SL {item.quantity}</p><p className="mt-2 text-sm">{formatPrice(item.price * item.quantity)}₫</p></div></div>)}
                        </div>
                        <div className="mt-8 space-y-4 border-t border-neutral-200 pt-6 text-sm dark:border-neutral-800"><div className="flex justify-between"><span className="text-neutral-500">Tạm tính</span><span>{formatPrice(total)}₫</span></div><div className="flex justify-between"><span className="text-neutral-500">Vận chuyển</span><span>Miễn phí</span></div><div className="flex justify-between border-t border-neutral-200 pt-5 text-xl dark:border-neutral-800"><span>Tổng cộng</span><span>{formatPrice(total)}₫</span></div></div>
                        <button type="button" onClick={handleConfirm} disabled={submitting} className="mt-8 w-full bg-black py-4 text-xs uppercase tracking-[0.2em] text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black">{submitting ? "Đang xử lý..." : "Xác nhận đặt hàng"}</button>
                        <p className="mt-5 text-center text-xs leading-5 text-neutral-500">Bằng cách đặt hàng, bạn đồng ý với các điều khoản mua hàng của HyperLane.</p>
                    </aside>
                </div>
            </div>
        </main>
    );
}

function PageMessage({ text }: { text: string }) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-neutral-500">{text}</div>;
}

function SectionTitle({ number, title }: { number: string; title: string }) {
    return <div className="mb-8 flex items-center gap-4"><span className="text-xs text-neutral-400">{number}</span><h2 className="text-2xl font-light">{title}</h2></div>;
}

function Field({ label, value, onChange, type = "text", multiline = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; multiline?: boolean }) {
    const className = "w-full border-b border-neutral-300 bg-transparent px-0 py-3 text-sm outline-none transition focus:border-black dark:border-neutral-700 dark:focus:border-white";
    return <label className="block"><span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-neutral-500">{label}</span>{multiline ? <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={3} required className={className} /> : <input value={value} onChange={(event) => onChange(event.target.value)} type={type} required className={className} />}</label>;
}

function PaymentDetail({ payment, label }: { payment?: Payment; label: string }) {
    if (!payment || payment.type === "cash") return <div className="mt-5 bg-neutral-50 p-5 text-sm text-neutral-500 dark:bg-[#111]">{label} — thanh toán an toàn khi nhận hàng.</div>;
    if (payment.type === "bank") return <div className="mt-5 space-y-2 bg-neutral-50 p-5 text-sm dark:bg-[#111]"><p>Ngân hàng: {payment.bankName}</p><p>Số tài khoản: {payment.accountNumber}</p><p>Chủ tài khoản: {payment.accountName}</p></div>;
    return (
        <div className="mt-5 bg-neutral-50 p-5 text-center dark:bg-[#111]">
            {payment.qr ? (
                <img src={payment.qr} alt="Mã QR thanh toán" className="mx-auto h-40 w-40 object-contain" />
            ) : (
                <MockQrCode />
            )}
            <p className="mt-3 text-xs text-neutral-500">
                {payment.id === "mock-qr"
                    ? "Mã QR mô phỏng — chưa phát sinh giao dịch thật"
                    : "Quét mã để thanh toán"}
            </p>
        </div>
    );
}

function MockQrCode() {
    const cells = [
        "111111100101111111",
        "100000101101100001",
        "101110100001101101",
        "101110101111101101",
        "101110100100101101",
        "100000101011100001",
        "111111101010111111",
        "000000001101000000",
        "110101111001101011",
        "001011001111010100",
        "111100111010111001",
        "010110010101001110",
        "111111100111010101",
        "100000101001111000",
        "101110101111001101",
        "101110100010111011",
        "101110101100100101",
        "100000100111011010",
        "111111101010110111",
    ];

    return (
        <div className="mx-auto grid h-40 w-40 grid-cols-[repeat(19,minmax(0,1fr))] border-8 border-white bg-white shadow-sm" aria-label="Mã QR mô phỏng">
            {cells.flatMap((row, rowIndex) =>
                [...row].map((cell, columnIndex) => (
                    <span
                        key={`${rowIndex}-${columnIndex}`}
                        className={cell === "1" ? "bg-black" : "bg-white"}
                    />
                ))
            )}
        </div>
    );
}
