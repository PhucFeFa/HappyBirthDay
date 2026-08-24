/**
 * Middleware helper: Validate admin token from request header
 * Used by all /api/admin/* routes
 */
import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase-admin";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL || "phuclh.ce191132@gmail.com").toLowerCase().trim();

export async function requireAdmin(
  request: NextRequest
): Promise<{ error: NextResponse } | { uid: string; email: string }> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return {
      error: NextResponse.json({ error: "Chưa đăng nhập (Thiếu token xác thực)" }, { status: 401 }),
    };
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return {
      error: NextResponse.json({ error: "Token xác thực rỗng" }, { status: 401 }),
    };
  }

  try {
    const adminAuth = getAdminAuth();
    const decoded = await adminAuth.verifyIdToken(token);

    const userEmail = (decoded.email || "").toLowerCase().trim();

    if (!userEmail || userEmail !== ADMIN_EMAIL) {
      console.warn(`[requireAdmin] Access denied for email: ${userEmail}. Expected: ${ADMIN_EMAIL}`);
      return {
        error: NextResponse.json({ error: `Tài khoản ${userEmail || "ẩn danh"} không có quyền quản trị viên.` }, { status: 403 }),
      };
    }

    return { uid: decoded.uid, email: userEmail };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[requireAdmin] Token verification failed:", message);
    return {
      error: NextResponse.json({ error: `Xác thực thất bại: ${message}` }, { status: 401 }),
    };
  }
}
