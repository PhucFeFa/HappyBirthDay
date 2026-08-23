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
  let heroImage: string | null = null;

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

      // Lấy ảnh kỷ niệm đầu tiên nếu có
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
          backgroundColor: "#140320",
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
            backgroundColor: "#220834",
            border: "4px solid #ff4d6d",
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
                backgroundColor: "#ff4d6d",
                color: "#ffffff",
                padding: "8px 24px",
                borderRadius: "50px",
                fontSize: "18px",
                fontWeight: "bold",
                letterSpacing: "1px",
              }}
            >
              🎂 THIỆP SINH NHẬT BÍ MẬT 🎂
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
                border: "1px solid #ff4d6d",
              }}
            >
              /thiep/{slug}
            </div>
          </div>

          {/* Main Content: 2 Cột nếu có ảnh, 1 Cột nếu không có ảnh */}
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
              {/* Cột trái: Khung ảnh Polaroid kỷ niệm */}
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
                  {recipientName} ✨💖
                </div>
              </div>

              {/* Cột phải: Lời chúc & Tiêu đề */}
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
                    color: "#ffd166",
                    lineHeight: 1.25,
                    display: "flex",
                  }}
                >
                  {shareTitle}
                </div>

                <div
                  style={{
                    fontSize: "22px",
                    color: "#ffccd5",
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
            /* Layout 1 Cột khi không có ảnh */
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
                  fontSize: "25px",
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
                color: "#f8f9fa",
                fontSize: "20px",
                fontWeight: "bold",
              }}
            >
              ✨ Viết lời chúc bí mật & gửi phong bì yêu thương
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
              👉 Nhấn vào để mở thiệp ngay
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
