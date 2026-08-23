import { NextRequest, NextResponse } from "next/server";
import { getCardBySlug, addWish, getWishesByCardId } from "@/lib/db";
import { checkRateLimit, getClientIp, sanitizeString, isValidSlug } from "@/lib/security";

// POST — Gửi lời chúc (Được bảo vệ chống Spam / DDoS / XSS)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // 1. Kiểm tra tính hợp lệ của Slug chống NoSQL Injection
    if (!isValidSlug(slug)) {
      return NextResponse.json({ error: "Đường dẫn không hợp lệ" }, { status: 400 });
    }

    const ip = getClientIp(request.headers);

    // 2. Rate Limiting: Tối đa 15 lời chúc / phút trên mỗi IP
    const rateCheck = checkRateLimit(ip, `wish:${slug}`, 15, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Bạn đang gửi lời chúc quá nhanh. Vui lòng đợi ${rateCheck.retryAfterSeconds} giây nữa.` },
        { status: 429, headers: { "Retry-After": String(rateCheck.retryAfterSeconds) } }
      );
    }

    const card = await getCardBySlug(slug);
    if (!card) {
      return NextResponse.json({ error: "Không tìm thấy thiệp" }, { status: 404 });
    }

    const body = await request.json();
    const { authorName: rawAuthorName, message: rawMessage, isAnonymous } = body;

    // 3. Làm sạch & Validate input chống XSS
    const sanitizedMessage = sanitizeString(rawMessage, 1000, true);
    if (!sanitizedMessage) {
      return NextResponse.json(
        { error: "Vui lòng nhập nội dung lời chúc" },
        { status: 400 }
      );
    }

    const rawAuthor = isAnonymous || !rawAuthorName?.trim()
      ? "Người gửi bí mật 🕶️"
      : rawAuthorName;
    const finalAuthorName = sanitizeString(rawAuthor, 80);

    const wish = await addWish({
      cardId: card.id,
      authorName: finalAuthorName,
      message: sanitizedMessage,
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
