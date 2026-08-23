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
  let shareTitle = "";
  let description = "Nếu muốn gửi lời chúc tới sinh nhật tuiii...";

  try {
    const card = await getCardBySlug(slug);
    if (card) {
      recipientName = card.recipientName || recipientName;
      if (card.shareTitle?.trim()) {
        shareTitle = card.shareTitle.trim();
      } else {
        shareTitle = `Sinh nhật của ${recipientName}`;
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

  if (!shareTitle) {
    shareTitle = `Sinh nhật của ${recipientName}`;
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
          backgroundColor: "#110219",
          color: "#ffffff",
          fontFamily: "sans-serif",
          padding: "40px 50px",
        }}
      >
        {/* Khung Card bo góc viền mờ tinh tế đúng như hình ảnh */}
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "#1e0527",
            border: "1.5px solid rgba(255, 255, 255, 0.12)",
            borderRadius: "26px",
            padding: "36px 44px",
          }}
        >
          {/* Header Pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              padding: "8px 24px",
              borderRadius: "40px",
              fontSize: "18px",
              fontWeight: "600",
              color: "#ffb3c6",
              letterSpacing: "1px",
            }}
          >
            THIỆP SINH NHẬT BÍ MẬT
          </div>

          {/* Center Main Content */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: "14px",
              maxWidth: "920px",
            }}
          >
            <div
              style={{
                fontSize: "48px",
                fontWeight: "800",
                color: "#ff8fa3",
                lineHeight: 1.25,
                display: "flex",
                textAlign: "center",
              }}
            >
              {shareTitle}
            </div>

            <div
              style={{
                fontSize: "24px",
                color: "rgba(255, 255, 255, 0.7)",
                lineHeight: 1.45,
                display: "flex",
                textAlign: "center",
                maxHeight: "75px",
                overflow: "hidden",
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
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
              paddingTop: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                color: "rgba(255, 255, 255, 0.5)",
                fontSize: "18px",
              }}
            >
              ✨ Viết lời chúc & phong bì yêu thương
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "rgba(255, 77, 109, 0.15)",
                border: "1px solid rgba(255, 77, 109, 0.3)",
                color: "#ff8fa3",
                padding: "8px 20px",
                borderRadius: "12px",
                fontSize: "18px",
                fontFamily: "monospace",
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
