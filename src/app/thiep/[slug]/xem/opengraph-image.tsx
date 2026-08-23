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
  let heroImage: string | null = null;

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

      if (card.imageUrls && card.imageUrls.length > 0) {
        heroImage = card.imageUrls[0];
      } else if (card.imageUrl) {
        heroImage = card.imageUrl;
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
          padding: "36px 44px",
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
            borderRadius: "28px",
            padding: "30px 38px",
          }}
        >
          {/* Top Header Badge */}
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
                color: "#1f0633",
                padding: "8px 24px",
                borderRadius: "50px",
                fontSize: "18px",
                fontWeight: "bold",
                letterSpacing: "1px",
              }}
            >
              🎁 MÓN QUÀ SINH NHẬT DÀNH CHO {recipientName.toUpperCase()} 🎁
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#3b1054",
                color: "#ffd166",
                padding: "8px 20px",
                borderRadius: "14px",
                fontSize: "18px",
                fontWeight: "bold",
                border: "1px solid #ffd166",
              }}
            >
              /thiep/{slug}/xem
            </div>
          </div>

          {/* Main Content */}
          {heroImage ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                gap: "36px",
                flex: 1,
                padding: "12px 0",
              }}
            >
              {/* Polaroid Frame */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  backgroundColor: "#ffffff",
                  padding: "14px 14px 22px 14px",
                  borderRadius: "16px",
                  boxShadow: "0 12px 30px rgba(0,0,0,0.6)",
                  width: "310px",
                  flexShrink: 0,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={heroImage}
                  alt={recipientName}
                  style={{
                    width: "282px",
                    height: "282px",
                    objectFit: "cover",
                    borderRadius: "10px",
                  }}
                />
                <div
                  style={{
                    marginTop: "12px",
                    color: "#1a1a1a",
                    fontWeight: "bold",
                    fontSize: "20px",
                    display: "flex",
                    textAlign: "center",
                  }}
                >
                  {recipientName} ✨🎂
                </div>
              </div>

              {/* Right details */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  justifyContent: "center",
                  flex: 1,
                  gap: "14px",
                }}
              >
                <div
                  style={{
                    fontSize: "42px",
                    fontWeight: "900",
                    color: "#ff758f",
                    lineHeight: 1.25,
                    display: "flex",
                  }}
                >
                  {title}
                </div>

                <div
                  style={{
                    fontSize: "22px",
                    color: "#f8f9fa",
                    lineHeight: 1.45,
                    display: "flex",
                    maxHeight: "140px",
                    overflow: "hidden",
                  }}
                >
                  {description}
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                gap: "16px",
                flex: 1,
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  fontSize: "50px",
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
                  fontSize: "25px",
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
          )}

          {/* Bottom Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              borderTop: "2px solid #3d145a",
              paddingTop: "14px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                color: "#ffd166",
                fontSize: "20px",
                fontWeight: "bold",
              }}
            >
              💌 Khui phong bì & thổi nến sinh nhật
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                color: "#ff758f",
                fontSize: "18px",
                fontWeight: "bold",
              }}
            >
              👉 Nhấn vào để mở quà
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
