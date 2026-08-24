"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "phuclh.ce191132@gmail.com";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login");
      } else if (user.email !== ADMIN_EMAIL) {
        router.replace("/");
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0f" }}>
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-white/20 border-t-pink-400 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-white/50 text-sm">Đang xác thực...</p>
        </div>
      </div>
    );
  }

  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0f" }}>
        <div className="text-center">
          <div className="text-4xl mb-3">🔒</div>
          <p className="text-white/50">Không có quyền truy cập</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
