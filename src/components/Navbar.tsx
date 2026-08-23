"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md bg-black/40 border-b border-white/10">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Logo */}
        <Link
          href="/"
          className="font-script text-xl sm:text-3xl text-white font-bold tracking-wide hover:opacity-90 transition shrink-0"
        >
          HappyBirthday
        </Link>

        {/* Nav Links */}
        <nav className="flex items-center gap-1 sm:gap-3 shrink-0">
          <Link
            href="/"
            className={`text-xs sm:text-sm font-medium px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full whitespace-nowrap transition ${
              pathname === "/"
                ? "bg-white/15 text-white shadow-sm"
                : "text-white/70 hover:text-white hover:bg-white/5"
            }`}
          >
            Tạo thiệp
          </Link>

          {user && (
            <Link
              href="/my-cards"
              className={`text-xs sm:text-sm font-medium px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full whitespace-nowrap transition ${
                pathname === "/my-cards"
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              Thiệp của tôi
            </Link>
          )}

          {/* User Auth state */}
          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-1.5 sm:gap-3 pl-1.5 sm:pl-3 border-l border-white/15">
                  <span className="hidden md:inline-block text-xs text-white/60 truncate max-w-[130px]">
                    {user.email || user.displayName || "Tài khoản"}
                  </span>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="text-xs font-medium px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/85 hover:text-white border border-white/15 whitespace-nowrap transition cursor-pointer"
                  >
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 pl-1.5 sm:pl-3 border-l border-white/15">
                  <Link
                    href="/login"
                    className="text-xs sm:text-sm font-medium px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:brightness-110 whitespace-nowrap transition shadow-sm"
                  >
                    Đăng nhập
                  </Link>
                </div>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
