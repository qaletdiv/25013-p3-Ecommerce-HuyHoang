"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as yup from "yup";

const schema = yup.object().shape({
    name: yup
        .string()
        .min(3, "Tên phải có ít nhất 3 ký tự")
        .required("Tên không được để trống"),

    email: yup
        .string()
        .email("Email không hợp lệ")
        .required("Email không được để trống"),

    password: yup
        .string()
        .min(6, "Mật khẩu phải ít nhất 6 ký tự")
        .matches(/[A-Z]/, "Phải có ít nhất 1 chữ hoa")
        .matches(/[0-9]/, "Phải có ít nhất 1 số")
        .required("Mật khẩu không được để trống"),

    confirmPassword: yup
        .string()
        .oneOf([yup.ref("password")], "Mật khẩu nhập lại không khớp")
        .required("Vui lòng nhập lại mật khẩu"),
});

export default function RegisterPage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [errors, setErrors] = useState<any>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await schema.validate(formData, { abortEarly: false });

            setErrors({});

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE}/api/auth/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        username: formData.name,
                        email: formData.email,
                        password: formData.password,
                    }),
                }
            );

            const data = await res.json();

            if (res.ok) {
                alert("Đăng ký thành công");
                router.push("/login");
            } else {
                alert(data.message || "Đăng ký thất bại");
            }
        } catch (err: any) {
            if (err.inner) {
                const newErrors: any = {};

                err.inner.forEach((error: any) => {
                    newErrors[error.path] = error.message;
                });

                setErrors(newErrors);
            } else {
                alert("Có lỗi xảy ra");
            }
        }
    };

    return (
        <div className="min-h-screen grid md:grid-cols-2 bg-white">
            {/* Left banner */}
            <div
                className="hidden md:flex bg-cover bg-center relative"
                style={{
                    backgroundImage:
                        "url('https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80')",
                }}
            >
                <div className="absolute inset-0 bg-black/30" />

                <div className="relative z-10 flex flex-col justify-end p-16 text-white">
                    <p className="text-sm tracking-[0.35em] uppercase mb-3">
                        Tham gia phong trào
                    </p>

                    <h1 className="text-5xl font-light leading-tight">
                        Tạo tài khoản của bạn
                    </h1>

                    <p className="mt-4 text-sm opacity-80 max-w-md">
                        Hãy trở thành một phần của trải nghiệm thời trang hiện đại được tạo nên cho
                        sự thanh lịch vượt thời gian.
                    </p>
                </div>
            </div>

            {/* Register form */}
            <div className="flex items-center justify-center px-8 md:px-20">
                <div className="w-full max-w-md">
                    <div className="mb-14">
                        <h1 className="text-3xl font-light tracking-[0.25em] uppercase">
                            HyperLane
                        </h1>

                        <p className="text-gray-500 mt-3 text-sm tracking-wide">
                            Tạo tài khoản của bạn để bắt đầu hành trình thời trang hiện đại và vượt thời gian với chúng tôi.
                        </p>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-7"
                    >
                        {/* Name */}
                        <div>
                            <label className="block text-xs uppercase tracking-[0.2em] mb-3 text-gray-600">
                                Tên Đăng Nhập
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full border-b border-gray-300 py-3 bg-transparent outline-none focus:border-black transition"
                            />
                            <p className="text-red-500 text-xs mt-2">
                                {errors.name}
                            </p>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-xs uppercase tracking-[0.2em] mb-3 text-gray-600">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full border-b border-gray-300 py-3 bg-transparent outline-none focus:border-black transition"
                            />
                            <p className="text-red-500 text-xs mt-2">
                                {errors.email}
                            </p>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs uppercase tracking-[0.2em] mb-3 text-gray-600">
                                Mật khẩu
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full border-b border-gray-300 py-3 bg-transparent outline-none focus:border-black transition"
                            />
                            <p className="text-red-500 text-xs mt-2">
                                {errors.password}
                            </p>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-xs uppercase tracking-[0.2em] mb-3 text-gray-600">
                                Xác nhận mật khẩu
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full border-b border-gray-300 py-3 bg-transparent outline-none focus:border-black transition"
                            />
                            <p className="text-red-500 text-xs mt-2">
                                {errors.confirmPassword}
                            </p>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-black text-white py-4 uppercase tracking-[0.2em] text-sm hover:bg-neutral-800 transition"
                        >
                            Tạo tài khoản
                        </button>
                    </form>

                    <p className="text-sm text-gray-500 mt-10 text-center">
                        Đã có tài khoản?{" "}
                        <a
                            href="/login"
                            className="text-black hover:underline"
                        >
                            Đăng nhập
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}