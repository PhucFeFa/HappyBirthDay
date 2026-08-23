import { NextRequest, NextResponse } from "next/server";
import { getCardBySlug } from "@/lib/db";
import { isValidSlug } from "@/lib/security";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!isValidSlug(slug)) {
      return NextResponse.json({ error: "Đường dẫn không hợp lệ" }, { status: 400 });
    }

    const card = await getCardBySlug(slug);

    if (!card) {
      return NextResponse.json({ error: "Không tìm thấy thiệp" }, { status: 404 });
    }

    const serverTime = Date.now();
    const revealAt = card.revealAt.getTime();
    const isRevealed = serverTime >= revealAt;

    // Verify creator: check creator token OR userId
    const url = new URL(request.url);
    const providedKey = url.searchParams.get("key");
    const providedUserId = url.searchParams.get("userId");

    const isCreator =
      (Boolean(card.creatorToken) && providedKey === card.creatorToken) ||
      (Boolean(card.userId) && Boolean(providedUserId) && providedUserId === card.userId);

    return NextResponse.json({
      isRevealed,
      serverTime,
      revealAt,
      wishCount: card.wishCount,
      recipientName: card.recipientName,
      theme: card.theme,
      description: card.description || null,
      imageUrl: card.imageUrl || null,
      imageUrls: card.imageUrls || (card.imageUrl ? [card.imageUrl] : []),
      isCreator,
      ownerUserId: card.userId || null,
      celebrationEffect: card.celebrationEffect ?? "flowers",
    });
  } catch (error) {
    console.error("Error getting status:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
