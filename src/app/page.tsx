"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import StarField from "@/components/StarField";
import ThemePicker from "@/components/ThemePicker";
import EffectPicker from "@/components/EffectPicker";
import BirthdayCake from "@/components/BirthdayCake";
import AmbientCakeDecorations from "@/components/AmbientCakeDecorations";
import CustomDatePicker from "@/components/CustomDatePicker";
import PolaroidStack from "@/components/PolaroidStack";
import type { ThemeKey, CelebrationEffectKey } from "@/lib/utils";
import { THEMES } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

interface CreatedCard {
  shareLink: string;
  creatorLink: string;
  recipientName: string;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button type="button" className="copy-btn" onClick={handleCopy}>
      {copied ? "Đã sao chép" : "Sao chép"}
    </button>
  );
}

// Nén ảnh client-side sang Base64 JPEG để lưu trữ nhẹ nhàng và hiển thị tức thì
function compressImageFile(file: File, maxDimension = 900, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error("Không thể đọc tệp ảnh"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Lỗi khi đọc tệp từ máy"));
    reader.readAsDataURL(file);
  });
}

export default function HomePage() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [theme, setTheme] = useState<ThemeKey>("pink");
  const [celebrationEffect, setCelebrationEffect] = useState<CelebrationEffectKey>("flowers");
  const [recipientName, setRecipientName] = useState("");
  const [revealAt, setRevealAt] = useState("");
  const [description, setDescription] = useState("");

  // Multi-image handling (tối đa 6 ảnh kỷ niệm)
  const [imageMode, setImageMode] = useState<"upload" | "url">("upload");
  const [urlInput, setUrlInput] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [compressing, setCompressing] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    recipientName?: string;
    revealAt?: string;
  }>({});
  const [created, setCreated] = useState<CreatedCard | null>(null);

  const t = THEMES[theme];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const newFieldErrors: typeof fieldErrors = {};
    if (!recipientName.trim()) {
      newFieldErrors.recipientName = "Vui lòng nhập tên người nhận";
    }
    if (!revealAt) {
      newFieldErrors.revealAt = "Vui lòng chọn ngày sinh nhật để mở thiệp";
    }

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      return;
    }

    setFieldErrors({});
    setLoading(true);

    try {
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientName: recipientName.trim(),
          revealAt,
          theme,
          description: description.trim() || undefined,
          imageUrl: images[0] || undefined,
          imageUrls: images.length > 0 ? images : undefined,
          userId: user?.uid || null,
          creatorEmail: user?.email || null,
          celebrationEffect,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Có lỗi xảy ra khi tạo thiệp");
        return;
      }

      setCreated({
        shareLink: data.shareLink,
        creatorLink: data.creatorLink,
        recipientName: recipientName.trim(),
      });
    } catch {
      setError("Không thể kết nối đến máy chủ");
    } finally {
      setLoading(false);
    }
  };

  // Min datetime = today
  const minDateTime = new Date().toISOString().slice(0, 16);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 6) {
      setError("Bạn có thể thêm tối đa 6 tấm ảnh kỷ niệm");
      return;
    }

    try {
      setCompressing(true);
      setError("");
      const newImages: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith("image/")) {
          const compressed = await compressImageFile(file);
          newImages.push(compressed);
        }
      }

      setImages((prev) => [...prev, ...newImages]);
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError(errorObj.message || "Lỗi khi xử lý hình ảnh");
    } finally {
      setCompressing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAddUrlImage = () => {
    if (!urlInput.trim()) return;
    if (images.length >= 6) {
      setError("Bạn có thể thêm tối đa 6 tấm ảnh kỷ niệm");
      return;
    }
    setImages((prev) => [...prev, urlInput.trim()]);
    setUrlInput("");
  };

  const handleRemoveImage = (idxToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== idxToRemove));
  };

  const handleClearAllImages = () => {
    setImages([]);
    setUrlInput("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (created) {
    return (
      <main
        className="min-h-[calc(100vh-4rem)] relative flex items-center justify-center p-3 sm:p-4"
        style={{
          background: `radial-gradient(ellipse at top, ${t.primary}20, transparent 60%), 
                       radial-gradient(ellipse at bottom, ${t.secondary}15, transparent 60%),
                       #0a0a0f`,
        }}
      >
        <StarField />
        <div className="relative z-10 w-full max-w-lg fade-in-up">
          <div className="glass-card p-6 sm:p-8 text-center">
            <div
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-xl sm:text-2xl font-serif text-white mx-auto mb-4"
              style={{ background: `linear-gradient(135deg, ${t.primary}, ${t.secondary})` }}
            >
              ✦
            </div>

            <h2 className="font-display text-xl sm:text-2xl font-bold text-white mb-2">
              Khởi tạo thiệp thành công
            </h2>
            <p className="text-white/60 text-xs sm:text-sm mb-6">
              Dành cho <span className="text-white font-semibold">{created.recipientName}</span>
            </p>

            {/* Thông báo lưu tài khoản */}
            {user ? (
              <div className="mb-6 p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white/70 text-left flex items-center justify-between gap-3">
                <span>Thiệp đã được liên kết với tài khoản của bạn.</span>
                <Link
                  href="/my-cards"
                  className="font-semibold text-pink-400 hover:text-pink-300 whitespace-nowrap"
                >
                  Xem thiệp →
                </Link>
              </div>
            ) : (
              <div className="mb-6 p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white/60 text-left">
                <span>Mẹo: Bạn có thể </span>
                <Link href="/login" className="text-pink-400 hover:text-pink-300 font-semibold underline">
                  Đăng nhập
                </Link>
                <span> để tự động quản lý tất cả thiệp đã tạo.</span>
              </div>
            )}

            {/* Share link */}
            <div className="mb-4 text-left">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">
                  Link viết lời chúc (Gửi cho bạn bè)
                </span>
                <CopyButton text={created.shareLink} />
              </div>
              <div className="link-box text-xs break-all">{created.shareLink}</div>
            </div>

            {/* Creator link */}
            <div className="mb-6 text-left">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">
                  Link xem thiệp (Dành cho bạn)
                </span>
                <CopyButton text={created.creatorLink} />
              </div>
              <div className="link-box text-xs break-all">{created.creatorLink}</div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={created.creatorLink}
                className="btn-primary flex-1 py-3 text-sm font-semibold rounded-xl text-center"
                style={{
                  background: `linear-gradient(135deg, ${t.primary}, ${t.secondary})`,
                }}
              >
                Mở trang đếm ngược
              </Link>
              <button
                type="button"
                className="btn-secondary py-3 px-5 text-sm font-medium rounded-xl"
                onClick={() => {
                  setCreated(null);
                  setRecipientName("");
                  setRevealAt("");
                  setDescription("");
                  handleClearAllImages();
                }}
              >
                Tạo thêm thiệp
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-[calc(100vh-4rem)] relative flex items-center justify-center p-3 sm:p-6 py-6 sm:py-10"
      style={{
        background: `radial-gradient(ellipse at top, ${t.primary}18, transparent 60%), 
                     radial-gradient(ellipse at bottom, ${t.secondary}12, transparent 60%),
                     #0a0a0f`,
        transition: "background 0.5s ease",
      }}
    >
      <StarField />

      <div className="relative z-10 w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="font-script text-4xl sm:text-6xl mb-1.5 gradient-text">
            HappyBirthday
          </h1>
          <p className="text-white/60 text-xs sm:text-base px-2">
            Tạo thiệp sinh nhật bí mật — mở đúng 00:00 ngày sinh nhật
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Form */}
          <div className="glass-card p-5 sm:p-8 lg:col-span-7">
            <h2 className="font-display text-lg sm:text-2xl font-bold text-white mb-5">
              Tạo thiệp mới
            </h2>

            <form onSubmit={handleSubmit} noValidate className="space-y-4 sm:space-y-5">
              {/* Recipient name */}
              <div>
                <label className="form-label text-xs sm:text-sm">Tên người nhận</label>
                <input
                  type="text"
                  className={`form-input text-xs sm:text-sm py-2.5 sm:py-3 ${
                    fieldErrors.recipientName ? "border-red-500/60 bg-red-500/5" : ""
                  }`}
                  placeholder="Ví dụ: Nguyễn Văn An"
                  value={recipientName}
                  onChange={(e) => {
                    setRecipientName(e.target.value);
                    if (fieldErrors.recipientName)
                      setFieldErrors({ ...fieldErrors, recipientName: undefined });
                  }}
                  maxLength={60}
                />
                {fieldErrors.recipientName && (
                  <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                    <span>⚠</span> {fieldErrors.recipientName}
                  </p>
                )}
              </div>

              {/* Reveal date (Custom DatePicker auto 00:00) */}
              <div>
                <label className="form-label text-xs sm:text-sm">
                  Ngày sinh nhật
                </label>
                <CustomDatePicker
                  value={revealAt}
                  onChange={(val) => {
                    setRevealAt(val);
                    if (fieldErrors.revealAt)
                      setFieldErrors({ ...fieldErrors, revealAt: undefined });
                  }}
                  theme={theme}
                  minDate={minDateTime}
                />
                {fieldErrors.revealAt && (
                  <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                    <span>⚠</span> {fieldErrors.revealAt}
                  </p>
                )}
              </div>

              {/* Description / Initial message */}
              <div>
                <label className="form-label text-xs sm:text-sm">
                  Lời tựa / Lời nhắn mở đầu <span className="text-white/40 font-normal">(Tùy chọn)</span>
                </label>
                <textarea
                  className="form-input resize-none font-note text-sm sm:text-base leading-relaxed"
                  rows={3}
                  placeholder="Viết vài lời nhắn nhủ yêu thương gửi đến người nhận khi mở thư..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={400}
                />
              </div>

              {/* Image attachment section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="form-label mb-0 text-xs sm:text-sm">
                    Hình ảnh kỷ niệm Polaroid ({images.length}/6){" "}
                    <span className="text-white/40 font-normal">(Tùy chọn)</span>
                  </label>
                  {/* Mode switcher tabs */}
                  <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setImageMode("upload")}
                      className={`px-2.5 py-1 rounded-md transition ${
                        imageMode === "upload"
                          ? "bg-white/20 text-white font-medium shadow-sm"
                          : "text-white/50 hover:text-white"
                      }`}
                    >
                      Từ máy
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageMode("url")}
                      className={`px-2.5 py-1 rounded-md transition ${
                        imageMode === "url"
                          ? "bg-white/20 text-white font-medium shadow-sm"
                          : "text-white/50 hover:text-white"
                      }`}
                    >
                      Dán link
                    </button>
                  </div>
                </div>

                {imageMode === "upload" ? (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      id="image-file-input"
                    />

                    {images.length < 6 && (
                      <label
                        htmlFor="image-file-input"
                        className="w-full flex flex-col items-center justify-center p-3.5 sm:p-5 border-2 border-dashed border-white/20 rounded-2xl hover:border-white/40 hover:bg-white/5 transition cursor-pointer group text-center mb-3"
                      >
                        <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white/60 group-hover:text-white group-hover:scale-110 transition mb-1.5">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <span className="text-xs font-semibold text-white/85 group-hover:text-white">
                          {compressing ? "Đang xử lý ảnh..." : "Bấm để chọn ảnh từ thiết bị (Có thể chọn nhiều ảnh)"}
                        </span>
                        <span className="text-[10px] text-white/40 mt-0.5">
                          Các ảnh sẽ xếp đè lên nhau như xấp ảnh rửa Polaroid
                        </span>
                      </label>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2 mb-3">
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="Dán đường dẫn ảnh (https://...)"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        className="form-input text-xs flex-1"
                      />
                      <button
                        type="button"
                        onClick={handleAddUrlImage}
                        disabled={!urlInput.trim() || images.length >= 6}
                        className="btn-secondary text-xs px-3.5 py-2 shrink-0 cursor-pointer disabled:opacity-40"
                      >
                        + Thêm
                      </button>
                    </div>
                  </div>
                )}

                {/* Danh sách ảnh đã chọn */}
                {images.length > 0 && (
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-white/70 font-medium">
                        Đã thêm {images.length}/6 tấm ảnh
                      </span>
                      <button
                        type="button"
                        onClick={handleClearAllImages}
                        className="text-[11px] text-red-400 hover:text-red-300 font-medium cursor-pointer"
                      >
                        Xóa tất cả
                      </button>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                      {images.map((img, idx) => (
                        <div
                          key={idx}
                          className="relative group bg-white p-1 pb-3 rounded-xs shadow-md border border-black/10"
                          style={{ transform: `rotate(${(idx % 2 === 0 ? -2 : 2) * 1.5}deg)` }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={img}
                            alt={`Ảnh ${idx + 1}`}
                            className="w-full h-14 sm:h-16 object-cover rounded-xs"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center shadow-md hover:scale-110 transition cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Celebration Effect Picker */}
              <div>
                <label className="form-label text-xs sm:text-sm">Hiệu ứng chúc mừng khi mở thiệp</label>
                <EffectPicker
                  value={celebrationEffect}
                  onChange={setCelebrationEffect}
                />
              </div>

              {/* Theme picker */}
              <div>
                <label className="form-label text-xs sm:text-sm">Tông màu giao diện</label>
                <ThemePicker value={theme} onChange={setTheme} />
                <p className="text-[11px] sm:text-xs text-white/40 mt-2">
                  Đang chọn:{" "}
                  <span style={{ color: t.primary }} className="font-medium">
                    {THEMES[theme].label}
                  </span>
                </p>
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 text-red-300 text-xs sm:text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="btn-primary btn-shimmer w-full mt-2 py-3 text-xs sm:text-sm font-semibold rounded-xl"
                style={{
                  background: `linear-gradient(135deg, ${t.primary}, ${t.secondary})`,
                }}
                disabled={loading || compressing}
              >
                {loading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Đang khởi tạo...
                  </>
                ) : (
                  "Tạo thiệp ngay"
                )}
              </button>
            </form>
          </div>

          {/* Preview Cake & Polaroid Stack */}
          <div className="flex flex-col items-center justify-center p-2 sm:p-4 lg:col-span-5 sticky top-20">
            <div className="scale-90 sm:scale-100 origin-center relative">
              <AmbientCakeDecorations effect={celebrationEffect} />
              <BirthdayCake theme={theme} isRevealed={true} />
            </div>
            <p className="text-[11px] sm:text-xs text-white/40 mt-3 text-center">
              Xem trước bánh kem theo tông màu đã chọn
            </p>

            {/* Xấp ảnh Polaroid xem trước */}
            {images.length > 0 && (
              <div className="w-full mt-6 pt-4 border-t border-white/10 flex flex-col items-center">
                <span className="text-xs text-white/60 font-medium mb-1">
                  Xem trước xấp ảnh Polaroid kỷ niệm:
                </span>
                <PolaroidStack images={images} recipientName={recipientName || "Người nhận"} />
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
