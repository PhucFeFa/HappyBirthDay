/**
 * Middleware helper: Validate admin token from request header
 * Used by all /api/admin/* routes
 */
import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase-admin";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "";

export async function requireAdmin(
  request: NextRequest
): Promise<{ error: NextResponse } | { uid: string; email: string }> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const token = authHeader.slice(7);
  try {
    const adminAuth = getAdminAuth();
    const decoded = await adminAuth.verifyIdToken(token);

    if (!decoded.email || decoded.email !== ADMIN_EMAIL) {
      return {
        error: NextResponse.json({ error: "Forbidden: Not admin" }, { status: 403 }),
      };
    }

    return { uid: decoded.uid, email: decoded.email };
  } catch {
    return {
      error: NextResponse.json({ error: "Invalid or expired token" }, { status: 401 }),
    };
  }
}
