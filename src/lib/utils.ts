import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const VN_TZ = "Asia/Ho_Chi_Minh";

/** Tạo slug ngắn 8 ký tự cho URL công khai */
export function generateSlug(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let slug = "";
  for (let i = 0; i < 8; i++) {
    slug += chars[Math.floor(Math.random() * chars.length)];
  }
  return slug;
}

/**
 * Chuẩn hóa chuỗi văn bản thành slug URL an toàn và đẹp mắt
 * Ví dụ: "Chúc Mừng Sinh Nhật Phương Anh 2026!" -> "chuc-mung-sinh-nhat-phuong-anh-2026"
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Xóa dấu tiếng Việt
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9\s-]/g, "") // Xóa ký tự đặc biệt
    .trim()
    .replace(/\s+/g, "-") // Thay khoảng trắng bằng -
    .replace(/-+/g, "-") // Xóa nhiều dấu - liên tiếp
    .replace(/^-+|-+$/g, "") // Xóa - ở đầu và cuối
    .slice(0, 50); // Tối đa 50 ký tự
}

/** Tạo UUID làm creator token bí mật */
export function generateToken(): string {
  return uuidv4();
}

/**
 * Convert chuỗi datetime từ giờ VN sang UTC timestamp (ms)
 * @param vnDateTimeStr - "2024-12-25T18:00" (local VN time)
 */
export function vnDateTimeToUTC(vnDateTimeStr: string): Date {
  const dt = dayjs.tz(vnDateTimeStr, VN_TZ);
  return dt.toDate();
}

/** Format UTC date thành chuỗi giờ VN dễ đọc */
export function formatRevealTime(utcDate: Date): string {
  return dayjs(utcDate).tz(VN_TZ).format("HH:mm DD/MM/YYYY");
}

/** 
 * Tính khoảng cách (ms) từ thời điểm hiện tại đến revealAt có bù trừ độ lệch server
 * @param revealAt - Timestamp UTC (ms) mở thiệp
 * @param serverTimeOffset - Độ lệch giữa serverTime và clientTime lúc fetch (serverTime - initialClientTime)
 */
export function getRemainingCountdownMs(
  revealAt: number,
  serverTimeOffset: number
): number {
  const currentEstimatedServerTime = Date.now() + serverTimeOffset;
  return Math.max(0, revealAt - currentEstimatedServerTime);
}

/** Legacy helper */
export function getCountdownMs(
  revealAt: number,
  serverTime: number,
  clientTime: number = Date.now()
): number {
  const offset = serverTime - clientTime;
  return getRemainingCountdownMs(revealAt, offset);
}

export const THEMES = {
  pink: {
    label: "Hồng đào",
    primary: "#ff6b9d",
    secondary: "#ff8fab",
    bg: "from-rose-950 via-pink-900 to-rose-950",
    accent: "#ffd6e7",
    glow: "shadow-pink-500/50",
    card: "bg-pink-950/40 border-pink-500/30",
  },
  purple: {
    label: "Tím huyền",
    primary: "#a855f7",
    secondary: "#c084fc",
    bg: "from-violet-950 via-purple-900 to-violet-950",
    accent: "#e9d5ff",
    glow: "shadow-purple-500/50",
    card: "bg-purple-950/40 border-purple-500/30",
  },
  blue: {
    label: "Xanh dương",
    primary: "#3b82f6",
    secondary: "#60a5fa",
    bg: "from-blue-950 via-blue-900 to-slate-950",
    accent: "#bfdbfe",
    glow: "shadow-blue-500/50",
    card: "bg-blue-950/40 border-blue-500/30",
  },
  gold: {
    label: "Vàng sang",
    primary: "#f59e0b",
    secondary: "#fbbf24",
    bg: "from-amber-950 via-yellow-900 to-amber-950",
    accent: "#fde68a",
    glow: "shadow-amber-500/50",
    card: "bg-amber-950/40 border-amber-500/30",
  },
  green: {
    label: "Xanh lá",
    primary: "#10b981",
    secondary: "#34d399",
    bg: "from-emerald-950 via-green-900 to-emerald-950",
    accent: "#a7f3d0",
    glow: "shadow-emerald-500/50",
    card: "bg-emerald-950/40 border-emerald-500/30",
  },
} as const;

export type ThemeKey = keyof typeof THEMES;

export type CelebrationEffectKey = "flowers" | "confetti" | "sparkles" | "balloons";

export const CELEBRATION_EFFECTS: Record<
  CelebrationEffectKey,
  {
    label: string;
    icon: string;
    description: string;
  }
> = {
  flowers: {
    label: "Hoa nở rộ",
    icon: "🌸",
    description: "Đóa hoa bung nở từ giữa tỏa ra và xoay nhẹ nhàng 2 bên bánh kem",
  },
  confetti: {
    label: "Pháo hoa giấy",
    icon: "🎊",
    description: "Pháo giấy kim tuyến bùng nổ rực rỡ ngập tràn sắc màu",
  },
  sparkles: {
    label: "Bụi sao phép màu",
    icon: "✨",
    description: "Ánh sao lấp lánh tỏa sáng lung linh diệu kỳ",
  },
  balloons: {
    label: "Bóng bay bay bổng",
    icon: "🎈",
    description: "Những quả bóng bay ngọt ngào bay lên khắp màn hình",
  },
};
