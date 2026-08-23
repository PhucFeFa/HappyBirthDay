"use client";

import { useEffect, useState } from "react";

interface Star {
  id: number;
  top: string;
  left: string;
  duration: string;
  delay: string;
  size: number;
}

export default function StarField({ color }: { color?: string }) {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    // Chỉ tạo 20 ngôi sao nhẹ nhàng để GPU không bị tốn tài nguyên
    const generated = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      top: `${(i * 19 + 8) % 94}%`,
      left: `${(i * 31 + 14) % 95}%`,
      duration: `${2.2 + (i % 4) * 0.8}s`,
      delay: `${(i % 5) * 0.5}s`,
      size: i % 3 === 0 ? 3 : 2,
    }));
    setStars(generated);
  }, []);

  if (stars.length === 0) return null;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden>
      {stars.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            backgroundColor: color ?? "#ffffff",
            opacity: 0.5,
            animation: `twinkle ${s.duration} ease-in-out ${s.delay} infinite`,
          }}
        />
      ))}
    </div>
  );
}
