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

    const title = `🎂 Chúc Mừng Sinh Nhật ${card.recipientName}! ✨`;
    const description = `Món quà sinh nhật đặc biệt cùng những phong bì thư yêu thương từ bạn bè dành tặng ${card.recipientName}!`;
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
      title: "Mở Thiệp Sinh Nhật 🎂",
    };
  }
}

export default function CardViewLayout({ children }: Props) {
  return <>{children}</>;
}
