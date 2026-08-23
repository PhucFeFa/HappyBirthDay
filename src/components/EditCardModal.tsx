"use client";

import { useState } from "react";
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
    shareTitle?: string | null;
    shareDescription?: string | null;
  };
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const minDateTime = dayjs().add(2, "minute").format("YYYY-MM-DDTHH:mm");
  const t = THEMES[theme];

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
          className="relative z-10 w-full max-w-lg glass-card p-5 sm:p-7 border border-white/20 shadow-2xl rounded-2xl max-h-[90vh] overflow-y-auto"
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

            {/* Chọn tông màu */}
            <div>
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
                disabled={loading}
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
