import { NextRequest, NextResponse } from "next/server";
import { getCardsByUserId } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Thiếu userId" }, { status: 400 });
    }

    const cards = await getCardsByUserId(userId);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? request.nextUrl.origin;
    const now = Date.now();

    const result = cards.map((c) => ({
      id: c.id,
      slug: c.slug,
      recipientName: c.recipientName,
      revealAt: c.revealAt.toISOString(),
      theme: c.theme,
      wishCount: c.wishCount,
      createdAt: c.createdAt.toISOString(),
      isRevealed: now >= c.revealAt.getTime(),
      shareLink: `${baseUrl}/thiep/${c.slug}`,
      viewLink: `${baseUrl}/thiep/${c.slug}/xem?key=${c.creatorToken}`,
    }));

    return NextResponse.json({ success: true, cards: result });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error getting user cards:", err);
    return NextResponse.json(
      { error: err?.message || "Lỗi server" },
      { status: 500 }
    );
  }
}
