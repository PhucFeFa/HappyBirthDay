import { ImageResponse } from "next/og";
import { getCardBySlug } from "@/lib/db";
import fs from "fs";
import path from "path";

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

  // 2. Lấy ảnh tải lên của thiệp nếu có
  try {
    const card = await getCardBySlug(slug);
    if (card) {
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
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#000000",
          overflow: "hidden",
        }}
      >
        {/* 100% Chỉ hiển thị duy nhất bức ảnh tràn màn hình */}
        {heroImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={heroImage}
            alt="Birthday Image"
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
              backgroundColor: "#220834",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "48px",
              color: "#ffd166",
              fontWeight: "bold",
            }}
          >
            🎂 Happy Birthday! 🎂
          </div>
        )}
      </div>
    ),
    {
      ...size,
    }
  );
}
