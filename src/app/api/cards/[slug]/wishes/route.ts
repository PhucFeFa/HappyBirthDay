import { NextRequest, NextResponse } from "next/server";
import { getCardBySlug, addWish, getWishesByCardId } from "@/lib/db";

// Rate limiting simple: track submissions per IP in-memory
// (For production, use Redis or Upstash)
const submissionTracker = new Map<string, number[]>();
const MAX_WISHES_PER_IP = 3;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const submissions = submissionTracker.get(ip) ?? [];
  const recent = submissions.filter((t) => now - t < WINDOW_MS);
  submissionTracker.set(ip, recent);
  if (recent.length >= MAX_WISHES_PER_IP) return false;
  recent.push(now);
  submissionTracker.set(ip, recent);
  return true;
}

// POST — Gửi lời chúc
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Bạn đã gửi quá nhiều lời chúc. Vui lòng thử lại sau." },
        { status: 429 }
      );
    }

    const card = await getCardBySlug(slug);
    if (!card) {
      return NextResponse.json({ error: "Không tìm thấy thiệp" }, { status: 404 });
    }

    const body = await request.json();
    const { authorName, message, isAnonymous } = body;

    if (!message?.trim()) {
      return NextResponse.json(
        { error: "Vui lòng nhập lời chúc" },
        { status: 400 }
      );
    }

    const finalAuthorName = isAnonymous || !authorName?.trim()
      ? "Người gửi bí mật 🕶️"
      : authorName.trim();

    if (finalAuthorName.length > 100 || message.length > 1000) {
      return NextResponse.json(
        { error: "Tên hoặc lời chúc quá dài" },
        { status: 400 }
      );
    }

    const wish = await addWish({
      cardId: card.id,
      authorName: finalAuthorName,
      message: message.trim(),
    });

    return NextResponse.json({ success: true, wishId: wish.id });
  } catch (error) {
    console.error("Error adding wish:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

// GET — Lấy danh sách lời chúc (chỉ khi đã tới giờ reveal VÀ có creator token)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const url = new URL(request.url);
    const providedKey = url.searchParams.get("key");
    const providedUserId = url.searchParams.get("userId");

    const card = await getCardBySlug(slug);
    if (!card) {
      return NextResponse.json({ error: "Không tìm thấy thiệp" }, { status: 404 });
    }

    const serverTime = Date.now();
    // Cho phép sai số 3s tránh lệch mili-giây khi client countdown vừa kết thúc
    const isRevealed = (serverTime + 3000) >= card.revealAt.getTime();

    const isCreator =
      (Boolean(card.creatorToken) && providedKey === card.creatorToken) ||
      (Boolean(card.userId) && Boolean(providedUserId) && providedUserId === card.userId);

    // Bảo mật: chỉ trả wishes khi ĐÃ tới giờ reveal
    if (!isRevealed) {
      return NextResponse.json(
        { error: "Chưa tới giờ mở thiệp" },
        { status: 403 }
      );
    }

    // Chỉ creator mới lấy được danh sách đầy đủ
    if (!isCreator) {
      return NextResponse.json(
        { error: "Bạn không có quyền xem lời chúc này" },
        { status: 403 }
      );
    }

    const wishes = await getWishesByCardId(card.id);

    return NextResponse.json({
      success: true,
      wishes: wishes.map((w) => ({
        id: w.id,
        authorName: w.authorName,
        message: w.message,
        createdAt: w.createdAt.toISOString(),
      })),
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error getting wishes:", err?.message || error);
    return NextResponse.json(
      { error: err?.message ? `Lỗi server: ${err.message}` : "Lỗi server" },
      { status: 500 }
    );
  }
}
