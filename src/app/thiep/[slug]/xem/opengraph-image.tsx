import { ImageResponse } from "next/og";
import { getCardBySlug } from "@/lib/db";

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
  let recipientName = "Bạn";
  let title = "🎂 Chúc Mừng Sinh Nhật! ✨";
  let description = "Món quà sinh nhật đặc biệt cùng những phong bì thư yêu thương từ bạn bè!";

  try {
    const card = await getCardBySlug(slug);
    if (card) {
      recipientName = card.recipientName || recipientName;
      if (card.shareTitle?.trim()) {
        title = card.shareTitle.trim();
      } else {
        title = `🎂 Chúc Mừng Sinh Nhật ${recipientName}! ✨`;
      }
      if (card.shareDescription?.trim()) {
        description = card.shareDescription.trim();
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
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#0d0217",
          color: "#ffffff",
          fontFamily: "sans-serif",
          padding: "40px 50px",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "#1c042e",
            border: "4px solid #ffd166",
            borderRadius: "32px",
            padding: "36px 45px",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#ffd166",
                color: "#13021f",
                padding: "8px 24px",
                borderRadius: "50px",
                fontSize: "20px",
                fontWeight: "bold",
                letterSpacing: "1px",
              }}
            >
              🎁 MÓN QUÀ SINH NHẬT BÍ MẬT DÀNH CHO {recipientName.toUpperCase()} 🎁
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#360e4e",
                color: "#ffd166",
                padding: "8px 22px",
                borderRadius: "14px",
                fontSize: "18px",
                fontWeight: "bold",
                border: "1px solid #ffd166",
              }}
            >
              /thiep/{slug}/xem
            </div>
          </div>

          {/* Center */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: "18px",
            }}
          >
            <div
              style={{
                fontSize: "52px",
                fontWeight: "900",
                color: "#ff758f",
                lineHeight: 1.25,
                display: "flex",
                textAlign: "center",
              }}
            >
              {title}
            </div>

            <div
              style={{
                fontSize: "26px",
                color: "#f8f9fa",
                lineHeight: 1.45,
                display: "flex",
                textAlign: "center",
                maxWidth: "920px",
              }}
            >
              {description}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                padding: "10px 28px",
                borderRadius: "20px",
                border: "1px dashed rgba(255, 255, 255, 0.3)",
                color: "#ffd166",
                fontSize: "22px",
                fontWeight: "bold",
              }}
            >
              🔒 Xấp ảnh Polaroid & những bức thư bí mật đang chờ mở
            </div>
          </div>

          {/* Bottom */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              borderTop: "2px solid #3d145a",
              paddingTop: "18px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                color: "#ffd166",
                fontSize: "22px",
                fontWeight: "bold",
              }}
            >
              💌 Khui phong bì thư & thổi nến sinh nhật
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#ff758f",
                color: "#13021f",
                padding: "10px 26px",
                borderRadius: "16px",
                fontSize: "20px",
                fontWeight: "bold",
              }}
            >
              👉 Nhấn vào để mở quà & xem ảnh 📸
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
