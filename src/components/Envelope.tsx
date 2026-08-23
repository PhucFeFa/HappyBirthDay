"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { ThemeKey } from "@/lib/utils";
import { THEMES } from "@/lib/utils";

interface EnvelopeProps {
  recipientName: string;
  theme: ThemeKey;
  onOpen: () => void;
}

export default function Envelope({
  recipientName,
  theme,
  onOpen,
}: EnvelopeProps) {
  const [isOpening, setIsOpening] = useState(false);
  const t = THEMES[theme];

  const handleOpen = () => {
    if (isOpening) return;
    setIsOpening(true);
    // Sau khi nắp lật và thiệp trượt lên, gọi onOpen để kích hoạt màn hình chính
    setTimeout(() => {
      onOpen();
    }, 1100);
  };

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-4 w-full max-w-md mx-auto">
      {/* 3D Envelope Container */}
      <div
        className="relative cursor-pointer select-none group w-full flex justify-center"
        onClick={handleOpen}
        style={{ perspective: 1000 }}
      >
        {/* Glow behind envelope */}
        <div
          className="absolute -inset-2 sm:-inset-4 rounded-3xl opacity-30 blur-2xl transition duration-500 group-hover:opacity-50"
          style={{ background: `radial-gradient(circle, ${t.primary}, transparent 70%)` }}
        />

        {/* Envelope Body */}
        <div
          className="relative w-[88vw] max-w-[360px] sm:max-w-[400px] h-[200px] sm:h-[240px] rounded-2xl overflow-visible shadow-2xl border border-white/20 transition duration-300 group-hover:scale-[1.02]"
          style={{
            background: `linear-gradient(145deg, #1c1a24, #121118)`,
            boxShadow: `0 20px 50px rgba(0,0,0,0.6), 0 0 30px ${t.primary}25`,
          }}
        >
          {/* Card Inside (Letter) */}
          <motion.div
            className="absolute left-3 right-3 top-3 bottom-3 sm:left-4 sm:right-4 sm:top-4 sm:bottom-4 rounded-xl p-4 sm:p-5 border border-white/20 flex flex-col items-center justify-center text-center shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${t.card.split(" ")[0].replace("bg-", "") || "#251d2c"}, #1a1622)`,
              zIndex: 10,
            }}
            initial={false}
            animate={
              isOpening
                ? { y: -120, scale: 1.04, opacity: 1 }
                : { y: 0, scale: 1, opacity: 0.95 }
            }
            transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="text-[10px] sm:text-xs uppercase tracking-widest text-white/50 mb-1 font-mono">
              Thư chúc mừng
            </span>
            <p className="font-script text-2xl sm:text-3xl text-white font-bold mb-1 truncate max-w-full px-2">
              {recipientName}
            </p>
            <div
              className="w-8 h-0.5 my-1.5 rounded-full"
              style={{ background: t.primary }}
            />
            <span className="text-[10px] sm:text-[11px] text-white/40 italic">
              Một món quà sinh nhật đặc biệt dành cho bạn
            </span>
          </motion.div>

          {/* Front Pocket Left/Right folds */}
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              background: `linear-gradient(to top right, rgba(255,255,255,0.05), transparent 60%),
                           linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.4))`,
              zIndex: 15,
            }}
          />

          {/* Top Flap with 3D Flip */}
          <motion.div
            className="absolute top-0 left-0 right-0 origin-top"
            style={{
              zIndex: isOpening ? 5 : 20,
              transformStyle: "preserve-3d",
            }}
            initial={false}
            animate={isOpening ? { rotateX: 180 } : { rotateX: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* Triangular Flap */}
            <svg
              viewBox="0 0 400 150"
              className="w-full h-auto drop-shadow-md"
              style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.4))" }}
            >
              <polygon
                points="0,0 400,0 200,150"
                fill="#2a2536"
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="1"
              />
            </svg>

            {/* Wax Seal Stamp on Flap tip */}
            <div
              className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-lg border border-white/30 transition duration-300"
              style={{
                background: `radial-gradient(circle at 35% 35%, ${t.secondary}, ${t.primary} 70%, #701a35)`,
                boxShadow: `0 4px 15px ${t.primary}60, inset 0 2px 4px rgba(255,255,255,0.4)`,
              }}
            >
              <span className="text-white font-serif text-base sm:text-lg select-none">✦</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Action Instruction */}
      <motion.div
        className="mt-6 sm:mt-8 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <button
          type="button"
          onClick={handleOpen}
          disabled={isOpening}
          className="btn-primary py-2.5 sm:py-3 px-7 sm:px-8 text-xs sm:text-sm font-semibold rounded-full shadow-xl tracking-wide cursor-pointer transition hover:scale-105"
          style={{
            background: `linear-gradient(135deg, ${t.primary}, ${t.secondary})`,
          }}
        >
          {isOpening ? "Đang mở thư..." : "Chạm để mở thiệp"}
        </button>
        <p className="text-[11px] sm:text-xs text-white/40 mt-2">
          Nhấn vào phong bì thư để mở lời chúc mừng sinh nhật
        </p>
      </motion.div>
    </div>
  );
}
