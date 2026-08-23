import { ImageResponse } from "next/og";
import { getCardBySlug } from "@/lib/db";

export const runtime = "nodejs";
export const alt = "Thiệp Sinh Nhật";
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
  let recipientName = "Người ấy";
  let shareTitle = "💌 Gửi lời chúc sinh nhật! 🎂";
  let description = "Cùng viết những lời chúc yêu thương bí mật dành tặng trong ngày sinh nhật nhé! 🎉";

  try {
    const card = await getCardBySlug(slug);
    if (card) {
      recipientName = card.recipientName || recipientName;
      if (card.shareTitle?.trim()) {
        shareTitle = card.shareTitle.trim();
      } else {
        shareTitle = `💌 Gửi lời chúc sinh nhật đến ${recipientName}! 🎂`;
      }
      if (card.shareDescription?.trim()) {
        description = card.shareDescription.trim();
      } else if (card.description?.trim()) {
        description = card.description.trim();
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
          backgroundColor: "#160322",
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
            backgroundColor: "#240a36",
            border: "4px solid #ff4d6d",
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
              backgroundColor: "#ff4d6d",
              color: "#ffffff",
              padding: "10px 32px",
              borderRadius: "50px",
              fontSize: "22px",
              fontWeight: "bold",
              letterSpacing: "1px",
            }}
          >
            🎂 THIỆP SINH NHẬT BÍ MẬT 🎂
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
                color: "#ffd166",
                lineHeight: 1.2,
                display: "flex",
                textAlign: "center",
              }}
            >
              {shareTitle}
            </div>

            <div
              style={{
                fontSize: "26px",
                color: "#ffb3c6",
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
                color: "#f8f9fa",
                fontSize: "22px",
                fontWeight: "bold",
              }}
            >
              ✨ Viết lời chúc & phong bì yêu thương
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#ff758f",
                color: "#160322",
                padding: "8px 24px",
                borderRadius: "16px",
                fontSize: "22px",
                fontWeight: "bold",
              }}
            >
              /thiep/{slug}
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
