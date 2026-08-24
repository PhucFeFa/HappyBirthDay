import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getAdminCardById, deleteCardWithWishes, getWishesForCard } from "@/lib/admin-db";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;

  try {
    const { id } = await params;
    const card = await getAdminCardById(id);
    if (!card) return NextResponse.json({ error: "Card not found" }, { status: 404 });

    const wishes = await getWishesForCard(id);
    return NextResponse.json({ card, wishes });
  } catch (e) {
    console.error("Admin card GET error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;

  try {
    const { id } = await params;
    await deleteCardWithWishes(id);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Admin card DELETE error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
