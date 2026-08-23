import { ImageResponse } from "next/og";
import { getCardBySlug } from "@/lib/db";

export const runtime = "nodejs";
export const alt = "Thiệp Sinh Nhật Bí Mật";
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
  let description = "Món quà bí mật & xấp ảnh kỷ niệm đang chờ bạn mở...";

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
          backgroundColor: "#13021f",
          color: "#ffffff",
          fontFamily: "sans-serif",
          padding: "40px 50px",
        }}
      >
        {/* Khung thiệp bí mật viền dạ quang */}
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "#200632",
            border: "4px solid #ff4d6d",
            borderRadius: "32px",
            padding: "36px 45px",
          }}
        >
          {/* Header Badge */}
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
                fontSize: "20px",
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
                backgroundColor: "#360e4e",
                color: "#ffd166",
                padding: "8px 22px",
                borderRadius: "14px",
                fontSize: "18px",
                fontWeight: "bold",
                border: "1px solid #ff4d6d",
              }}
            >
              /thiep/{slug}
            </div>
          </div>

          {/* Nội dung trung tâm: Giữ bí mật, kích thích tò mò */}
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
                lineHeight: 1.25,
                display: "flex",
                textAlign: "center",
              }}
            >
              {shareTitle}
            </div>

            <div
              style={{
                fontSize: "26px",
                color: "#ffccd5",
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
                color: "#ff8fa3",
                fontSize: "22px",
                fontWeight: "bold",
              }}
            >
              🔒 Ảnh kỷ niệm & lời chúc được bảo mật bí mật bên trong
            </div>
          </div>

          {/* Bottom Bar: Kêu gọi hành động */}
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
                color: "#f8f9fa",
                fontSize: "22px",
                fontWeight: "bold",
              }}
            >
              ✨ Gửi phong bì thư & cùng đếm ngược
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#ffd166",
                color: "#13021f",
                padding: "10px 26px",
                borderRadius: "16px",
                fontSize: "20px",
                fontWeight: "bold",
              }}
            >
              👉 Nhấn vào để mở thiệp & xem ảnh 📸
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
