"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn, Sparkles, X } from "lucide-react";

interface PolaroidStackProps {
  images: string[];
  recipientName?: string;
}

const WASHI_TAPES = [
  "#ffb3c6", // Hồng pastel
  "#fce38a", // Vàng pastel
  "#bde0fe", // Xanh pastel
  "#d8b4fe", // Tím pastel
  "#b7e4c7", // Xanh ngọc
  "#ffd166", // Cam vàng
];

export default function PolaroidStack({
  images,
  recipientName = "Kỷ niệm",
}: PolaroidStackProps) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const total = images?.length ?? 0;
  const currentSelected = hoveredIdx !== null ? hoveredIdx : (activeIdx ?? (total > 0 ? total - 1 : 0));

  // Tính toán góc xòe và khoảng cách bậc thang ngang
  const cardsLayout = useMemo(() => {
    return images.map((_, idx) => {
      if (total === 1) {
        return { rotate: 0, x: 0, y: 0, zIndex: 10 };
      }
      const centerFactor = (idx - (total - 1) / 2);
      const rotate = centerFactor * (24 / Math.max(1, total - 1));
      const x = centerFactor * 42;
      const y = Math.abs(centerFactor) * 8;

      return {
        rotate,
        x,
        y,
        zIndex: idx + 1,
      };
    });
  }, [images, total]);

  if (!images || images.length === 0) return null;

  const isSingle = total === 1;

  return (
    <div className="relative my-6 sm:my-8 flex flex-col items-center select-none w-full max-w-2xl px-2">
      {/* ─── BỘ BÀI ẢNH POLAROID XÒE NAN QUẠT / BẬC THANG ─── */}
      <div
        className="relative flex items-center justify-center overflow-visible"
        style={{
          width: isSingle ? "240px" : "330px",
          height: isSingle ? "280px" : "250px",
        }}
      >
        {images.map((img, idx) => {
          const tapeColor = WASHI_TAPES[idx % WASHI_TAPES.length];
          const isCurrent = currentSelected === idx;
          const layout = cardsLayout[idx] || { rotate: 0, x: 0, y: 0, zIndex: 10 };

          return (
            <motion.div
              key={`polaroid-${idx}`}
              className="absolute cursor-pointer origin-bottom"
              style={{
                zIndex: isCurrent ? 50 : layout.zIndex,
              }}
              initial={false}
              animate={{
                rotate: isCurrent ? 0 : layout.rotate,
                x: isCurrent ? 0 : layout.x,
                y: isCurrent ? -24 : layout.y,
                scale: isCurrent ? (isSingle ? 1.05 : 1.1) : 1,
              }}
              whileHover={{
                y: isCurrent ? -28 : layout.y - 14,
                scale: isCurrent ? (isSingle ? 1.08 : 1.14) : 1.05,
                zIndex: 60,
                transition: { duration: 0.2 },
              }}
              transition={{
                type: "spring",
                stiffness: 280,
                damping: 22,
              }}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              onClick={() => {
                if (isCurrent && total > 1) {
                  setZoomedImage(img);
                } else {
                  setActiveIdx(idx);
                }
              }}
            >
              <div
                className={`bg-[#fffefc] p-2 sm:p-2.5 pb-6 sm:pb-7 rounded-[4px] border transition-all duration-300 relative ${
                  isCurrent
                    ? "ring-2 ring-pink-400/80 shadow-[0_20px_45px_rgba(0,0,0,0.55),0_4px_12px_rgba(0,0,0,0.25)] border-pink-200"
                    : "shadow-[0_8px_20px_rgba(0,0,0,0.35),0_2px_6px_rgba(0,0,0,0.15)] border-black/10 opacity-90 hover:opacity-100"
                }`}
                style={{
                  width: isSingle ? "220px" : "175px",
                }}
              >
                {/* Miếng băng dính Washi Tape ở trên đầu */}
                <div
                  className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-12 sm:w-14 h-3.5 sm:h-4 rounded-xs opacity-85 shadow-xs"
                  style={{
                    background: tapeColor,
                    transform: `rotate(${(idx % 2 === 0 ? -2 : 2)}deg)`,
                  }}
                />

                {/* Khung hình ảnh rửa */}
                <div className="relative aspect-square w-full overflow-hidden bg-gray-100 rounded-xs border border-black/5 shadow-inner">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt={`${recipientName} - Ảnh ${idx + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />

                  {/* Icon kính lúp phóng to khi đang active */}
                  {isCurrent && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setZoomedImage(img);
                      }}
                      className="absolute bottom-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center shadow-md backdrop-blur-xs transition"
                      title="Phóng to ảnh"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>

                {/* Dòng ghi chú viết tay dưới viền ảnh Polaroid */}
                <div className="mt-1.5 text-center">
                  <span className="font-note text-[11px] sm:text-xs text-gray-700 font-bold block truncate px-0.5">
                    {recipientName} {total > 1 ? `#${idx + 1}` : ""}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ─── THANH ĐIỀU HƯỚNG DỄ CHẠM TRÊN ĐIỆN THOẠI & MÁY TÍNH ─── */}
      {images.length > 1 && (
        <div className="mt-3 flex flex-col items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white/10 p-1 rounded-full backdrop-blur-sm border border-white/15">
            {images.map((_, idx) => (
              <button
                key={`deck-btn-${idx}`}
                type="button"
                onClick={() => setActiveIdx(idx)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                  currentSelected === idx
                    ? "bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-md scale-105"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                Ảnh {idx + 1}
              </button>
            ))}
          </div>

          <p className="text-[11px] sm:text-xs text-white/50 font-note flex items-center gap-1 text-center">
            <Sparkles className="w-3 h-3 text-pink-400 inline" />
            <span>Chạm vào từng ảnh hoặc nút số để lật xem • Bấm phóng to</span>
          </p>
        </div>
      )}

      {/* ─── LIGHTBOX PHÓNG TO TOÀN MÀN HÌNH ─── */}
      <AnimatePresence>
        {zoomedImage && (
          <motion.div
            className="fixed inset-0 z-[120] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomedImage(null)}
          >
            <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" />
            <motion.div
              className="relative z-10 max-w-lg w-full bg-white p-3 sm:p-4 pb-7 sm:pb-9 rounded-lg shadow-2xl border border-white/20"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setZoomedImage(null)}
                className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-black/80 text-white flex items-center justify-center shadow-lg hover:bg-black transition cursor-pointer"
                aria-label="Đóng phóng to"
              >
                <X className="w-4 h-4" />
              </button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={zoomedImage}
                alt={recipientName}
                className="w-full h-auto max-h-[75vh] object-contain rounded-xs"
              />
              <div className="mt-3 text-center">
                <span className="font-note text-base sm:text-lg text-gray-800 font-bold">
                  {recipientName}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
