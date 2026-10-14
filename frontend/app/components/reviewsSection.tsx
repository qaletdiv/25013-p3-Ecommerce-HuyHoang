"use client";

import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Review = { id: number; userName: string; rating: number; comment: string; createdAt: string };
const API = process.env.NEXT_PUBLIC_API_BASE;

export default function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [active, setActive] = useState(0);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  const loadReviews = async () => {
    try {
      const response = await fetch(`${API}/api/reviews`, { cache: "no-store" });
      const data = await response.json();
      if (Array.isArray(data)) setReviews(data);
    } catch {
      setReviews([]);
    }
  };

  useEffect(() => {
    setLoggedIn(Boolean(localStorage.getItem("token")));
    loadReviews();
    const timer = window.setInterval(loadReviews, 10000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (reviews.length < 2) return;
    const timer = window.setInterval(() => setActive((value) => (value + 1) % reviews.length), 5000);
    return () => window.clearInterval(timer);
  }, [reviews.length]);

  const visibleReviews = useMemo(() => reviews.length ? [...reviews, ...reviews, ...reviews] : [], [reviews]);
  const moveReview = (direction: number) => {
    setActive((value) => (value + direction + reviews.length) % reviews.length);
  };

  const submitReview = async (event: React.FormEvent) => {
    event.preventDefault();
    setSending(true);
    setMessage("");
    try {
      const response = await fetch(`${API}/api/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
        body: JSON.stringify({ rating, comment }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setLoggedIn(false);
          setMessage("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        } else if (response.status === 429) {
          setMessage("Bạn gửi quá nhiều yêu cầu. Vui lòng thử lại sau ít phút.");
        } else {
          setMessage(data.message || `Không thể gửi đánh giá (mã lỗi ${response.status}).`);
        }
        return;
      }
      setReviews((current) => [data, ...current]);
      setComment("");
      setRating(5);
      setMessage("Cảm ơn bạn đã chia sẻ đánh giá.");
    } catch {
      setMessage("Không thể kết nối máy chủ. Hãy kiểm tra backend đang chạy.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="overflow-hidden border-y border-neutral-200 bg-neutral-50 py-20 dark:border-neutral-800 dark:bg-[#171717] md:py-28">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="mb-12 text-center">
          <p className="mb-4 text-[10px] uppercase tracking-[0.4em] text-neutral-500">Cộng đồng HyperLane</p>
          <h2 className="text-4xl font-light tracking-tight md:text-6xl">Họ nói gì về chúng tôi?</h2>
        </div>

        {reviews.length ? (
          <div className="relative mx-auto max-w-6xl">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-neutral-50 to-transparent dark:from-[#171717] md:w-32" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-neutral-50 to-transparent dark:from-[#171717] md:w-32" />
            <div className="overflow-hidden">
              <div className="review-track flex items-start gap-5 transition-transform duration-700 ease-out" style={{ "--review-index": active } as React.CSSProperties}>
                {visibleReviews.map((review, index) => <ReviewCard key={`${review.id}-${index}`} review={review} />)}
              </div>
            </div>
            <button type="button" aria-label="Đánh giá trước" onClick={() => moveReview(-1)} className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full border border-neutral-200 bg-white/90 p-2 text-neutral-700 shadow-md transition hover:scale-105 hover:bg-white dark:border-neutral-700 dark:bg-[#111]/90 dark:text-white dark:hover:bg-[#111] md:-left-5"><ChevronLeft size={18} /></button>
            <button type="button" aria-label="Đánh giá tiếp theo" onClick={() => moveReview(1)} className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full border border-neutral-200 bg-white/90 p-2 text-neutral-700 shadow-md transition hover:scale-105 hover:bg-white dark:border-neutral-700 dark:bg-[#111]/90 dark:text-white dark:hover:bg-[#111] md:-right-5"><ChevronRight size={18} /></button>
            <div className="mt-8 flex justify-center gap-2">
              {reviews.slice(0, Math.min(5, reviews.length)).map((review, index) => <button key={review.id} type="button" aria-label={`Xem đánh giá ${index + 1}`} onClick={() => setActive(index)} className={`h-1.5 rounded-full transition-all ${active % reviews.length === index ? "w-10 bg-neutral-900 dark:bg-white" : "w-2 bg-neutral-300 dark:bg-neutral-600"}`} />)}
            </div>
          </div>
        ) : (
          <p className="py-12 text-center text-sm text-neutral-500">Hãy là người đầu tiên chia sẻ cảm nhận về HyperLane.</p>
        )}

        {loggedIn ? (
          <form onSubmit={submitReview} className="mx-auto mt-16 max-w-xl rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-[#111] md:p-8">
            <p className="mb-5 text-center text-[10px] uppercase tracking-[0.3em] text-neutral-500">Chia sẻ trải nghiệm</p>
            <div className="mb-5 flex justify-center gap-2" aria-label="Chọn số sao">
              {[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" aria-label={`${value} sao`} onClick={() => setRating(value)}><Star size={22} className={value <= rating ? "fill-amber-400 text-amber-400" : "text-neutral-300 dark:text-neutral-600"} /></button>)}
            </div>
            <textarea required minLength={5} maxLength={500} value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Chia sẻ cảm nhận của bạn..." rows={3} className="w-full resize-none rounded-xl border border-neutral-200 bg-transparent p-4 text-sm outline-none transition focus:border-neutral-900 focus:ring-4 focus:ring-neutral-900/5 dark:border-neutral-700 dark:focus:border-white" />
            <div className="mt-4 flex items-center justify-between gap-4"><span className="text-xs text-neutral-500">{message}</span><button disabled={sending} className="rounded-full bg-neutral-900 px-5 py-2.5 text-xs uppercase tracking-[0.15em] text-white transition hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-black">{sending ? "Đang gửi..." : "Gửi đánh giá"}</button></div>
          </form>
        ) : <p className="mt-12 text-center text-xs text-neutral-500">Đăng nhập để gửi đánh giá của bạn.</p>}
      </div>
    </section>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return <article className="min-w-full shrink-0 break-words rounded-2xl border border-neutral-200 bg-white p-7 shadow-sm dark:border-neutral-700 dark:bg-[#111] md:min-w-[calc(33.333% - 0.84rem)]"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div className="flex gap-0.5">{[1, 2, 3, 4, 5].map((value) => <Star key={value} size={14} className={value <= review.rating ? "fill-amber-400 text-amber-400" : "text-neutral-300 dark:text-neutral-600"} />)}</div><span className="text-[10px] text-neutral-400">{new Date(review.createdAt).toLocaleDateString("vi-VN")}</span></div><p className="whitespace-normal break-words text-sm leading-7 text-neutral-600 dark:text-neutral-300">“{review.comment}”</p><p className="mt-6 text-xs uppercase tracking-[0.18em] text-neutral-500">{review.userName}</p></article>;
}
