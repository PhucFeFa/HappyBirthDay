import { ImageResponse } from "next/og";
import { getCardBySlug } from "@/lib/db";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";
export const alt = "Mở Thiệp Sinh Nhật";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let title = "";
  let heroImage = "";

  // 1. Đọc ảnh bó hoa mặc định từ public
  try {
    const defaultImagePath = path.join(
      process.cwd(),
      "public",
      "anh-bo-hoa-hong-chuc-mung-sinh-nhat.jpg"
    );
    if (fs.existsSync(defaultImagePath)) {
      const fileBuffer = fs.readFileSync(defaultImagePath);
      heroImage = `data:image/jpeg;base64,${fileBuffer.toString("base64")}`;
    }
  } catch (e) {
    console.error("Error reading default birthday flower image:", e);
  }

  // 2. Lấy dữ liệu thiệp nếu có
  try {
    const card = await getCardBySlug(slug);
    if (card) {
      if (card.shareTitle?.trim()) {
        title = card.shareTitle.trim();
      } else if (card.recipientName?.trim()) {
        title = `🎂 Chúc Mừng Sinh Nhật ${card.recipientName}! ✨`;
      }

      if (card.imageUrls && card.imageUrls.length > 0 && card.imageUrls[0]) {
        heroImage = card.imageUrls[0];
      } else if (card.imageUrl) {
        heroImage = card.imageUrl;
      }
    }
  } catch (e) {
    console.error("Error fetching card for OG image:", e);
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#000000",
          overflow: "hidden",
        }}
      >
        {/* Chỉ hiển thị mỗi hình ảnh full trọn vẹn */}
        {heroImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={heroImage}
            alt={title || "Mở Thiệp Sinh Nhật"}
            style={{
              width: "1200px",
              height: "630px",
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "#1f0633",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "48px",
              color: "#ffd166",
              fontWeight: "bold",
            }}
          >
            🎂 Mở Thiệp Sinh Nhật! 🎂
          </div>
        )}

        {/* Thanh tiêu đề chia sẻ tinh tế đè lên phía dưới ảnh nếu có tiêu đề */}
        {title ? (
          <div
            style={{
              position: "absolute",
              bottom: "24px",
              left: "30px",
              right: "30px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "rgba(10, 5, 22, 0.82)",
              padding: "16px 28px",
              borderRadius: "20px",
              border: "2px solid rgba(255, 255, 255, 0.25)",
            }}
          >
            <div
              style={{
                fontSize: "30px",
                fontWeight: "bold",
                color: "#ffffff",
                display: "flex",
                maxWidth: "820px",
                overflow: "hidden",
              }}
            >
              {title}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#ffd166",
                color: "#1f0633",
                padding: "8px 20px",
                borderRadius: "12px",
                fontSize: "18px",
                fontWeight: "bold",
              }}
            >
              /thiep/{slug}/xem
            </div>
          </div>
        ) : null}
      </div>
    ),
    {
      ...size,
    }
  );
}
