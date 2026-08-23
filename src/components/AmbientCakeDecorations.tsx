"use client";

import { motion } from "framer-motion";
import type { CelebrationEffectKey } from "@/lib/utils";

interface AmbientCakeDecorationsProps {
  effect?: CelebrationEffectKey;
}

// ─── 1. HIỆU ỨNG HOA XOAY (Flowers Ambient) ──────────────────────────────────
function FlowersAmbient() {
  const leftFlowers = [
    { top: "10%", left: "-38px", size: 34, color: "#ff758f", centerColor: "#ffd166", speed: 18, delay: 0 },
    { top: "42%", left: "-52px", size: 42, color: "#ffb703", centerColor: "#fb8500", speed: 24, delay: 0.4 },
    { top: "72%", left: "-38px", size: 30, color: "#ffb3c6", centerColor: "#ff4d6d", speed: 16, delay: 0.8 },
    { top: "25%", left: "-14px", size: 22, color: "#c77dff", centerColor: "#ffffff", speed: 20, delay: 0.2 },
    { top: "58%", left: "-18px", size: 26, color: "#ff758f", centerColor: "#ffd166", speed: 22, delay: 0.6 },
  ];

  const rightFlowers = [
    { top: "12%", right: "-38px", size: 36, color: "#ffb3c6", centerColor: "#ff4d6d", speed: 20, delay: 0.3 },
    { top: "45%", right: "-54px", size: 44, color: "#ff758f", centerColor: "#ffd166", speed: 26, delay: 0.7 },
    { top: "70%", right: "-36px", size: 32, color: "#c77dff", centerColor: "#ffffff", speed: 15, delay: 1.1 },
    { top: "28%", right: "-14px", size: 24, color: "#ffb703", centerColor: "#fb8500", speed: 22, delay: 0.5 },
    { top: "60%", right: "-20px", size: 26, color: "#ffb3c6", centerColor: "#ff4d6d", speed: 19, delay: 0.9 },
  ];

  // Vẽ hoa 5 cánh tròn trịa hoàn hảo không bao giờ bị lỗi path hay vòng tròn lệch
  const renderFlower = (petalColor: string, centerColor: string) => (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
      <g fill={petalColor}>
        {/* 5 cánh hoa xếp đều 72 độ quanh tâm (50, 50) */}
        <circle cx="50" cy="24" r="18" />
        <circle cx="75" cy="42" r="18" />
        <circle cx="65" cy="72" r="18" />
        <circle cx="35" cy="72" r="18" />
        <circle cx="25" cy="42" r="18" />
      </g>
      {/* Tâm hoa / Nhụy hoa */}
      <circle cx="50" cy="50" r="14" fill={centerColor} />
      <circle cx="50" cy="50" r="7" fill="#ffffff" opacity="0.6" />
    </svg>
  );

  return (
    <>
      {leftFlowers.map((f, idx) => (
        <motion.div
          key={`fl-left-${idx}`}
          className="absolute"
          style={{
            top: f.top,
            left: f.left,
            width: f.size,
            height: f.size,
            filter: "drop-shadow(0 4px 10px rgba(255, 117, 143, 0.4))",
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0.85, 1, 0.85],
            scale: [1, 1.1, 1],
            y: [0, -8, 0],
            rotate: [0, 360],
          }}
          transition={{
            rotate: { duration: f.speed, repeat: Infinity, ease: "linear" },
            y: { duration: 3 + idx * 0.6, repeat: Infinity, ease: "easeInOut" },
            scale: { duration: 2.5 + idx * 0.4, repeat: Infinity, ease: "easeInOut" },
            opacity: { duration: 1, delay: f.delay },
          }}
        >
          {renderFlower(f.color, f.centerColor)}
        </motion.div>
      ))}

      {rightFlowers.map((f, idx) => (
        <motion.div
          key={`fl-right-${idx}`}
          className="absolute"
          style={{
            top: f.top,
            right: f.right,
            width: f.size,
            height: f.size,
            filter: "drop-shadow(0 4px 10px rgba(255, 117, 143, 0.4))",
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0.85, 1, 0.85],
            scale: [1, 1.1, 1],
            y: [0, -9, 0],
            rotate: [360, 0],
          }}
          transition={{
            rotate: { duration: f.speed, repeat: Infinity, ease: "linear" },
            y: { duration: 3.2 + idx * 0.5, repeat: Infinity, ease: "easeInOut" },
            scale: { duration: 2.8 + idx * 0.3, repeat: Infinity, ease: "easeInOut" },
            opacity: { duration: 1, delay: f.delay },
          }}
        >
          {renderFlower(f.color, f.centerColor)}
        </motion.div>
      ))}
    </>
  );
}

