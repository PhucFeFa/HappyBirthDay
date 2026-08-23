"use client";

import { motion } from "framer-motion";
import type { ThemeKey } from "@/lib/utils";

interface WishCardProps {
  authorName: string;
  message: string;
  index: number;
  theme: ThemeKey;
}

const PAPER_STYLES = [
  { bg: "#fffdf0", lines: "#f0e8c8", margin: "#f093b0", tape: "#fce38a", tapeOpacity: 0.85, author: "#e8738a" },
  { bg: "#fff0f5", lines: "#f5d5e5", margin: "#a8d8f0", tape: "#ffc8dd", tapeOpacity: 0.8,  author: "#e06090" },
  { bg: "#f0f5ff", lines: "#d5e3f8", margin: "#c8b4f8", tape: "#bde0fe", tapeOpacity: 0.8,  author: "#7c6cf0" },
  { bg: "#f5fff0", lines: "#d5f0d5", margin: "#fcd38a", tape: "#b8f0c8", tapeOpacity: 0.8,  author: "#50c87a" },
  { bg: "#fdf5ff", lines: "#ebd5f8", margin: "#a8e8d8", tape: "#ddb4fe", tapeOpacity: 0.8,  author: "#a855f7" },
];

const ROTATIONS = [-1.8, 1.4, -0.9, 2.1, -1.5, 0.7, 1.9, -1.2];

export default function WishCard({ authorName, message, index }: WishCardProps) {
  const p = PAPER_STYLES[index % PAPER_STYLES.length];
  const rotate = ROTATIONS[index % ROTATIONS.length];

  const isAnon =
    !authorName ||
    authorName.toLowerCase().includes("bí mật") ||
    authorName.toLowerCase().includes("ẩn danh");

  const displayName = isAnon ? "Người gửi bí mật" : authorName;
  const initial = isAnon ? "✦" : authorName.charAt(0).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -6, scale: 1.025, rotate: 0, transition: { duration: 0.22 } }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      style={{
        rotate: `${rotate}deg`,
        filter: "drop-shadow(0 8px 22px rgba(0,0,0,0.25))",
      }}
    >
      <div
        className="relative overflow-hidden"
        style={{
          backgroundColor: p.bg,
          borderRadius: "2px 6px 6px 2px",
          /* Notebook lines */
          backgroundImage: `repeating-linear-gradient(
            transparent,
            transparent 27px,
            ${p.lines} 27px,
            ${p.lines} 28.5px
          )`,
          backgroundPositionY: "42px",
        }}
      >
        {/* ── Washi tape strip at top centre ─────────────────────────────── */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: 64,
            height: 18,
            background: p.tape,
            opacity: p.tapeOpacity,
            borderRadius: "0 0 4px 4px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.10)",
          }}
        />

        {/* ── Left margin stripe ──────────────────────────────────────────── */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 38,
            width: 1.5,
            background: p.margin,
            opacity: 0.6,
          }}
        />

        {/* ── Spiral holes ────────────────────────────────────────────────── */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 16,
            left: 12,
            display: "flex",
            flexDirection: "column",
            gap: 22,
          }}
        >
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "rgba(0,0,0,0.07)",
                boxShadow: "inset 0 1.5px 3px rgba(0,0,0,0.14)",
                border: "1px solid rgba(0,0,0,0.05)",
              }}
            />
          ))}
        </div>

        {/* ── Content area ────────────────────────────────────────────────── */}
        <div className="pl-12 pr-4 pt-7 pb-4">
          {/* Message text */}
          <p
            className="font-note text-lg leading-[28px] mb-4"
            style={{ color: "#2a2a2a", minHeight: 56 }}
          >
            {message}
          </p>

          {/* Author row */}
          <div
            className="flex items-center justify-between pt-2"
            style={{ borderTop: `1.5px solid ${p.lines}` }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 select-none"
                style={{ background: p.author }}
              >
                {initial}
              </div>
              <span className="font-note font-bold text-base" style={{ color: "#2a2a2a" }}>
                {displayName}
              </span>
            </div>

            {isAnon && (
              <span
                className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full tracking-wider"
                style={{ background: "rgba(0,0,0,0.07)", color: "#888" }}
              >
                Ẩn danh
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
