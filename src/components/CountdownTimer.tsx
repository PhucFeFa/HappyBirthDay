"use client";

import { useState, useEffect, useRef } from "react";
import { getRemainingCountdownMs } from "@/lib/utils";

interface CountdownTimerProps {
  revealAt: number;
  serverTime: number;
  onReveal: () => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function msToTimeLeft(ms: number): TimeLeft {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export default function CountdownTimer({
  revealAt,
  serverTime,
  onReveal,
}: CountdownTimerProps) {
  // Tính độ lệch server vs client ngay tại thời điểm mount
  const offsetRef = useRef<number>(serverTime - Date.now());
  const onRevealRef = useRef(onReveal);
  onRevealRef.current = onReveal;

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => {
    const initialOffset = serverTime - Date.now();
    const ms = getRemainingCountdownMs(revealAt, initialOffset);
    return msToTimeLeft(ms);
  });

  const [hasRevealed, setHasRevealed] = useState(false);

  useEffect(() => {
    // Cập nhật lại offset nếu serverTime thay đổi
    offsetRef.current = serverTime - Date.now();

    const checkAndTick = () => {
      const ms = getRemainingCountdownMs(revealAt, offsetRef.current);

      if (ms <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        if (!hasRevealed) {
          setHasRevealed(true);
          onRevealRef.current();
        }
        return;
      }

      setTimeLeft(msToTimeLeft(ms));
    };

    // Chạy tick ngay lập tức
    checkAndTick();

    // Chạy định kỳ mỗi 500ms để đảm bảo đếm từng giây chuẩn xác không bị delay
    const interval = setInterval(checkAndTick, 500);

    return () => clearInterval(interval);
  }, [revealAt, serverTime, hasRevealed]);

  const units = [
    { label: "Ngày", value: timeLeft.days },
    { label: "Giờ", value: timeLeft.hours },
    { label: "Phút", value: timeLeft.minutes },
    { label: "Giây", value: timeLeft.seconds },
  ];

  return (
    <div className="flex gap-3 sm:gap-5 items-center justify-center select-none">
      {units.map((unit, idx) => (
        <div key={unit.label} className="flex items-center gap-3 sm:gap-5">
          <div className="flex flex-col items-center">
            <div className="countdown-box">
              <span className="countdown-number">{pad(unit.value)}</span>
            </div>
            <span className="countdown-label">{unit.label}</span>
          </div>
          {idx < units.length - 1 && (
            <span className="countdown-separator">:</span>
          )}
        </div>
      ))}
    </div>
  );
}
