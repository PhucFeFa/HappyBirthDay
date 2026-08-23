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
        title: "Thiệp Chúc Mừng Sinh Nhật 🎂",
        description: "Tạo và gửi lời chúc sinh nhật bí mật đầy ý nghĩa.",
      };
    }

    const title =
      card.shareTitle?.trim() ||
      `Sinh nhật của ${card.recipientName}`;

    const description =
      card.shareDescription?.trim() ||
      (card.description
        ? card.description
        : `Nếu muốn gửi lời chúc tới sinh nhật ${card.recipientName}`);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://hpbd-mail.vercel.app";
    const fullUrl = `${baseUrl}/thiep/${slug}`;
    const ogImageUrl = `${baseUrl}/thiep/${slug}/opengraph-image`;

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
      title: "Thiệp Chúc Mừng Sinh Nhật 🎂",
      description: "Tạo và gửi lời chúc sinh nhật bí mật.",
    };
  }
}

export default function CardLayout({ children }: Props) {
  return <>{children}</>;
}
