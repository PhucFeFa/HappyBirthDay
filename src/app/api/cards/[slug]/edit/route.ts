import { NextRequest, NextResponse } from "next/server";
import { getCardBySlug, updateCard } from "@/lib/db";
import { vnDateTimeToUTC } from "@/lib/utils";
import type { ThemeKey, CelebrationEffectKey } from "@/lib/utils";
import { checkRateLimit, getClientIp, sanitizeString, sanitizeImageUrl, isValidSlug } from "@/lib/security";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!isValidSlug(slug)) {
      return NextResponse.json({ error: "Đường dẫn không hợp lệ" }, { status: 400 });
    }

    const ip = getClientIp(request.headers);
    const rateCheck = checkRateLimit(ip, `edit:${slug}`, 20, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Bạn đang thao tác quá nhanh. Vui lòng thử lại sau." },
        { status: 429 }
      );
    }

    const card = await getCardBySlug(slug);
    if (!card) {
      return NextResponse.json({ error: "Không tìm thấy thiệp" }, { status: 404 });
    }

    const body = await request.json();
    const {
      key: providedKey,
      userId: providedUserId,
      recipientName: rawRecipientName,
      revealAt: revealAtStr,
      theme,
      description: rawDescription,
      imageUrl: rawImageUrl,
      imageUrls: rawImageUrls,
      celebrationEffect,
      shareTitle: rawShareTitle,
      shareDescription: rawShareDescription,
    } = body;

    // 1. Xác thực quyền chủ sở hữu
    const isOwner =
      (Boolean(card.creatorToken) && providedKey === card.creatorToken) ||
      (Boolean(card.userId) && Boolean(providedUserId) && providedUserId === card.userId);

    if (!isOwner) {
      return NextResponse.json(
        { error: "Bạn không có quyền chỉnh sửa thiệp này" },
        { status: 403 }
      );
    }

    // 2. Kiểm tra điều kiện: CHỈ ĐƯỢC CHỈNH SỬA KHI CHƯA TỚI NGÀY MỞ THIỆP
    const serverTime = Date.now();
    if (serverTime >= card.revealAt.getTime()) {
      return NextResponse.json(
        { error: "Thiệp đã tới ngày mở quà và đã được công khai, không thể chỉnh sửa nữa!" },
        { status: 400 }
      );
    }

    // 3. Validate & Sanitize Dữ liệu mới
    const updates: Parameters<typeof updateCard>[1] = {};

    if (rawRecipientName !== undefined) {
      const sanitizedName = sanitizeString(rawRecipientName, 80);
      if (!sanitizedName) {
        return NextResponse.json({ error: "Tên người nhận không được để trống" }, { status: 400 });
      }
      updates.recipientName = sanitizedName;
    }

    if (revealAtStr) {
      const newRevealAt = vnDateTimeToUTC(revealAtStr);
      if (newRevealAt.getTime() <= Date.now()) {
        return NextResponse.json(
          { error: "Thời gian mở thiệp mới phải ở trong tương lai" },
          { status: 400 }
        );
      }
      updates.revealAt = newRevealAt;
    }

    if (theme) {
      updates.theme = theme as ThemeKey;
    }

    if (celebrationEffect) {
      updates.celebrationEffect = celebrationEffect as CelebrationEffectKey;
    }

    if (rawDescription !== undefined) {
      updates.description = sanitizeString(rawDescription, 500, true);
    }

    if (rawShareTitle !== undefined) {
      updates.shareTitle = sanitizeString(rawShareTitle, 80);
    }

    if (rawShareDescription !== undefined) {
      updates.shareDescription = sanitizeString(rawShareDescription, 150);
    }

    if (rawImageUrls !== undefined && Array.isArray(rawImageUrls)) {
      const safeImages = rawImageUrls
        .map((img) => sanitizeImageUrl(img))
        .filter((img): img is string => Boolean(img))
        .slice(0, 6);
      updates.imageUrls = safeImages;
      updates.imageUrl = safeImages[0] || undefined;
    } else if (rawImageUrl !== undefined) {
      updates.imageUrl = sanitizeImageUrl(rawImageUrl) || undefined;
    }

    await updateCard(card.id, updates);

    return NextResponse.json({
      success: true,
      message: "Cập nhật thông tin thiệp thành công!",
    });
  } catch (error) {
    console.error("Error editing card:", error);
    return NextResponse.json({ error: "Lỗi khi cập nhật thiệp" }, { status: 500 });
  }
}
