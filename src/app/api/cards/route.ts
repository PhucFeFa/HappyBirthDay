import { NextRequest, NextResponse } from "next/server";
import { createCard, getCardBySlug } from "@/lib/db";
import { generateSlug, generateToken, vnDateTimeToUTC, slugify } from "@/lib/utils";
import type { ThemeKey, CelebrationEffectKey } from "@/lib/utils";
import { checkRateLimit, getClientIp, sanitizeString, sanitizeImageUrl, isValidSlug } from "@/lib/security";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers);

    // 1. Rate Limiting DDoS / Spam Flooding: Tối đa 10 thiệp / phút trên mỗi IP
    const rateCheck = checkRateLimit(ip, "create-card", 10, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Bạn đang tạo thiệp quá nhanh. Vui lòng đợi ${rateCheck.retryAfterSeconds} giây nữa.` },
        { status: 429, headers: { "Retry-After": String(rateCheck.retryAfterSeconds) } }
      );
    }

    const body = await request.json();
    const {
      recipientName: rawRecipientName,
      revealAt: revealAtStr,
      theme,
      description: rawDescription,
      imageUrl: rawImageUrl,
      imageUrls: rawImageUrls,
      userId,
      creatorEmail,
      celebrationEffect,
      customSlug: rawCustomSlug,
      shareTitle: rawShareTitle,
      shareDescription: rawShareDescription,
    } = body;

    // 2. Làm sạch & Validate Input chống XSS / Injection
    const recipientName = sanitizeString(rawRecipientName, 80);
    const description = rawDescription ? sanitizeString(rawDescription, 500, true) : undefined;
    const shareTitle = rawShareTitle ? sanitizeString(rawShareTitle, 80) : undefined;
    const shareDescription = rawShareDescription ? sanitizeString(rawShareDescription, 150) : undefined;

    if (!recipientName || !revealAtStr) {
      return NextResponse.json(
        { error: "Vui lòng điền đầy đủ tên người nhận và thời gian mở thiệp" },
        { status: 400 }
      );
    }

    // Convert giờ VN sang UTC
    const revealAt = vnDateTimeToUTC(revealAtStr);

    // Validate giờ mở phải trong tương lai
    if (revealAt.getTime() <= Date.now()) {
      return NextResponse.json(
        { error: "Thời gian mở thiệp phải trong tương lai" },
        { status: 400 }
      );
    }

    // 3. Xử lý và kiểm tra Custom Slug an toàn
    let slug: string;
    if (rawCustomSlug && typeof rawCustomSlug === "string" && rawCustomSlug.trim()) {
      const normalized = slugify(rawCustomSlug);
      if (!isValidSlug(normalized)) {
        return NextResponse.json(
          { error: "Đường dẫn tùy chỉnh chỉ được chứa chữ cái, số và dấu gạch ngang (3-50 ký tự)" },
          { status: 400 }
        );
      }

      // Kiểm tra xem slug này đã tồn tại chưa
      const existing = await getCardBySlug(normalized);
      if (existing) {
        return NextResponse.json(
          { error: `Đường dẫn "/thiep/${normalized}" đã có người sử dụng. Vui lòng chọn tên khác nhé!` },
          { status: 409 }
        );
      }
      slug = normalized;
    } else {
      slug = generateSlug();
    }

    // 4. Làm sạch danh sách ảnh chống URL độc hại (javascript:, data:text/html...)
    const safeImageUrl = rawImageUrl ? sanitizeImageUrl(rawImageUrl) : undefined;
    let safeImageUrls: string[] | undefined = undefined;
    if (Array.isArray(rawImageUrls)) {
      safeImageUrls = rawImageUrls
        .map((img) => sanitizeImageUrl(img))
        .filter((img): img is string => Boolean(img))
        .slice(0, 6);
    }

    const creatorToken = generateToken();

    const card = await createCard({
      slug,
      creatorToken,
      recipientName,
      revealAt,
      theme: (theme as ThemeKey) ?? "pink",
      description,
      imageUrl: safeImageUrl || (safeImageUrls && safeImageUrls[0]) || undefined,
      imageUrls: safeImageUrls && safeImageUrls.length > 0 ? safeImageUrls : undefined,
      userId: typeof userId === "string" ? sanitizeString(userId, 100) : undefined,
      creatorEmail: typeof creatorEmail === "string" ? sanitizeString(creatorEmail, 100) : undefined,
      celebrationEffect: (celebrationEffect as CelebrationEffectKey) ?? "flowers",
      shareTitle,
      shareDescription,
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? request.nextUrl.origin;

    return NextResponse.json({
      success: true,
      cardId: card.id,
      slug,
      shareLink: `${baseUrl}/thiep/${slug}`,
      creatorLink: `${baseUrl}/thiep/${slug}/xem?key=${creatorToken}`,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error creating card:", err?.message || error);
    return NextResponse.json(
      { error: err?.message ? `Lỗi server: ${err.message}` : "Lỗi server" },
      { status: 500 }
    );
  }
}
