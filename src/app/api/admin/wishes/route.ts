import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getWishesForCard, deleteWish } from "@/lib/admin-db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;

  try {
    const cardId = request.nextUrl.searchParams.get("cardId");
    if (!cardId) return NextResponse.json({ error: "cardId required" }, { status: 400 });

    const wishes = await getWishesForCard(cardId);
    return NextResponse.json({ wishes });
  } catch (e) {
    console.error("Admin wishes GET error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;

  try {
    const wishId = request.nextUrl.searchParams.get("id");
    if (!wishId) return NextResponse.json({ error: "id required" }, { status: 400 });

    await deleteWish(wishId);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Admin wish DELETE error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
