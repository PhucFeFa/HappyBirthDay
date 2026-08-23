"use client";

import type { ThemeKey } from "@/lib/utils";
import { THEMES } from "@/lib/utils";

interface BirthdayCakeProps {
  theme: ThemeKey;
  isRevealed?: boolean;
}

export default function BirthdayCake({ theme, isRevealed = true }: BirthdayCakeProps) {
  const t = THEMES[theme];

  // 5 cây nến đặt đều trên nóc tầng 1 (tâm bánh x: 130)
  const candles = [
    { x: 90, height: 26, delay: "0s" },
    { x: 110, height: 30, delay: "0.2s" },
    { x: 130, height: 34, delay: "0.4s" },
    { x: 150, height: 30, delay: "0.1s" },
    { x: 170, height: 26, delay: "0.3s" },
  ];

  return (
    <div className="flex flex-col items-center justify-center select-none relative">
      <svg
        viewBox="0 0 260 250"
        width="270"
        height="260"
        xmlns="http://www.w3.org/2000/svg"
        className={`transition-all duration-700 ${isRevealed ? "cake-reveal" : ""}`}
        style={{
          filter: `drop-shadow(0 12px 28px ${t.primary}40)`,
        }}
      >
        <defs>
          {/* Gradients cho các tầng bánh */}
          <linearGradient id={`tier3-grad-${theme}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={t.primary} stopOpacity={0.88} />
            <stop offset="35%" stopColor={t.secondary} stopOpacity={1} />
            <stop offset="70%" stopColor={t.primary} stopOpacity={1} />
            <stop offset="100%" stopColor={t.primary} stopOpacity={0.8} />
          </linearGradient>

          <linearGradient id={`tier2-grad-${theme}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={t.secondary} stopOpacity={0.9} />
            <stop offset="35%" stopColor={t.accent} stopOpacity={1} />
            <stop offset="70%" stopColor={t.secondary} stopOpacity={1} />
            <stop offset="100%" stopColor={t.primary} stopOpacity={0.8} />
          </linearGradient>

          <linearGradient id={`tier1-grad-${theme}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={t.primary} stopOpacity={0.9} />
            <stop offset="35%" stopColor={t.secondary} stopOpacity={1} />
            <stop offset="70%" stopColor={t.primary} stopOpacity={1} />
            <stop offset="100%" stopColor={t.primary} stopOpacity={0.8} />
          </linearGradient>

          {/* Lớp kem tươi sữa mềm mịn */}
          <linearGradient id="cream-icing" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="60%" stopColor="#fffdfa" />
            <stop offset="100%" stopColor="#fcedde" />
          </linearGradient>

          {/* Đĩa bánh tráng gương */}
          <linearGradient id="cake-plate-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity={0.25} />
            <stop offset="30%" stopColor="#ffffff" stopOpacity={0.9} />
            <stop offset="70%" stopColor="#ffffff" stopOpacity={0.95} />
            <stop offset="100%" stopColor="#ffffff" stopOpacity={0.25} />
          </linearGradient>

          {/* Ngọn lửa nến vàng cam ấm áp */}
          <linearGradient id="candle-flame-warm" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#ff5400" />
            <stop offset="30%" stopColor="#ff9e00" />
            <stop offset="70%" stopColor="#ffd000" />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>

          {/* Ánh hào quang nến ấm */}
          <radialGradient id="halo-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffb703" stopOpacity={0.7} />
            <stop offset="50%" stopColor="#fb8500" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#ffb703" stopOpacity={0} />
          </radialGradient>
        </defs>

        {/* ─── 1. ĐĨA BÁNH (Cố định tĩnh) ─── */}
        <g id="plate">
          <ellipse cx="130" cy="232" rx="108" ry="10" fill="#000000" opacity={0.35} />
          <ellipse cx="130" cy="226" rx="112" ry="11" fill="url(#cake-plate-grad)" />
          <ellipse cx="130" cy="224" rx="106" ry="8" fill="#252530" opacity={0.6} />
          <ellipse cx="130" cy="223" rx="102" ry="7" fill="url(#cake-plate-grad)" opacity={0.9} />
        </g>

        {/* ─── 2. TẦNG 3 (TẦNG ĐÁY: Width 180) ─── */}
        <g id="tier-3">
          {/* Thân bánh tầng 3 */}
          <path
            d="M 40 180 L 40 216 C 40 223, 220 223, 220 216 L 220 180 Z"
            fill={`url(#tier3-grad-${theme})`}
          />

          {/* Dải chân kem viền hạt tròn quanh chân tầng 3 */}
          <g fill="#ffffff" opacity={0.9}>
            {[48, 62, 76, 90, 104, 118, 132, 146, 160, 174, 188, 202, 212].map((cx, i) => (
              <circle key={`pearl-3-${i}`} cx={cx} cy="216" r="4.2" />
            ))}
          </g>

          {/* Họa tiết ren lượn sóng trên thân bánh */}
          <path
            d="M 46 195 Q 68 206 90 195 Q 112 206 134 195 Q 156 206 178 195 Q 200 206 214 195"
            stroke="#ffffff"
            strokeWidth="2"
            strokeDasharray="2 4"
            fill="none"
            opacity={0.7}
          />

          {/* Mặt nóc bánh tầng 3 */}
          <ellipse cx="130" cy="180" rx="90" ry="11" fill={t.secondary} />

          {/* Lớp kem phủ mềm mại tầng 3 */}
          <path
            d="M 40 180 
               C 40 190, 52 200, 60 190 
               C 68 202, 82 204, 90 191 
               C 98 203, 112 205, 120 192 
               C 128 204, 142 205, 150 192 
               C 158 203, 172 202, 180 190 
               C 188 201, 202 198, 208 188 
               C 214 195, 220 189, 220 180 
               Z"
            fill="url(#cream-icing)"
          />
        </g>

        {/* ─── 3. TẦNG 2 (TẦNG GIỮA: Width 136) ─── */}
        <g id="tier-2">
          {/* Thân bánh tầng 2 */}
          <path
            d="M 62 138 L 62 172 C 62 179, 198 179, 198 172 L 198 138 Z"
            fill={`url(#tier2-grad-${theme})`}
          />

          {/* Dải chân kem viền tầng 2 */}
          <g fill="#ffffff" opacity={0.9}>
            {[70, 84, 98, 112, 126, 140, 154, 168, 182, 190].map((cx, i) => (
              <circle key={`pearl-2-${i}`} cx={cx} cy="173" r="3.8" />
            ))}
          </g>

          {/* Họa tiết tim kem trên thân tầng 2 */}
          <g fill="#ffffff" opacity={0.8}>
            {[82, 106, 130, 154, 178].map((cx, i) => (
              <path
                key={`heart-2-${i}`}
                d={`M ${cx} 156 C ${cx - 4} 150, ${cx - 9} 154, ${cx} 163 C ${cx + 9} 154, ${cx + 4} 150, ${cx} 156 Z`}
              />
            ))}
          </g>

          {/* Mặt nóc bánh tầng 2 */}
          <ellipse cx="130" cy="138" rx="68" ry="9" fill={t.primary} />

          {/* Lớp kem phủ mềm mại tầng 2 */}
          <path
            d="M 62 138 
               C 62 147, 74 156, 82 147 
               C 90 158, 104 160, 112 148 
               C 120 159, 134 160, 142 148 
               C 150 159, 164 158, 172 147 
               C 180 157, 192 154, 198 145 
               L 198 138 
               Z"
            fill="url(#cream-icing)"
          />
        </g>

        {/* ─── 4. TẦNG 1 (TẦNG TRÊN CÙNG: Width 96) ─── */}
        <g id="tier-1">
          {/* Thân bánh tầng 1 */}
          <path
            d="M 82 98 L 82 130 C 82 136, 178 136, 178 130 L 178 98 Z"
            fill={`url(#tier1-grad-${theme})`}
          />

          {/* Dải chân kem viền tầng 1 */}
          <g fill="#ffffff" opacity={0.92}>
            {[90, 102, 114, 126, 138, 150, 162, 170].map((cx, i) => (
              <circle key={`pearl-1-${i}`} cx={cx} cy="131" r="3.4" />
            ))}
          </g>

          {/* Mặt nóc bánh tầng 1 */}
          <ellipse cx="130" cy="98" rx="48" ry="7.5" fill={t.secondary} />

          {/* Lớp kem phủ tầng 1 */}
          <path
            d="M 82 98 
               C 82 106, 94 114, 102 106 
               C 110 116, 122 117, 130 107 
               C 138 117, 150 116, 158 106 
               C 166 114, 175 112, 178 103 
               L 178 98 
               Z"
            fill="url(#cream-icing)"
          />
        </g>

        {/* ─── 5. BỘ 5 CÂY NẾN & NGỌN LỬA GẮN LIỀN CHUẨN XÁC ─── */}
        <g id="candles">
          {candles.map((c, i) => {
            const candleBaseY = 96;
            const candleTopY = candleBaseY - c.height;
            const wickTopY = candleTopY - 5;
            const candleColor = i % 2 === 0 ? "#ffffff" : t.primary;
            const stripeColor = i % 2 === 0 ? t.primary : "#ffd166";

            return (
              <g key={`cand-${i}`}>
                {/* Ánh hào quang nến ấm áp */}
                <circle
                  cx={c.x}
                  cy={wickTopY - 9}
                  r="20"
                  fill="url(#halo-glow)"
                  className="animate-pulse"
                  style={{ animationDuration: "2.5s", animationDelay: c.delay }}
                />

                {/* Thân cây nến */}
                <rect
                  x={c.x - 3.5}
                  y={candleTopY}
                  width="7"
                  height={c.height}
                  rx="2"
                  fill={candleColor}
                  stroke="rgba(0,0,0,0.06)"
                  strokeWidth="0.5"
                />

                {/* Sọc xoắn pastel trên nến */}
                <path
                  d={`M ${c.x - 3.5} ${candleTopY + 5} L ${c.x + 3.5} ${candleTopY + 9}
                     M ${c.x - 3.5} ${candleTopY + 13} L ${c.x + 3.5} ${candleTopY + 17}
                     M ${c.x - 3.5} ${candleTopY + 21} L ${c.x + 3.5} ${candleTopY + 25}`}
                  stroke={stripeColor}
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  opacity={0.85}
                />

                {/* Bấc nến đen thẳng nối liền vào gốc ngọn lửa */}
                <line
                  x1={c.x}
                  y1={candleTopY}
                  x2={c.x}
                  y2={wickTopY}
                  stroke="#222222"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />

                {/* Ngọn lửa nến ấm áp gắn cố định chặt vào đỉnh bấc nến */}
                <g
                  className="flame-flicker"
                  style={{
                    transformOrigin: `${c.x}px ${wickTopY}px`,
                    animationDelay: c.delay,
                  }}
                >
                  {/* Ngọn lửa ngoài hình giọt nước vàng cam */}
                  <path
                    d={`M ${c.x} ${wickTopY} 
                       C ${c.x - 5.5} ${wickTopY - 4}, ${c.x - 6} ${wickTopY - 12}, ${c.x} ${wickTopY - 18} 
                       C ${c.x + 6} ${wickTopY - 12}, ${c.x + 5.5} ${wickTopY - 4}, ${c.x} ${wickTopY} 
                       Z`}
                    fill="url(#candle-flame-warm)"
                    filter="drop-shadow(0 0 5px #ff9e00)"
                  />
                  {/* Tâm sáng ngọn lửa trắng tinh khiết */}
                  <ellipse
                    cx={c.x}
                    cy={wickTopY - 6}
                    rx="2"
                    ry="5"
                    fill="#ffffff"
                    opacity={0.92}
                  />
                </g>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
