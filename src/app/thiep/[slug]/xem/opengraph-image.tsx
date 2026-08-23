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
          justifyContent: "center",
          background: "linear-gradient(135deg, #180026 0%, #050508 50%, #29081e 100%)",
          color: "white",
          fontFamily: "sans-serif",
          padding: "50px 70px",
          position: "relative",
        }}
      >
        {/* Glow Circles */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            left: "-100px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "rgba(247, 37, 133, 0.3)",
            filter: "blur(90px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            right: "-100px",
            width: "450px",
            height: "450px",
            borderRadius: "50%",
            background: "rgba(114, 9, 183, 0.3)",
            filter: "blur(90px)",
          }}
        />

        {/* Card Box Frame */}
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            border: "2px solid rgba(255, 255, 255, 0.15)",
            borderRadius: "28px",
            padding: "45px 50px",
            background: "rgba(255, 255, 255, 0.04)",
            boxShadow: "0 25px 50px rgba(0, 0, 0, 0.5)",
          }}
        >
          {/* Header Tag */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              background: "rgba(255, 255, 255, 0.1)",
              padding: "10px 24px",
              borderRadius: "50px",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            <span style={{ fontSize: "24px" }}>🎁</span>
            <span
              style={{
                fontSize: "20px",
                fontWeight: 600,
                color: "#ffd166",
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              Món Quà Sinh Nhật Dành Cho {recipientName}
            </span>
          </div>

          {/* Main Title Content */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: "16px",
              maxWidth: "950px",
            }}
          >
            <div
              style={{
                fontSize: "52px",
                fontWeight: 800,
                lineHeight: 1.25,
                background: "linear-gradient(90deg, #ffd166, #ff758f, #f72585, #c77dff)",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              {title}
            </div>

            <div
              style={{
                fontSize: "24px",
                color: "rgba(255, 255, 255, 0.8)",
                lineHeight: 1.4,
              }}
            >
              {description}
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
              paddingTop: "20px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "20px" }}>💌</span>
              <span style={{ fontSize: "18px", color: "rgba(255, 255, 255, 0.6)" }}>
                Khui phong bì & thổi nến sinh nhật
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "rgba(255, 209, 102, 0.2)",
                padding: "8px 20px",
                borderRadius: "12px",
                border: "1px solid rgba(255, 209, 102, 0.4)",
                color: "#ffd166",
                fontWeight: 700,
                fontSize: "18px",
                fontFamily: "monospace",
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