// ─── 2. HIỆU ỨNG SAO PHÉP MÀU (Sparkles Ambient) ──────────────────────────────
function SparklesAmbient() {
  const sparkles = [
    { top: "5%", left: "-32px", size: 28, color: "#ffd166", delay: 0 },
    { top: "35%", left: "-48px", size: 36, color: "#c77dff", delay: 0.5 },
    { top: "68%", left: "-30px", size: 24, color: "#06d6a0", delay: 1.0 },
    { top: "20%", left: "-10px", size: 18, color: "#ffffff", delay: 0.2 },
    { top: "80%", left: "-16px", size: 22, color: "#ffd166", delay: 0.7 },
    { top: "8%", right: "-32px", size: 32, color: "#ef476f", delay: 0.3 },
    { top: "38%", right: "-50px", size: 38, color: "#ffd166", delay: 0.8 },
    { top: "65%", right: "-34px", size: 26, color: "#118ab2", delay: 1.2 },
    { top: "22%", right: "-12px", size: 20, color: "#c77dff", delay: 0.4 },
    { top: "82%", right: "-18px", size: 22, color: "#ffffff", delay: 0.9 },
  ];

  return (
    <>
      {sparkles.map((s, idx) => (
        <motion.div
          key={`sp-${idx}`}
          className="absolute"
          style={{
            top: s.top,
            left: s.left,
            right: s.right,
            width: s.size,
            height: s.size,
            filter: `drop-shadow(0 0 10px ${s.color})`,
          }}
          animate={{
            scale: [0.6, 1.3, 0.7],
            opacity: [0.4, 1, 0.4],
            rotate: [0, 90, 180],
          }}
          transition={{
            duration: 2.2 + (idx % 3) * 0.4,
            repeat: Infinity,
            delay: s.delay,
            ease: "easeInOut",
          }}
        >
          <svg viewBox="0 0 24 24" className="w-full h-full" fill={s.color}>
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
          </svg>
        </motion.div>
      ))}
    </>
  );
}

