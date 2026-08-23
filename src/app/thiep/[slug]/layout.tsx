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
      `💌 Gửi lời chúc sinh nhật đến ${card.recipientName}! 🎂`;

    const description =
      card.shareDescription?.trim() ||
      (card.description
        ? `"${card.description}" — Cùng gửi những phong bì lời chúc yêu thương dành tặng ${card.recipientName} nhé! 🎉`
        : `Cùng viết những lời chúc yêu thương bí mật dành tặng ${card.recipientName} trong ngày sinh nhật nhé! 🎉✨`);

    const images =
      card.imageUrls && card.imageUrls.length > 0
        ? [card.imageUrls[0]]
        : card.imageUrl
        ? [card.imageUrl]
        : [];

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "website",
        images,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images,
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
