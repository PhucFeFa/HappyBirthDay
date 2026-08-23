"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import StarField from "@/components/StarField";
import type { ThemeKey } from "@/lib/utils";
import { THEMES } from "@/lib/utils";

interface CardStatus {
  recipientName: string;
  theme: ThemeKey;
  wishCount: number;
  description?: string | null;
  imageUrl?: string | null;
}

/** Reusable clean notebook-paper card. No torn edges. */
function NotebookCard({
  children,
  bg = "#fffdf0",
  lineColor = "#f0e8c8",
  marginColor = "#f093b0",
  tapeColor = "#fce38a",
  className = "",
}: {
  children: React.ReactNode;
  bg?: string;
  lineColor?: string;
  marginColor?: string;
  tapeColor?: string;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        position: "relative",
        backgroundColor: bg,
        borderRadius: 6,
        overflow: "hidden",
        boxShadow: "0 8px 28px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.12)",
        backgroundImage: `repeating-linear-gradient(transparent, transparent 27px, ${lineColor} 27px, ${lineColor} 28.5px)`,
        backgroundPositionY: "44px",
      }}
    >
      {/* Washi tape */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: 60,
          height: 16,
          background: tapeColor,
          opacity: 0.88,
          borderRadius: "0 0 4px 4px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.08)",
          zIndex: 10,
        }}
      />

      {/* Left margin stripe */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 40,
          width: 1.5,
          background: marginColor,
          opacity: 0.55,
        }}
      />

      {/* Spiral holes */}
      <div
        aria-hidden
        style={{ position: "absolute", top: 14, left: 13, display: "flex", flexDirection: "column", gap: 22 }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 11,
              height: 11,
              borderRadius: "50%",
              background: "rgba(0,0,0,0.06)",
              boxShadow: "inset 0 1px 3px rgba(0,0,0,0.13)",
              border: "1px solid rgba(0,0,0,0.05)",
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div style={{ paddingLeft: 52, paddingRight: 18, paddingTop: 24, paddingBottom: 18 }}>
        {children}
      </div>
    </div>
  );
}