// ─── 3. HIỆU ỨNG BÓNG BAY NHẤP NHÔ (Balloons Ambient) ─────────────────────────
function BalloonsAmbient() {
  const leftBalloons = [
    { top: "15%", left: "-42px", size: 38, color: "#ff4d6d", duration: 3.2, delay: 0 },
    { top: "48%", left: "-56px", size: 44, color: "#3a86ff", duration: 3.8, delay: 0.6 },
    { top: "72%", left: "-32px", size: 34, color: "#ffbe0b", duration: 2.8, delay: 1.2 },
  ];

  const rightBalloons = [
    { top: "18%", right: "-44px", size: 40, color: "#8338ec", duration: 3.5, delay: 0.3 },
    { top: "50%", right: "-58px", size: 46, color: "#06d6a0", duration: 4.0, delay: 0.9 },
    { top: "74%", right: "-34px", size: 36, color: "#f72585", duration: 3.0, delay: 1.5 },
  ];

  const renderBalloon = (color: string) => (
    <svg viewBox="0 0 100 125" className="w-full h-full drop-shadow-lg">
      <path
        d="M50 0 C22.4 0 0 22.4 0 50 C0 75 35 95 47 98 L45 105 L55 105 L53 98 C65 95 100 75 100 50 C100 22.4 77.6 0 50 0 Z"
        fill={color}
      />
      <ellipse cx="32" cy="28" rx="10" ry="16" fill="rgba(255,255,255,0.4)" transform="rotate(-30 32 28)" />
      <path d="M50 105 Q45 115 52 125" stroke="rgba(255,255,255,0.5)" strokeWidth="2" fill="none" />
    </svg>
  );

  return (
    <>
      {leftBalloons.map((b, idx) => (
        <motion.div
          key={`bal-left-${idx}`}
          className="absolute"
          style={{
            top: b.top,
            left: b.left,
            width: b.size,
            height: b.size * 1.25,
          }}
          animate={{
            y: [-12, 12, -12],
            x: [-4, 4, -4],
            rotate: [-6, 6, -6],
          }}
          transition={{
            duration: b.duration,
            repeat: Infinity,
            delay: b.delay,
            ease: "easeInOut",
          }}
        >
          {renderBalloon(b.color)}
        </motion.div>
      ))}

      {rightBalloons.map((b, idx) => (
        <motion.div
          key={`bal-right-${idx}`}
          className="absolute"
          style={{
            top: b.top,
            right: b.right,
            width: b.size,
            height: b.size * 1.25,
          }}
          animate={{
            y: [12, -12, 12],
            x: [4, -4, 4],
            rotate: [6, -6, 6],
          }}
          transition={{
            duration: b.duration,
            repeat: Infinity,
            delay: b.delay,
            ease: "easeInOut",
          }}
        >
          {renderBalloon(b.color)}
        </motion.div>
      ))}
    </>
  );
}

// ─── 4. HIỆU ỨNG PHÁO GIẤY & RUY BĂNG KIM TUYẾN (Confetti Ambient) ───────────
function ConfettiAmbient() {
  const ribbons = [
    { top: "12%", left: "-36px", size: 30, color: "#ff6b9d", delay: 0 },
    { top: "45%", left: "-48px", size: 34, color: "#fbbf24", delay: 0.5 },
    { top: "72%", left: "-32px", size: 26, color: "#34d399", delay: 1.0 },
    { top: "15%", right: "-36px", size: 32, color: "#a855f7", delay: 0.3 },
    { top: "48%", right: "-50px", size: 36, color: "#60a5fa", delay: 0.8 },
    { top: "70%", right: "-34px", size: 28, color: "#f43f5e", delay: 1.2 },
  ];

  return (
    <>
      {ribbons.map((r, idx) => (
        <motion.div
          key={`conf-${idx}`}
          className="absolute"
          style={{
            top: r.top,
            left: r.left,
            right: r.right,
            width: r.size,
            height: r.size,
          }}
          animate={{
            y: [-10, 8, -10],
            rotate: [0, 180, 360],
            scale: [0.9, 1.15, 0.9],
          }}
          transition={{
            duration: 3 + (idx % 2) * 0.8,
            repeat: Infinity,
            delay: r.delay,
            ease: "easeInOut",
          }}
        >
          <svg viewBox="0 0 40 40" className="w-full h-full drop-shadow-md" fill={r.color}>
            <path d="M5 20 C 15 5, 25 35, 35 20 C 25 5, 15 35, 5 20 Z" />
          </svg>
        </motion.div>
      ))}
    </>
  );
}

// ─── MAIN COMPONENT DISPATCHER ────────────────────────────────────────────────
export default function AmbientCakeDecorations({ effect = "flowers" }: AmbientCakeDecorationsProps) {
  return (
    <div className="absolute inset-0 pointer-events-none select-none z-20 overflow-visible">
      {effect === "flowers" && <FlowersAmbient />}
      {effect === "sparkles" && <SparklesAmbient />}
      {effect === "balloons" && <BalloonsAmbient />}
      {effect === "confetti" && <ConfettiAmbient />}
    </div>
  );
}
