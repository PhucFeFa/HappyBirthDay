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
import { THEMES, slugify } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { copyTextToClipboard, shareLinkOrCopy } from "@/lib/clipboard";
import {
  Copy,
  Check,
  Sparkles,
  Share2,
  MessageSquare,
  AlertTriangle,
  Trash2,
  Upload,
  Link2,
  Plus,
  X,
  ExternalLink,
  Layers,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface CreatedCard {
  shareLink: string;
  creatorLink: string;
  recipientName: string;
  shareTitle?: string;
}

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    // Chỉ copy thuần chuỗi text/URL
    const success = await copyTextToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      type="button"
      className="copy-btn flex items-center gap-1.5"
      onClick={handleCopy}
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>Đã chép link</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          <span>{label || "Sao chép link"}</span>
        </>
      )}
    </button>
  );
}

// Nén ảnh client-side sang Base64 JPEG nhẹ nhàng (30-50KB/ảnh) để luôn nằm an toàn trong giới hạn 1MB của Firestore
function compressImageFile(file: File, maxDimension = 540, quality = 0.65): Promise<string> {
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
  const [customSlug, setCustomSlug] = useState("");
  const [shareTitle, setShareTitle] = useState("");
  const [shareDescription, setShareDescription] = useState("");
  const [showShareSettings, setShowShareSettings] = useState(false);
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
    customSlug?: string;
  }>({});
  const [created, setCreated] = useState<CreatedCard | null>(null);

  const t = THEMES[theme];

  // Ngày tối thiểu là ngày mai
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateTime = `${tomorrow.toISOString().split("T")[0]}T00:00`;

  // Xử lý tải ảnh từ máy tính / điện thoại
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 6 - images.length;
    if (remainingSlots <= 0) {
      alert("Bạn đã chọn tối đa 6 tấm ảnh kỷ niệm!");
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    setCompressing(true);

    try {
      const compressedList: string[] = [];
      for (const file of filesToProcess) {
        if (!file.type.startsWith("image/")) continue;
        const compressedBase64 = await compressImageFile(file);
        compressedList.push(compressedBase64);
      }
      setImages((prev) => [...prev, ...compressedList]);
    } catch (err) {
      console.error(err);
      setError("Có lỗi khi nén ảnh, vui lòng thử lại ảnh khác.");
    } finally {
      setCompressing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Thêm ảnh từ URL
  const handleAddUrlImage = () => {
    if (!urlInput.trim()) return;
    if (images.length >= 6) {
      alert("Bạn đã chọn tối đa 6 tấm ảnh!");
      return;
    }
    setImages((prev) => [...prev, urlInput.trim()]);
    setUrlInput("");
  };

  // Xóa từng ảnh
  const handleRemoveImage = (idxToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== idxToRemove));
  };

  // Xóa toàn bộ ảnh
  const handleClearAllImages = () => {
    setImages([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validate = () => {
    const errors: typeof fieldErrors = {};
    if (!recipientName.trim()) {
      errors.recipientName = "Vui lòng nhập tên người nhận";
    }
    if (!revealAt) {
      errors.revealAt = "Vui lòng chọn ngày mở thiệp";
    } else {
      const selected = new Date(revealAt);
      if (isNaN(selected.getTime())) {
        errors.revealAt = "Ngày giờ không hợp lệ";
      } else if (selected.getTime() <= Date.now()) {
        errors.revealAt = "Ngày sinh nhật phải ở tương lai";
      }
    }

    if (customSlug.trim()) {
      const slugFormatted = slugify(customSlug);
      if (slugFormatted.length < 3) {
        errors.customSlug = "Link tùy chỉnh phải có ít nhất 3 ký tự";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientName: recipientName.trim(),
          revealAt: new Date(revealAt).toISOString(),
          theme,
          celebrationEffect,
          description: description.trim(),
          imageUrls: images,
          imageUrl: images.length > 0 ? images[0] : "",
          customSlug: customSlug.trim() ? slugify(customSlug) : undefined,
          shareTitle: shareTitle.trim() || undefined,
          shareDescription: shareDescription.trim() || undefined,
          userId: user?.uid,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Không thể tạo thiệp. Vui lòng thử lại.");
        return;
      }

      setCreated({
        shareLink: data.shareLink,
        creatorLink: data.creatorLink,
        recipientName: recipientName.trim(),
        shareTitle: shareTitle.trim(),
      });
    } catch {
      setError("Lỗi kết nối máy chủ. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Màn hình hiển thị kết quả sau khi tạo thiệp
  if (created) {
    return (
      <main className="min-h-[calc(100vh-4rem)] relative flex items-center justify-center p-4 py-8">
        <StarField />
        <div className="glass-card max-w-xl w-full p-6 sm:p-8 text-center relative z-10 fade-in-up">
          {/* Cake animation */}
          <div className="my-4 flex justify-center scale-90 sm:scale-100">
            <BirthdayCake theme={theme} isRevealed={true} />
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-2">
            Khởi tạo thiệp thành công!
          </h2>
          <p className="text-white/70 text-xs sm:text-sm mb-6 max-w-md mx-auto">
            Thiệp của <span className="text-pink-400 font-semibold">{created.recipientName}</span> đã sẵn sàng.
            Hãy gửi link cho bạn bè để cùng viết những lời chúc bí mật!
          </p>

          <div className="space-y-4">
            {!user && (
              <div className="p-3 bg-pink-500/10 border border-pink-500/20 rounded-xl text-xs text-pink-300">
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
                  Link gửi bạn bè viết thiệp
                </span>
                <CopyButton text={created.shareLink} label="Sao chép link" />
              </div>
              <div className="link-box text-xs break-all mb-2 font-mono text-pink-300 font-medium">
                {created.shareLink}
              </div>

              {/* Nút thao tác copy và gửi */}
              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                <button
                  type="button"
                  onClick={async () => {
                    const ok = await copyTextToClipboard(created.shareLink);
                    if (ok) {
                      alert(`✓ ĐÃ SAO CHÉP ĐƯỜNG LINK THIỆP!\n\n${created.shareLink}\n\n👉 Bạn hãy dán (Paste) vào Messenger, Zalo hoặc Instagram để gửi nhé!`);
                    } else {
                      alert("Vui lòng sao chép thủ công đường link bên trên.");
                    }
                  }}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-pink-500/25 hover:bg-pink-500/35 border border-pink-500/50 text-pink-200 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Sao chép đường link</span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    await shareLinkOrCopy({
                      title: `Thiệp sinh nhật ${created.recipientName}`,
                      text: "",
                      url: created.shareLink,
                    });
                  }}
                  className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer shrink-0"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Gửi qua ứng dụng</span>
                </button>
              </div>
            </div>

            {/* Creator link */}
            <div className="mb-6 text-left">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">
                  Link mở thiệp (Dành riêng cho bạn / người nhận)
                </span>
                <CopyButton text={created.creatorLink} label="Sao chép link mở" />
              </div>
              <div className="link-box text-xs break-all font-mono text-white/70">{created.creatorLink}</div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={created.creatorLink}
                className="btn-primary flex-1 py-3 text-sm font-semibold rounded-xl text-center flex items-center justify-center gap-2"
                style={{
                  background: `linear-gradient(135deg, ${t.primary}, ${t.secondary})`,
                }}
              >
                <ExternalLink className="w-4 h-4" />
                <span>Mở trang đếm ngược</span>
              </Link>
              <button
                type="button"
                className="btn-secondary py-3 px-5 text-sm font-medium rounded-xl flex items-center justify-center gap-2"
                onClick={() => {
                  setCreated(null);
                  setRecipientName("");
                  setRevealAt("");
                  setDescription("");
                  handleClearAllImages();
                }}
              >
                <Plus className="w-4 h-4" />
                <span>Tạo thêm thiệp</span>
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
          <h1 className="font-script text-4xl sm:text-6xl gradient-text mb-1.5 inline-block">
            HappyBirthday
          </h1>
          <p className="text-white/60 text-xs sm:text-base px-2">
            Tạo thiệp sinh nhật bí mật — mở đúng 00:00 ngày sinh nhật
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Form */}
          <div className="glass-card p-5 sm:p-8 lg:col-span-7">
            <h2 className="font-display text-lg sm:text-2xl font-bold text-white mb-5 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-pink-400" />
              <span>Tạo thiệp mới</span>
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
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{fieldErrors.recipientName}</span>
                  </p>
                )}
              </div>

              {/* Tùy chỉnh đường dẫn liên kết */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="form-label mb-0 text-xs sm:text-sm">
                    Tùy chỉnh link thiệp <span className="text-white/40 font-normal">(Tùy chọn)</span>
                  </label>
                  {recipientName.trim() && !customSlug && (
                    <button
                      type="button"
                      onClick={() => setCustomSlug(slugify(recipientName))}
                      className="text-[11px] text-pink-400 hover:text-pink-300 font-medium cursor-pointer flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Gợi ý theo tên</span>
                    </button>
                  )}
                </div>
                <div className="flex items-center rounded-xl bg-white/5 border border-white/10 overflow-hidden focus-within:border-white/40 transition">
                  <span className="text-white/40 text-[11px] sm:text-xs pl-3 pr-1 select-none whitespace-nowrap font-mono">
                    /thiep/
                  </span>
                  <input
                    type="text"
                    className="w-full bg-transparent text-xs sm:text-sm py-2.5 sm:py-3 pr-3 text-white placeholder-white/30 focus:outline-none font-mono tracking-wide"
                    placeholder="vi-du-sinh-nhat-phuong-anh"
                    value={customSlug}
                    onChange={(e) => setCustomSlug(slugify(e.target.value))}
                    maxLength={45}
                  />
                  {customSlug && (
                    <button
                      type="button"
                      onClick={() => setCustomSlug("")}
                      className="text-white/40 hover:text-white text-xs px-2.5 py-1 cursor-pointer"
                      title="Xóa link tùy chỉnh"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <p className="text-[10px] sm:text-[11px] text-white/40 mt-1">
                  Đặt link đẹp dễ nhớ (ví dụ: <span className="text-white/60 font-mono">sinhnhat-linh-2026</span>). Để trống sẽ tự tạo ngẫu nhiên.
                </p>
              </div>

              {/* Tùy chỉnh hiển thị khi gửi link qua Messenger/Zalo */}
              <div className="border border-white/10 rounded-xl bg-white/[0.03] overflow-hidden transition">
                <button
                  type="button"
                  onClick={() => setShowShareSettings(!showShareSettings)}
                  className="w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-white/5 transition cursor-pointer"
                >
                  <span className="text-xs font-semibold text-white/80 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-pink-400" />
                    <span>Tùy chỉnh tin nhắn khi gửi link (Messenger / Zalo)</span>
                  </span>
                  <span className="text-xs text-white/40 flex items-center gap-1">
                    {showShareSettings ? (
                      <>
                        <span>Đóng</span>
                        <ChevronUp className="w-3.5 h-3.5" />
                      </>
                    ) : (
                      <>
                        <span>Mở rộng</span>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </>
                    )}
                  </span>
                </button>

                {showShareSettings && (
                  <div className="p-3.5 pt-1 space-y-3 border-t border-white/5">
                    <div>
                      <label className="text-[11px] text-white/70 block mb-1">
                        Tiêu đề hiển thị (Share Title)
                      </label>
                      <input
                        type="text"
                        placeholder={`Mặc định: Sinh nhật của ${recipientName.trim() || "Người nhận"}`}
                        value={shareTitle}
                        onChange={(e) => setShareTitle(e.target.value)}
                        className="form-input text-xs py-2"
                        maxLength={70}
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-white/70 block mb-1">
                        Lời mô tả hiển thị (Share Description)
                      </label>
                      <input
                        type="text"
                        placeholder="Mặc định: Nếu muốn gửi lời chúc tới sinh nhật tuiii..."
                        value={shareDescription}
                        onChange={(e) => setShareDescription(e.target.value)}
                        className="form-input text-xs py-2"
                        maxLength={120}
                      />
                    </div>

                    {/* Live Preview tin nhắn Messenger */}
                    <div className="p-2.5 rounded-lg bg-black/40 border border-white/10 mt-2">
                      <span className="text-[10px] text-white/40 block mb-1.5 font-medium">
                        Xem trước khung tin nhắn khi gửi:
                      </span>
                      <div className="rounded-md bg-white/10 p-2.5 border border-white/15">
                        <span className="text-xs font-bold text-white block line-clamp-1">
                          {shareTitle.trim() || `Sinh nhật của ${recipientName.trim() || "Người nhận"}`}
                        </span>
                        <span className="text-[11px] text-white/70 block line-clamp-2 mt-0.5">
                          {shareDescription.trim() || "Nếu muốn gửi lời chúc tới sinh nhật tuiii..."}
                        </span>
                        <span className="text-[9.5px] text-pink-300/80 font-mono tracking-wider block mt-1.5 truncate">
                          {typeof window !== "undefined" ? window.location.host : "hpbd-mail.vercel.app"}
                          <span className="text-white/80 font-semibold">
                            {customSlug.trim() ? `/thiep/${customSlug.trim()}` : "/thiep/ten-tuy-chinh"}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
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
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{fieldErrors.revealAt}</span>
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
                  <label className="form-label mb-0 text-xs sm:text-sm flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-pink-400" />
                    <span>Hình ảnh kỷ niệm Polaroid ({images.length}/6)</span>
                    <span className="text-white/40 font-normal">(Tùy chọn)</span>
                  </label>
                  {/* Mode switcher tabs */}
                  <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setImageMode("upload")}
                      className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 ${
                        imageMode === "upload"
                          ? "bg-white/20 text-white font-medium shadow-sm"
                          : "text-white/50 hover:text-white"
                      }`}
                    >
                      <Upload className="w-3 h-3" />
                      <span>Từ máy</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageMode("url")}
                      className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 ${
                        imageMode === "url"
                          ? "bg-white/20 text-white font-medium shadow-sm"
                          : "text-white/50 hover:text-white"
                      }`}
                    >
                      <Link2 className="w-3 h-3" />
                      <span>Dán link</span>
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
                          <Upload className="w-4 h-4" />
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
                        className="btn-secondary text-xs px-3.5 py-2 shrink-0 cursor-pointer disabled:opacity-40 flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Thêm</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Danh sách ảnh đã chọn */}
                {images.length > 0 && (
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-white/70 font-medium flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-pink-400" />
                        <span>Đã thêm {images.length}/6 tấm ảnh</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleClearAllImages}
                        className="text-[11px] text-red-400 hover:text-red-300 font-medium cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Xóa tất cả</span>
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
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md hover:scale-110 transition cursor-pointer"
                          >
                            <X className="w-3 h-3" />
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
                <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 text-red-300 text-xs sm:text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className="btn-primary btn-shimmer w-full mt-2 py-3 text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-center gap-2"
                style={{
                  background: `linear-gradient(135deg, ${t.primary}, ${t.secondary})`,
                }}
                disabled={loading || compressing}
              >
                {loading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    <span>Đang khởi tạo...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Tạo thiệp ngay</span>
                  </>
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
