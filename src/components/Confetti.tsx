"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";

interface ConfettiProps {
  trigger?: boolean;
  triggerId?: number | string;
}

export default function Confetti({ trigger = true, triggerId }: ConfettiProps) {
  useEffect(() => {
    if (!trigger) return;

    // Burst 1: Trung tâm bùng nổ pháo hoa đẹp mắt
    confetti({
      particleCount: 80,
      spread: 90,
      origin: { y: 0.6 },
      colors: ["#ff6b9d", "#a855f7", "#fbbf24", "#34d399", "#60a5fa", "#ffffff"],
      zIndex: 99999,
      disableForReducedMotion: true,
    });

    // Burst 2: Hai bên hông sau 300ms
    const timer = setTimeout(() => {
      confetti({
        particleCount: 45,
        angle: 60,
        spread: 65,
        origin: { x: 0.05, y: 0.65 },
        colors: ["#ff6b9d", "#a855f7", "#3b82f6", "#f59e0b", "#ffd166"],
        zIndex: 99999,
        disableForReducedMotion: true,
      });
      confetti({
        particleCount: 45,
        angle: 120,
        spread: 65,
        origin: { x: 0.95, y: 0.65 },
        colors: ["#ff6b9d", "#a855f7", "#3b82f6", "#f59e0b", "#ffd166"],
        zIndex: 99999,
        disableForReducedMotion: true,
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [trigger, triggerId]);

  return null;
}
