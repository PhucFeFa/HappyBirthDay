import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getAdminStats } from "@/lib/admin-db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;

  try {
    const stats = await getAdminStats();
    return NextResponse.json(stats);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[Admin Stats API Error]:", message);
    return NextResponse.json({ error: `Lỗi truy vấn dữ liệu: ${message}` }, { status: 500 });
  }
}
