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
    console.error("Error generating OG image:", e);
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
          padding: "45px 55px",
        }}
      >
        {/* Outer Frame Box */}
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "#1f0633",
            border: "4px solid #ffd166",
            borderRadius: "32px",
            padding: "40px 50px",
          }}
        >
          {/* Top Header Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#ffd166",
              color: "#1f0633",
              padding: "10px 32px",
              borderRadius: "50px",
              fontSize: "22px",
              fontWeight: "bold",
              letterSpacing: "1px",
            }}
          >
            🎁 MÓN QUÀ SINH NHẬT DÀNH CHO {recipientName.toUpperCase()} 🎁
          </div>

          {/* Main Title & Message */}
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
                lineHeight: 1.2,
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
                lineHeight: 1.4,
                display: "flex",
                textAlign: "center",
                maxWidth: "920px",
              }}
            >
              {description}
            </div>
          </div>

          {/* Bottom Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              borderTop: "2px solid #3d145a",
              paddingTop: "20px",
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
              💌 Khui phong bì & thổi nến sinh nhật
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#ffd166",
                color: "#0d0217",
                padding: "8px 24px",
                borderRadius: "16px",
                fontSize: "22px",
                fontWeight: "bold",
              }}
            >
              /thiep/{slug}/xem
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
