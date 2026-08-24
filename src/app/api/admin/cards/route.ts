import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getAllCards } from "@/lib/admin-db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;

  try {
    const { searchParams } = request.nextUrl;
    const search = searchParams.get("search") ?? undefined;
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "20");

    const result = await getAllCards({ search, page, limit });
    return NextResponse.json(result);
  } catch (e) {
    console.error("Admin cards GET error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
