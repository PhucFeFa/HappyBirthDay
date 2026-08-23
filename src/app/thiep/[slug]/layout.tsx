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
        : `Thiệp chúc mừng sinh nhật ${card.recipientName}`);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://hpbd-mail.vercel.app";
    const fullUrl = `${baseUrl}/thiep/${slug}`;

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
      },
      twitter: {
        card: "summary",
        title,
        description,
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
