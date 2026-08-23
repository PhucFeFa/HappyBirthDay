/**
 * Security & Anti-Abuse Utility Module
 * Chống SQL/NoSQL Injection, XSS, DDoS/Spam Flooding, Parameter Tampering
 */

// ─── 1. RATE LIMITER (In-Memory Sliding Window) ──────────────────────────────
interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Dọn dẹp bản ghi cũ định kỳ mỗi 5 phút để tránh rò rỉ bộ nhớ
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      record.timestamps = record.timestamps.filter((t) => now - t < 3600_000);
      if (record.timestamps.length === 0) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * Kiểm tra giới hạn tần suất request (Rate Limit) theo IP & hành động
 * @param ip Địa chỉ IP người dùng
 * @param action Tên hành động (vd: "create-card", "add-wish", "get-status")
 * @param maxRequests Số request tối đa cho phép trong khung thời gian
 * @param windowMs Khung thời gian tính bằng mili-giây (mặc định 60s)
 */
export function checkRateLimit(
  ip: string,
  action: string,
  maxRequests = 15,
  windowMs = 60 * 1000
): { allowed: boolean; remaining: number; retryAfterSeconds: number } {
  const now = Date.now();
  const key = `${ip}:${action}`;
  const record = rateLimitStore.get(key) || { timestamps: [] };

  // Lọc các request trong khung thời gian
  record.timestamps = record.timestamps.filter((t) => now - t < windowMs);

  if (record.timestamps.length >= maxRequests) {
    const oldest = record.timestamps[0];
    const retryAfter = Math.ceil((windowMs - (now - oldest)) / 1000);
    return { allowed: false, remaining: 0, retryAfterSeconds: Math.max(1, retryAfter) };
  }

  record.timestamps.push(now);
  rateLimitStore.set(key, record);

  return {
    allowed: true,
    remaining: maxRequests - record.timestamps.length,
    retryAfterSeconds: 0,
  };
}

/**
 * Trích xuất an toàn địa chỉ IP từ request headers
 */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}

// ─── 2. INPUT SANITIZATION & ANTI-XSS ────────────────────────────────────────

/**
 * Làm sạch chuỗi văn bản, loại bỏ thẻ HTML độc hại và kiểm soát độ dài
 */
export function sanitizeString(
  input: unknown,
  maxLength = 500,
  allowNewlines = false
): string {
  if (typeof input !== "string") {
    return "";
  }

  let text = input.trim();

  // Loại bỏ các ký tự điều khiển ASCII ngoại trừ newline nếu được phép
  if (allowNewlines) {
    text = text.replace(/[\x00-\x09\x0B-\x1F\x7F]/g, "");
  } else {
    text = text.replace(/[\x00-\x1F\x7F]/g, " ");
  }

  // Escape các ký tự HTML nguy hiểm để ngăn chặn hoàn toàn XSS
  text = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");

  // Giới hạn độ dài tối đa
  if (text.length > maxLength) {
    text = text.slice(0, maxLength);
  }

  return text;
}

/**
 * Validate và làm sạch URL ảnh (Chặn javascript:, data:text/html, vbscript:, file:...)
 */
export function sanitizeImageUrl(url: unknown): string | null {
  if (typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // Cho phép Base64 image chuẩn an toàn
  if (trimmed.startsWith("data:image/")) {
    const validImageTypes = ["data:image/jpeg;", "data:image/png;", "data:image/webp;", "data:image/gif;"];
    const isValidBase64Image = validImageTypes.some((prefix) => trimmed.startsWith(prefix));
    if (isValidBase64Image && trimmed.includes(";base64,")) {
      return trimmed; // An toàn
    }
    return null;
  }

  // Cho phép http/https hợp lệ
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
  } catch {
    return null;
  }

  return null;
}

/**
 * Kiểm tra định dạng Slug URL hợp lệ (Chống NoSQL Injection & Directory Traversal)
 * Chỉ chấp nhận ký tự a-z, 0-9 và dấu gạch ngang '-', độ dài 3 - 50 ký tự
 */
export function isValidSlug(slug: unknown): boolean {
  if (typeof slug !== "string") return false;
  const regex = /^[a-z0-9-]{3,50}$/;
  return regex.test(slug);
}
