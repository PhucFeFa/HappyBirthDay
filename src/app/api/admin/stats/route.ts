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
  } catch (e) {
    console.error("Admin stats error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
