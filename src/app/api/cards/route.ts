import { NextRequest, NextResponse } from "next/server";
import { createCard, getCardBySlug } from "@/lib/db";
import { generateSlug, generateToken, vnDateTimeToUTC, slugify } from "@/lib/utils";
import type { ThemeKey, CelebrationEffectKey } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      recipientName,
      revealAt: revealAtStr,
      theme,
      description,
      imageUrl,
      imageUrls,
      userId,
      creatorEmail,
      celebrationEffect,
      customSlug,
      shareTitle,
      shareDescription,
    } = body;

    if (!recipientName || !revealAtStr) {
      return NextResponse.json(
        { error: "Vui lòng điền đầy đủ tên và thời gian mở thiệp" },
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

    let slug: string;
    if (customSlug && typeof customSlug === "string" && customSlug.trim()) {
      const normalized = slugify(customSlug);
      if (normalized.length < 3) {
        return NextResponse.json(
          { error: "Đường dẫn tùy chỉnh phải có ít nhất 3 ký tự hợp lệ" },
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

    const creatorToken = generateToken();

    const card = await createCard({
      slug,
      creatorToken,
      recipientName: recipientName.trim(),
      revealAt,
      theme: (theme as ThemeKey) ?? "pink",
      description: description || undefined,
      imageUrl: imageUrl || (imageUrls && imageUrls[0]) || undefined,
      imageUrls: Array.isArray(imageUrls) && imageUrls.length > 0 ? imageUrls : (imageUrl ? [imageUrl] : undefined),
      userId: userId || undefined,
      creatorEmail: creatorEmail || undefined,
      celebrationEffect: (celebrationEffect as CelebrationEffectKey) ?? "flowers",
      shareTitle: shareTitle?.trim() || undefined,
      shareDescription: shareDescription?.trim() || undefined,
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
