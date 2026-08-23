"use client";

import { useState, useEffect, useRef } from "react";
import { THEMES, type ThemeKey } from "@/lib/utils";

interface CustomDatePickerProps {
  value: string; // ISO string YYYY-MM-DDTHH:mm
  onChange: (val: string) => void;
  theme: ThemeKey;
  minDate?: string;
}

const MONTH_NAMES = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
];

const WEEKDAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

export default function CustomDatePicker({
  value,
  onChange,
  theme,
  minDate,
}: CustomDatePickerProps) {
  const t = THEMES[theme];
  const containerRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);

  // Parse current selected or default to tomorrow
  const selectedDate = value ? new Date(value) : null;
  const initialYear = selectedDate ? selectedDate.getFullYear() : new Date().getFullYear();
  const initialMonth = selectedDate ? selectedDate.getMonth() : new Date().getMonth();

  const [currentYear, setCurrentYear] = useState(initialYear);
  const [currentMonth, setCurrentMonth] = useState(initialMonth);

  // State for date picking
  const [tempDay, setTempDay] = useState<number | null>(
    selectedDate ? selectedDate.getDate() : null
  );
  const [tempMonth, setTempMonth] = useState(initialMonth);
  const [tempYear, setTempYear] = useState(initialYear);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Sync temp state with incoming value
  useEffect(() => {
    if (value) {
      const d = new Date(value);
      setTempYear(d.getFullYear());
      setTempMonth(d.getMonth());
      setTempDay(d.getDate());
      setCurrentYear(d.getFullYear());
      setCurrentMonth(d.getMonth());
    }
  }, [value]);

  // Get calendar matrix
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const isPastDate = (day: number) => {
    const checkDate = new Date(currentYear, currentMonth, day, 23, 59, 59);
    const min = minDate ? new Date(minDate) : new Date();
    // Allow today
    const startOfToday = new Date(min);
    startOfToday.setHours(0, 0, 0, 0);
    return checkDate.getTime() < startOfToday.getTime();
  };

  const handleSelectDay = (day: number) => {
    setTempDay(day);
    setTempMonth(currentMonth);
    setTempYear(currentYear);

    // Tự động gán 00:00 và hoàn tất
    const year = currentYear;
    const month = String(currentMonth + 1).padStart(2, "0");
    const dStr = String(day).padStart(2, "0");
    const isoString = `${year}-${month}-${dStr}T00:00`;
    onChange(isoString);
    setIsOpen(false);
  };

  // Quick Presets
  const setQuickDate = (daysAhead: number) => {
    const target = new Date();
    target.setDate(target.getDate() + daysAhead);
    setTempDay(target.getDate());
    setTempMonth(target.getMonth());
    setTempYear(target.getFullYear());
    setCurrentMonth(target.getMonth());
    setCurrentYear(target.getFullYear());

    const year = target.getFullYear();
    const month = String(target.getMonth() + 1).padStart(2, "0");
    const dStr = String(target.getDate()).padStart(2, "0");
    const isoString = `${year}-${month}-${dStr}T00:00`;
    onChange(isoString);
    setIsOpen(false);
  };

  // Format display string
  const formatDisplay = () => {
    if (!value) return "Chọn ngày sinh nhật (Mở lúc 00:00)...";
    const d = new Date(value);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const weekday = WEEKDAYS[d.getDay()];

    return `${weekday}, ngày ${day}/${month}/${year} (Mở lúc 00:00)`;
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 sm:py-3.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/30 transition text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-pink-500/50"
        style={{
          boxShadow: isOpen ? `0 0 15px ${t.primary}30` : "none",
          borderColor: isOpen ? t.primary : undefined,
        }}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/80 shrink-0"
            style={{
              background: `linear-gradient(135deg, ${t.primary}30, ${t.secondary}20)`,
              border: `1px solid ${t.primary}40`,
            }}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="2" />
              <path d="M16 2v4M8 2v4M3 10h18" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <span
            className={`text-xs sm:text-sm truncate ${
              value ? "text-white font-medium" : "text-white/40"
            }`}
          >
            {formatDisplay()}
          </span>
        </div>

        <span className="text-xs text-white/50 shrink-0 ml-2">
          {isOpen ? "Đóng ▲" : "Chọn ngày ▼"}
        </span>
      </button>

      {/* Popover / Calendar Modal */}
      {isOpen && (
        <div
          className="absolute left-0 right-0 sm:right-auto sm:w-[350px] top-full mt-2 z-50 rounded-2xl p-4 sm:p-5 border border-white/20 shadow-2xl backdrop-blur-2xl fade-in-up"
          style={{
            background: "rgba(18, 16, 26, 0.96)",
            boxShadow: `0 20px 60px rgba(0, 0, 0, 0.85), 0 0 30px ${t.primary}20`,
          }}
        >
          {/* Header Navigation */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <span className="font-semibold text-sm text-white">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Quick Date Presets */}
          <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1 text-xs">
            <button
              type="button"
              onClick={() => setQuickDate(0)}
              className="px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white/80 transition whitespace-nowrap"
            >
              Hôm nay
            </button>
            <button
              type="button"
              onClick={() => setQuickDate(1)}
              className="px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white/80 transition whitespace-nowrap"
            >
              Ngày mai
            </button>
            <button
              type="button"
              onClick={() => setQuickDate(7)}
              className="px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white/80 transition whitespace-nowrap"
            >
              1 tuần tới
            </button>
          </div>

          {/* Weekday labels */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
            {WEEKDAYS.map((w, idx) => (
              <span
                key={w}
                className={`text-[11px] font-semibold ${
                  idx === 0 ? "text-pink-400" : "text-white/40"
                }`}
              >
                {w}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center mb-3">
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="h-8" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const isSelected =
                tempDay === dayNum &&
                tempMonth === currentMonth &&
                tempYear === currentYear;
              const isPast = isPastDate(dayNum);

              return (
                <button
                  key={`day-${dayNum}`}
                  type="button"
                  disabled={isPast}
                  onClick={() => handleSelectDay(dayNum)}
                  className={`h-8 rounded-lg text-xs font-medium transition flex items-center justify-center cursor-pointer ${
                    isPast
                      ? "text-white/20 cursor-not-allowed"
                      : isSelected
                      ? "text-white font-bold shadow-md scale-105"
                      : "text-white/80 hover:bg-white/15 hover:text-white"
                  }`}
                  style={{
                    background: isSelected
                      ? `linear-gradient(135deg, ${t.primary}, ${t.secondary})`
                      : undefined,
                  }}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>

          {/* Tip Note */}
          <p className="text-[11px] text-white/40 text-center pt-2 border-t border-white/10 italic">
            Thiệp sẽ tự động mở vào đúng 00:00 của ngày được chọn
          </p>
        </div>
      )}
    </div>
  );
}
