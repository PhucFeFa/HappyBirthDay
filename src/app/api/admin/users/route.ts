import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getAllUserSummaries } from "@/lib/admin-db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;

  try {
    const users = await getAllUserSummaries();
    return NextResponse.json({ users });
  } catch (e) {
    console.error("Admin users GET error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
