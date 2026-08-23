"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ThemePicker from "@/components/ThemePicker";
import EffectPicker from "@/components/EffectPicker";
import CustomDatePicker from "@/components/CustomDatePicker";
import type { ThemeKey, CelebrationEffectKey } from "@/lib/utils";
import { THEMES } from "@/lib/utils";
import dayjs from "dayjs";

interface EditCardModalProps {
  slug: string;
  creatorToken?: string | null;
  userId?: string | null;
  initialData: {
    recipientName: string;
    revealAt: number;
    theme: ThemeKey;
    celebrationEffect?: CelebrationEffectKey;
    description?: string | null;
    imageUrl?: string | null;
    imageUrls?: string[] | null;
    shareTitle?: string | null;
    shareDescription?: string | null;
  };
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Nén ảnh client-side sang Base64 JPEG nhẹ nhàng
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

export default function EditCardModal({
  slug,
  creatorToken,
  userId,
  initialData,
  isOpen,
  onClose,
  onSuccess,
}: EditCardModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [recipientName, setRecipientName] = useState(initialData.recipientName);
  const [revealAt, setRevealAt] = useState(() =>
    dayjs(initialData.revealAt).format("YYYY-MM-DDTHH:mm")
  );
  const [theme, setTheme] = useState<ThemeKey>(initialData.theme);
  const [celebrationEffect, setCelebrationEffect] = useState<CelebrationEffectKey>(
    initialData.celebrationEffect || "flowers"
  );
  const [description, setDescription] = useState(initialData.description || "");
  const [shareTitle, setShareTitle] = useState(initialData.shareTitle || "");
  const [shareDescription, setShareDescription] = useState(initialData.shareDescription || "");

  // Multi-image handling (tối đa 6 ảnh kỷ niệm)
  const [imageMode, setImageMode] = useState<"upload" | "url">("upload");
  const [urlInput, setUrlInput] = useState("");
  const [images, setImages] = useState<string[]>(() => {
    if (initialData.imageUrls && initialData.imageUrls.length > 0) {
      return initialData.imageUrls;
    }
    if (initialData.imageUrl) {
      return [initialData.imageUrl];
    }
    return [];
  });
  const [compressing, setCompressing] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const minDateTime = dayjs().add(2, "minute").format("YYYY-MM-DDTHH:mm");
  const t = THEMES[theme];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 6) {
      setError("Bạn chỉ có thể lưu tối đa 6 tấm ảnh kỷ niệm");
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName.trim()) {
      setError("Vui lòng nhập tên người nhận");
      return;
    }
    if (!revealAt) {
      setError("Vui lòng chọn ngày mở thiệp");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/cards/${slug}/edit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: creatorToken || undefined,
          userId: userId || undefined,
          recipientName: recipientName.trim(),
          revealAt,
          theme,
          celebrationEffect,
          description: description.trim() || undefined,
          imageUrl: images[0] || undefined,
          imageUrls: images.length > 0 ? images : undefined,
          shareTitle: shareTitle.trim() || undefined,
          shareDescription: shareDescription.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Không thể cập nhật thiệp");
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError(errorObj.message || "Lỗi khi cập nhật thiệp");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          className="relative z-10 w-full max-w-xl glass-card p-5 sm:p-7 border border-white/20 shadow-2xl rounded-2xl max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">✏️</span>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Chỉnh sửa thiệp sinh nhật
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center transition cursor-pointer"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-left">
            {/* Tên người nhận */}
            <div>
              <label className="form-label text-xs sm:text-sm">
                Tên người nhận <span className="text-pink-400">*</span>
              </label>
              <input
                type="text"
                className="form-input text-xs sm:text-sm"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                maxLength={60}
                required
              />
            </div>

            {/* Ngày mở thiệp */}
            <div>
              <label className="form-label text-xs sm:text-sm">
                Ngày sinh nhật mở thiệp <span className="text-pink-400">*</span>
              </label>
              <CustomDatePicker
                value={revealAt}
                onChange={setRevealAt}
                theme={theme}
                minDate={minDateTime}
              />
            </div>

            {/* Lời tựa thiệp */}
            <div>
              <label className="form-label text-xs sm:text-sm">
                Lời tựa / Tin nhắn gửi kèm <span className="text-white/40 font-normal">(Tùy chọn)</span>
              </label>
              <textarea
                className="form-textarea text-xs sm:text-sm"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={400}
                placeholder="Gửi lời chúc yêu thương đến người ấy..."
              />
            </div>

            {/* ─── ẢNH KỶ NIỆM RỬA POLAROID (TỐI ĐA 6 ẢNH) ─── */}
            <div className="pt-2 border-t border-white/10">
              <div className="flex items-center justify-between mb-2">
                <label className="form-label mb-0 text-xs sm:text-sm">
                  Ảnh kỷ niệm Polaroid <span className="text-white/40 font-normal">(Tối đa 6 ảnh)</span>
                </label>
                <div className="flex bg-white/10 rounded-lg p-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setImageMode("upload")}
                    className={`px-2.5 py-1 rounded-md transition cursor-pointer text-[11px] ${
                      imageMode === "upload" ? "bg-white/20 text-white font-medium shadow-xs" : "text-white/50 hover:text-white"
                    }`}
                  >
                    Tải từ máy
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageMode("url")}
                    className={`px-2.5 py-1 rounded-md transition cursor-pointer text-[11px] ${
                      imageMode === "url" ? "bg-white/20 text-white font-medium shadow-xs" : "text-white/50 hover:text-white"
                    }`}
                  >
                    Dán URL
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
                    onChange={handleImageUpload}
                    className="hidden"
                    id="edit-modal-image-upload"
                    disabled={compressing || images.length >= 6}
                  />
                  {images.length < 6 && (
                    <label
                      htmlFor="edit-modal-image-upload"
                      className={`border-2 border-dashed border-white/20 hover:border-pink-400/60 rounded-xl p-3.5 flex flex-col items-center justify-center cursor-pointer transition bg-white/[0.02] hover:bg-white/[0.05] group ${
                        compressing ? "opacity-50 pointer-events-none" : ""
                      }`}
                    >
                      <span className="text-xs font-semibold text-white/85 group-hover:text-white">
                        {compressing ? "Đang xử lý ảnh..." : "+ Bấm để chọn thêm ảnh từ thiết bị"}
                      </span>
                    </label>
                  )}
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Dán đường dẫn ảnh (https://...)"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="form-input text-xs flex-1 py-2"
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
              )}

              {/* Danh sách ảnh đã chọn */}
              {images.length > 0 && (
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-white/70 font-medium">
                      Đã lưu {images.length}/6 tấm ảnh kỷ niệm
                    </span>
                    <button
                      type="button"
                      onClick={handleClearAllImages}
                      className="text-[11px] text-red-400 hover:text-red-300 font-medium cursor-pointer"
                    >
                      Xóa tất cả
                    </button>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {images.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative group bg-white p-1 pb-2 rounded-xs shadow-md border border-black/10"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img}
                          alt={`Kỷ niệm ${idx + 1}`}
                          className="w-full aspect-square object-cover rounded-xs"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center shadow hover:bg-red-600 transition cursor-pointer"
                          title="Xóa tấm ảnh này"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Chọn tông màu */}
            <div className="pt-2 border-t border-white/10">
              <label className="form-label text-xs sm:text-sm">Tông màu chủ đạo</label>
              <ThemePicker value={theme} onChange={setTheme} />
            </div>

            {/* Hiệu ứng */}
            <div>
              <label className="form-label text-xs sm:text-sm">Hiệu ứng pháo hoa & hoa bay</label>
              <EffectPicker value={celebrationEffect} onChange={setCelebrationEffect} />
            </div>

            {/* Tùy chỉnh tiêu đề Messenger */}
            <div className="pt-2 border-t border-white/10 space-y-3">
              <span className="text-xs font-semibold text-white/80 block">
                💬 Tin nhắn hiển thị khi gửi link qua Messenger/Zalo
              </span>
              <div>
                <label className="text-[11px] text-white/60 block mb-1">Tiêu đề chia sẻ</label>
                <input
                  type="text"
                  className="form-input text-xs py-2"
                  value={shareTitle}
                  onChange={(e) => setShareTitle(e.target.value)}
                  placeholder={`Mặc định: 💌 Gửi lời chúc sinh nhật đến ${recipientName}! 🎂`}
                  maxLength={70}
                />
              </div>
              <div>
                <label className="text-[11px] text-white/60 block mb-1">Lời mô tả chia sẻ</label>
                <input
                  type="text"
                  className="form-input text-xs py-2"
                  value={shareDescription}
                  onChange={(e) => setShareDescription(e.target.value)}
                  placeholder="Mặc định: Cùng viết những lời chúc yêu thương bí mật..."
                  maxLength={120}
                />
              </div>

              {/* Live Preview tin nhắn */}
              <div className="p-2.5 rounded-lg bg-black/40 border border-white/10 mt-2">
                <span className="text-[10px] text-white/40 block mb-1 font-medium">
                  Xem trước khung tin nhắn khi gửi:
                </span>
                <div className="rounded-md bg-white/10 p-2.5 border border-white/15">
                  <span className="text-xs font-bold text-white block line-clamp-1">
                    {shareTitle.trim() || `💌 Gửi lời chúc sinh nhật đến ${recipientName.trim() || "Người nhận"}! 🎂`}
                  </span>
                  <span className="text-[11px] text-white/70 block line-clamp-2 mt-0.5">
                    {shareDescription.trim() || "Cùng gửi những phong bì lời chúc yêu thương bí mật trong ngày sinh nhật nhé! 🎉"}
                  </span>
                  <span className="text-[9px] text-pink-300/80 font-mono tracking-wider block mt-1.5 truncate">
                    {typeof window !== "undefined" ? window.location.host : "hpbd-mail.vercel.app"}
                    <span className="text-white/80 font-semibold">/thiep/{slug}</span>
                  </span>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-2.5 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-xs">
                ⚠ {error}
              </div>
            )}

            {/* Nút lưu */}
            <div className="pt-3 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1 py-2.5 text-xs sm:text-sm font-medium rounded-xl cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading || compressing}
                className="btn-primary flex-1 py-2.5 text-xs sm:text-sm font-semibold rounded-xl cursor-pointer disabled:opacity-50"
                style={{
                  background: `linear-gradient(135deg, ${t.primary}, ${t.secondary})`,
                }}
              >
                {loading ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
