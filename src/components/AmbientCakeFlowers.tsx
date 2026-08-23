"use client";

import { motion } from "framer-motion";

// SVG các loài hoa sắc nét, đa dạng
const AMBIENT_ICONS = [
  // Hoa anh đào hồng phấn
  {
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        <path
          d="M50 50 C45 20 25 15 25 30 C25 45 45 50 50 50 C55 20 75 15 75 30 C75 45 55 50 50 50 C80 45 85 65 70 75 C55 85 50 55 50 50 C45 80 25 85 15 70 C5 55 45 50 50 50 C20 55 15 35 30 25 C45 15 50 45 50 50 Z"
          fill="#ff758f"
        />
        <circle cx="50" cy="50" r="10" fill="#ffd166" />
      </svg>
    ),
  },
  // Hoa cúc vàng tươi
  {
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        <g fill="#ffb703">
          <ellipse cx="50" cy="20" rx="9" ry="18" />
          <ellipse cx="50" cy="80" rx="9" ry="18" />
          <ellipse cx="20" cy="50" rx="18" ry="9" />
          <ellipse cx="80" cy="50" rx="18" ry="9" />
          <ellipse cx="29" cy="29" rx="10" ry="16" transform="rotate(-45 29 29)" />
          <ellipse cx="71" cy="71" rx="10" ry="16" transform="rotate(-45 71 71)" />
          <ellipse cx="71" cy="29" rx="10" ry="16" transform="rotate(45 71 29)" />
          <ellipse cx="29" cy="71" rx="10" ry="16" transform="rotate(45 29 71)" />
        </g>
        <circle cx="50" cy="50" r="14" fill="#fb8500" />
      </svg>
    ),
  },
  // Hoa đào pastel
  {
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        <g fill="#ffb3c6">
          <circle cx="35" cy="35" r="22" />
          <circle cx="65" cy="35" r="22" />
          <circle cx="35" cy="65" r="22" />
          <circle cx="65" cy="65" r="22" />
        </g>
        <circle cx="50" cy="50" r="12" fill="#fff3b0" />
      </svg>
    ),
  },
  // Hoa tím lavender
  {
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        <path
          d="M50 50 C45 20 25 15 25 30 C25 45 45 50 50 50 C55 20 75 15 75 30 C75 45 55 50 50 50 C80 45 85 65 70 75 C55 85 50 55 50 50 C45 80 25 85 15 70 C5 55 45 50 50 50 C20 55 15 35 30 25 C45 15 50 45 50 50 Z"
          fill="#c77dff"
        />
        <circle cx="50" cy="50" r="10" fill="#ffffff" />
      </svg>
    ),
  },
];

export default function AmbientCakeFlowers() {
  // 5 bông hoa ôm sát bên trái thân bánh kem
  const leftFlowers = [
    { top: "12%", left: "-36px", size: 34, iconIdx: 0, speed: 18, delay: 0 },
    { top: "42%", left: "-52px", size: 42, iconIdx: 1, speed: 24, delay: 0.4 },
    { top: "72%", left: "-38px", size: 30, iconIdx: 2, speed: 16, delay: 0.8 },
    { top: "25%", left: "-14px", size: 22, iconIdx: 3, speed: 20, delay: 0.2 },
    { top: "58%", left: "-18px", size: 26, iconIdx: 0, speed: 22, delay: 0.6 },
  ];

  // 5 bông hoa ôm sát bên phải thân bánh kem
  const rightFlowers = [
    { top: "15%", right: "-36px", size: 36, iconIdx: 2, speed: 20, delay: 0.3 },
    { top: "45%", right: "-54px", size: 44, iconIdx: 0, speed: 26, delay: 0.7 },
    { top: "70%", right: "-36px", size: 32, iconIdx: 3, speed: 15, delay: 1.1 },
    { top: "28%", right: "-14px", size: 24, iconIdx: 1, speed: 22, delay: 0.5 },
    { top: "60%", right: "-20px", size: 26, iconIdx: 2, speed: 19, delay: 0.9 },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-20">
      {/* Cụm hoa bên trái ôm sát bánh */}
      {leftFlowers.map((f, idx) => (
        <motion.div
          key={`left-fl-${idx}`}
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
          {AMBIENT_ICONS[f.iconIdx].svg}
        </motion.div>
      ))}

      {/* Cụm hoa bên phải ôm sát bánh */}
      {rightFlowers.map((f, idx) => (
        <motion.div
          key={`right-fl-${idx}`}
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
          {AMBIENT_ICONS[f.iconIdx].svg}
        </motion.div>
      ))}
    </div>
  );
}
