"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PolaroidStackProps {
  images: string[];
  recipientName?: string;
}

const ROTATIONS = [-5, 4, -2, 6, -7, 3, -4, 5];
const WASHI_TAPES = ["#fce38a", "#ffb3c6", "#bde0fe", "#d8b4fe", "#b7e4c7", "#ffd166"];

export default function PolaroidStack({ images, recipientName = "Kỷ niệm" }: PolaroidStackProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  if (!images || images.length === 0) return null;

  return (
    <div className="relative my-8 flex flex-col items-center select-none">
      {/* Container xếp chồng các ảnh */}
      <div className="relative w-72 sm:w-84 h-72 sm:h-84 flex items-center justify-center">
        {images.map((img, idx) => {
          const defaultRotate = ROTATIONS[idx % ROTATIONS.length];
          const tapeColor = WASHI_TAPES[idx % WASHI_TAPES.length];
          const isHovered = hoveredIdx === idx;
          const isSingle = images.length === 1;

          // Tính độ dịch chuyển nhẹ để tạo xấp ảnh xòe tự nhiên
          const offsetX = isSingle ? 0 : (idx - (images.length - 1) / 2) * 16;
          const offsetY = isSingle ? 0 : (idx % 2 === 0 ? -4 : 6);

          return (
            <motion.div
              key={idx}
              className="absolute cursor-pointer transition-shadow"
              style={{
                zIndex: isHovered ? 40 : idx + 10,
                x: offsetX,
                y: offsetY,
              }}
              animate={{
                rotate: isHovered ? 0 : defaultRotate,
                scale: isHovered ? 1.08 : 1,
                y: isHovered ? offsetY - 14 : offsetY,
              }}
              transition={{ type: "spring", stiffness: 350, damping: 22 }}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              onClick={() => setZoomedImage(img)}
            >
              {/* Tấm ảnh Polaroid */}
              <div
                className="bg-[#fffefc] p-2 sm:p-2.5 pb-6 sm:pb-8 rounded-[4px] border border-black/10 transition-all duration-300 relative"
                style={{
                  width: images.length > 1 ? "190px" : "230px",
                  boxShadow: isHovered
                    ? "0 22px 45px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.2)"
                    : "0 10px 25px rgba(0,0,0,0.35), 0 2px 6px rgba(0,0,0,0.15)",
                }}
              >
                {/* Miếng băng dính Washi Tape ở trên đầu */}
                <div
                  className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-14 h-4 rounded-xs opacity-85 shadow-xs"
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
                </div>

                {/* Dòng ghi chú viết tay dưới viền ảnh Polaroid */}
                <div className="mt-2 text-center">
                  <span className="font-note text-xs sm:text-sm text-gray-700 font-bold block truncate px-1">
                    {recipientName} {images.length > 1 ? `✦ #${idx + 1}` : "✦"}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {images.length > 1 && (
        <p className="text-[11px] sm:text-xs text-white/50 mt-1 font-note flex items-center gap-1">
          <span>📸</span> Rê chuột hoặc chạm vào từng tấm ảnh để xem rõ
        </p>
      )}

      {/* Lightbox Phóng To Ảnh khi bấm vào */}
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
              className="relative z-10 max-w-lg w-full bg-white p-3 sm:p-4 pb-8 sm:pb-10 rounded-lg shadow-2xl border border-white/20"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setZoomedImage(null)}
                className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-black/80 text-white font-bold text-sm flex items-center justify-center shadow-lg hover:bg-black transition cursor-pointer"
              >
                ✕
              </button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={zoomedImage}
                alt={recipientName}
                className="w-full h-auto max-h-[75vh] object-contain rounded-sm"
              />
              <div className="mt-3 text-center">
                <span className="font-note text-base sm:text-lg text-gray-800 font-bold">
                  {recipientName} ✦
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
