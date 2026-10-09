"use client";

import { jwtDecode } from "jwt-decode";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
    const router = useRouter();
    const apiBase = process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        setLoading(true);
        setError("");

        try {
            if (!apiBase) {
                throw new Error("API_BASE_MISSING");
            }

            const res = await fetch(
                `${apiBase}/api/auth/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        emailOrUsername: email,
                        password,
                    }),
                }
            );

            const data = await res.json().catch(() => ({}));

            if (res.ok) {
                if (typeof data.token !== "string" || !data.token) {
                    throw new Error("INVALID_LOGIN_RESPONSE");
                }
                const decoded: any = jwtDecode(data.token);

                const user = {
                    id: decoded.id,
                    name: decoded.name,
                    email: decoded.email,
                    role: decoded.role,
                };

                localStorage.setItem(
                    "user",
                    JSON.stringify(user)
                );

                document.cookie = `token=${data.token}; path=/`;

                localStorage.setItem(
                    "token",
                    data.token
                );

                localStorage.removeItem("cart");

                router.push(
                    user.role === "admin"
                        ? "/admin/products"
                        : "/"
                );

                router.refresh();
            } else {
                const validationMessage = Array.isArray(data.errors)
                    ? data.errors.map((item: { msg?: string }) => item.msg).filter(Boolean).join(", ")
                    : "";
                setError(data.message || validationMessage || "Đăng nhập thất bại");
            }
        } catch (err) {
            if (err instanceof TypeError || (err instanceof Error && err.message === "API_BASE_MISSING")) {
                setError("Không thể kết nối máy chủ. Hãy khởi động backend tại cổng 3001 rồi thử lại.");
            } else if (err instanceof Error && err.message === "INVALID_LOGIN_RESPONSE") {
                setError("Máy chủ trả về dữ liệu đăng nhập không hợp lệ.");
            } else {
                setError("Đã xảy ra lỗi khi đăng nhập. Vui lòng kiểm tra thông tin và thử lại.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid md:grid-cols-2 bg-white">

                {/* Left Banner */}
                <div
                    className="hidden md:flex bg-cover bg-center relative"
                    style={{
                        backgroundImage:
                            "url('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200')",
                    }}
                >
                    <div className="absolute inset-0 bg-black/30" />

                    <div className="relative z-10 flex flex-col justify-end p-16 text-white">
                        <p className="text-xs tracking-[0.35em] uppercase mb-4 opacity-80">
                            HyperLane 2026
                        </p>

                        <h1 className="text-5xl font-light leading-tight">
                            Phong cách của bạn
                            <br />
                            Hiện đại sang trọng
                        </h1>

                        <p className="mt-5 text-sm opacity-80 max-w-sm leading-7">
                            Những đường nét tối giản,
                            những món đồ thiết yếu vượt thời gian,
                            được thiết kế để thể hiện cá tính hiện đại.
                        </p>
                    </div>
                </div>

                {/* Form */}
                <div className="flex items-center justify-center px-8 md:px-20">
                    <div className="w-full max-w-md">

                        {/* Logo */}
                        <div className="mb-16">
                            <h1 className="text-3xl font-light tracking-[0.35em] uppercase">
                                HyperLane
                            </h1>

                            <p className="text-neutral-500 mt-4 text-sm">
                                Đăng nhập vào tài khoản của bạn
                            </p>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="mb-6 text-sm text-red-500 border border-red-200 bg-red-50 px-4 py-3">
                                {error}
                            </div>
                        )}

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-8"
                        >
                            <div>
                                <label className="block text-xs uppercase tracking-[0.2em] text-neutral-500 mb-3">
                                    Email hoặc tên đăng nhập
                                </label>

                                <input
                                    type="text"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(
                                            e.target.value
                                        )
                                    }
                                    required
                                    className="w-full border-b border-neutral-300 py-3 bg-transparent outline-none focus:border-black transition"
                                />
                            </div>

                            <div>
                                <label className="block text-xs uppercase tracking-[0.2em] text-neutral-500 mb-3">
                                    Mật khẩu
                                </label>

                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(
                                            e.target.value
                                        )
                                    }
                                    required
                                    className="w-full border-b border-neutral-300 py-3 bg-transparent outline-none focus:border-black transition"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-black text-white py-4 uppercase tracking-[0.25em] text-sm hover:bg-neutral-800 transition disabled:opacity-50"
                            >
                                {loading
                                    ? "Đang đăng nhập..."
                                    : "Đăng nhập"}
                            </button>
                        </form>

                        {/* Bottom Links */}
                        <div className="mt-10 flex justify-between text-sm text-neutral-500">
                            <Link
                                href="#"
                                className="hover:text-black transition"
                            >
                                Quên mật khẩu?
                            </Link>

                            <Link
                                href="/register"
                                className="hover:text-black transition"
                            >
                                Tạo tài khoản mới
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );

}
