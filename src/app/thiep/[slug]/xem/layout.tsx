import type { Metadata } from "next";
import { getCardBySlug } from "@/lib/db";

interface Props {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const card = await getCardBySlug(slug);
    if (!card) {
      return {
        title: "Mở Thiệp Sinh Nhật 🎂",
      };
    }

    const title =
      card.shareTitle?.trim() ||
      `🎂 Chúc Mừng Sinh Nhật ${card.recipientName}! ✨`;

    const description =
      card.shareDescription?.trim() ||
      `Món quà sinh nhật đặc biệt cùng những phong bì thư yêu thương từ bạn bè dành tặng ${card.recipientName}!`;

    const images =
      card.imageUrls && card.imageUrls.length > 0
        ? [card.imageUrls[0]]
        : card.imageUrl
        ? [card.imageUrl]
        : [];

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://hpbd-mail.vercel.app";
    const fullUrl = `${baseUrl}/thiep/${slug}/xem`;
    const ogImageUrl = `${baseUrl}/thiep/${slug}/xem/opengraph-image`;

    return {
      title,
      description,
      metadataBase: new URL(baseUrl),
      openGraph: {
        title,
        description,
        url: fullUrl,
        siteName: "HPBD • Thiệp Sinh Nhật",
        locale: "vi_VN",
        type: "website",
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: title,
            type: "image/png",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [ogImageUrl],
      },
      other: {
        "og:image": ogImageUrl,
        "og:image:secure_url": ogImageUrl,
        "og:image:type": "image/png",
        "og:image:width": "1200",
        "og:image:height": "630",
      },
    };
  } catch {
    return {
      title: "Mở Thiệp Sinh Nhật 🎂",
    };
  }
}

export default function CardViewLayout({ children }: Props) {
  return <>{children}</>;
}