export default function WishPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [status, setStatus] = useState<CardStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [authorName, setAuthorName] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ authorName?: string; message?: string }>({});

  useEffect(() => {
    fetch(`/api/cards/${slug}/status`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then((data) => {
        if (data) {
          setStatus({
            recipientName: data.recipientName,
            theme: data.theme as ThemeKey,
            wishCount: data.wishCount,
            description: data.description,
            imageUrl: data.imageUrl,
          });
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    const errs: typeof fieldErrors = {};
    if (!isAnonymous && !authorName.trim()) errs.authorName = "Vui lòng nhập tên của bạn";
    if (!message.trim()) errs.message = "Vui lòng viết nội dung lời chúc";
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setFieldErrors({});
    setSubmitting(true);
    try {
      const res = await fetch(`/api/cards/${slug}/wishes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorName: isAnonymous ? "" : authorName.trim(), isAnonymous, message: message.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setSubmitError(data.error ?? "Có lỗi xảy ra"); return; }
      setSubmitted(true);
    } catch { setSubmitError("Không thể kết nối đến máy chủ"); }
    finally { setSubmitting(false); }
  };

  const theme = status?.theme ?? "pink";
  const t = THEMES[theme];
  const bg = {
    background: `radial-gradient(ellipse at top, ${t.primary}20, transparent 60%),
                 radial-gradient(ellipse at bottom, ${t.secondary}15, transparent 60%), #0a0a0f`,
  };

  if (loading) return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center" style={bg}>
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-3" />
        <p className="text-white/50 text-sm">Đang tải...</p>
      </div>
    </main>
  );

  if (notFound) return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4" style={{ background: "#0a0a0f" }}>
      <div className="glass-card p-10 text-center max-w-sm">
        <div className="text-4xl mb-3">🔍</div>
        <h2 className="font-display text-xl text-white mb-2">Không tìm thấy thiệp</h2>
        <p className="text-white/50 text-sm">Liên kết không chính xác hoặc đã hết hạn.</p>
      </div>
    </main>
  );

  if (submitted) return (
    <main className="min-h-[calc(100vh-4rem)] relative flex items-center justify-center p-4" style={bg}>
      <StarField color={t.primary} />
      <div className="relative z-10 max-w-sm w-full fade-in-up">
        <NotebookCard bg="#fffdf0" lineColor="#f0e8c8" marginColor="#f093b0" tapeColor="#fce38a">
          <div className="py-4 text-center">
            <div className="text-4xl mb-3">🎉</div>
            <h2 className="font-note text-2xl font-bold text-gray-900 mb-1">Đã gửi lời chúc!</h2>
            <p className="font-note text-base text-gray-700 mb-0.5">
              Lời chúc {isAnonymous ? "(ẩn danh) " : ""}của bạn đã được gửi đến
            </p>
            <p className="font-script text-2xl font-bold mb-3" style={{ color: t.primary }}>
              {status?.recipientName}
            </p>
            <p className="text-xs text-gray-500 italic">Bí mật cho đến đúng 00:00 ngày sinh nhật.</p>
            <div className="mt-5 pt-3 border-t border-black/10 text-xs text-gray-500">
              Đã có <span className="font-bold text-gray-900">{(status?.wishCount ?? 0) + 1}</span> lời chúc
            </div>
          </div>
        </NotebookCard>
      </div>
    </main>
  );

  return (
    <main className="min-h-[calc(100vh-4rem)] relative flex items-center justify-center p-4 py-8" style={bg}>
      <StarField color={t.primary} />
      <div className="relative z-10 w-full max-w-xl fade-in-up space-y-5">

        {/* Header */}
        <div className="text-center">
          <h1 className="font-script text-4xl sm:text-5xl text-white mb-1">Viết lời chúc sinh nhật</h1>
          <p className="text-white/70 text-sm">
            Gửi tới <span className="font-bold text-base" style={{ color: t.primary }}>{status?.recipientName}</span>
          </p>
          {(status?.wishCount ?? 0) > 0 && (
            <p className="text-white/40 text-xs mt-1 font-note">📌 Đã có {status?.wishCount} người gửi lời chúc</p>
          )}
        </div>

        {/* Description / Image note */}
        {(status?.imageUrl || status?.description) && (
          <NotebookCard bg="#fffdf0" lineColor="#f0e8c8" marginColor="#fcc419" tapeColor="#fce38a">
            {status.imageUrl && (
              <div className="mb-3 -mr-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={status.imageUrl} alt="" className="w-full max-h-60 object-cover rounded shadow-sm" />
              </div>
            )}
            {status.description && (
              <p className="font-note text-lg leading-[28px] text-gray-800">"{status.description}"</p>
            )}
          </NotebookCard>
        )}

        {/* Wish Form */}
        <NotebookCard bg="#fffef8" lineColor="#ece8d4" marginColor="#74c0fc" tapeColor="#ffc8dd">
          <form onSubmit={handleSubmit} noValidate className="space-y-4">

            {/* Tên */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-note text-lg font-bold text-gray-800">Tên của bạn</label>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs text-gray-500 hover:text-gray-800 select-none">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => {
                      setIsAnonymous(e.target.checked);
                      if (e.target.checked) { setAuthorName(""); setFieldErrors({ ...fieldErrors, authorName: undefined }); }
                    }}
                    className="w-3.5 h-3.5 accent-pink-500 cursor-pointer"
                  />
                  Gửi ẩn danh
                </label>
              </div>
              {isAnonymous ? (
                <p className="font-note text-base italic text-gray-400 px-3 py-2 rounded border border-dashed border-gray-300 bg-white/60">
                  Tên hiển thị: <strong className="text-gray-600">Người gửi bí mật</strong>
                </p>
              ) : (
                <input
                  type="text"
                  className={`w-full bg-white border rounded px-3 py-2 font-note text-base text-gray-900 outline-none transition focus:ring-2 focus:ring-pink-300 ${
                    fieldErrors.authorName ? "border-red-400 bg-red-50" : "border-gray-300 focus:border-pink-400"
                  }`}
                  style={{ lineHeight: "28px" }}
                  placeholder="Nhập tên hoặc biệt danh..."
                  value={authorName}
                  onChange={(e) => { setAuthorName(e.target.value); setFieldErrors({ ...fieldErrors, authorName: undefined }); }}
                  maxLength={60}
                />
              )}
              {fieldErrors.authorName && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">⚠ {fieldErrors.authorName}</p>
              )}
            </div>

            {/* Nội dung */}
            <div>
              <label className="font-note text-lg font-bold text-gray-800 block mb-1.5">Nội dung lời chúc</label>
              <textarea
                rows={5}
                className={`w-full bg-white border rounded px-3 py-2 font-note text-base text-gray-900 resize-none outline-none transition focus:ring-2 focus:ring-pink-300 ${
                  fieldErrors.message ? "border-red-400 bg-red-50" : "border-gray-300 focus:border-pink-400"
                }`}
                style={{ lineHeight: "28px" }}
                placeholder="Viết những lời chúc chân thành, ấm áp nhất..."
                value={message}
                onChange={(e) => { setMessage(e.target.value); setFieldErrors({ ...fieldErrors, message: undefined }); }}
                maxLength={500}
              />
              {fieldErrors.message
                ? <p className="text-xs text-red-500 mt-1 flex items-center gap-1">⚠ {fieldErrors.message}</p>
                : <p className="text-xs text-gray-400 text-right mt-0.5 font-mono">{message.length}/500</p>
              }
            </div>

            {submitError && (
              <div className="bg-red-100 border border-red-300 rounded p-3 text-red-700 text-sm">{submitError}</div>
            )}

            <button
              type="submit"
              className="btn-primary w-full py-3 text-sm font-bold rounded-xl"
              style={{ background: `linear-gradient(135deg, ${t.primary}, ${t.secondary})` }}
              disabled={submitting}
            >
              {submitting
                ? <><span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />Đang gửi...</>
                : isAnonymous ? "Gửi lời chúc ẩn danh 📌" : "Gửi lời chúc 📌"
              }
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-3 italic font-note">
            Lời chúc được giữ bí mật cho đến khi mở thiệp
          </p>
        </NotebookCard>
      </div>
    </main>
  );
}
