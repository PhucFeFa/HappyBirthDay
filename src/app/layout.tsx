import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "HappyBirthday — Tạo thiệp chúc mừng sinh nhật online",
  description:
    "Tạo thiệp sinh nhật bí mật, mời mọi người viết lời chúc, mở đúng giờ để bất ngờ.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        <AuthProvider>
          <Navbar />
          <div className="pt-16 min-h-screen">{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
}
