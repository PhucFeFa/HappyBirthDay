"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getFirebaseAuthErrorMessage } from "@/lib/auth-errors";
import StarField from "@/components/StarField";

export default function RegisterPage() {
  const router = useRouter();
  const { signUpWithEmail, signInWithGoogle } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const newFieldErrors: typeof fieldErrors = {};

    if (!email.trim()) {
      newFieldErrors.email = "Vui lòng nhập địa chỉ email";
    }

    if (!password) {
      newFieldErrors.password = "Vui lòng nhập mật khẩu";
    } else if (password.length < 6) {
      newFieldErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (!confirmPassword) {
      newFieldErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (password !== confirmPassword) {
      newFieldErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      return;
    }

    setFieldErrors({});
    setLoading(true);

    try {
      await signUpWithEmail(email.trim(), password);
      router.push("/my-cards");
    } catch (err: unknown) {
      setError(getFirebaseAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithGoogle();
      router.push("/my-cards");
    } catch (err: unknown) {
      setError(getFirebaseAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] relative flex items-center justify-center p-4">
      <StarField />

      <div className="relative z-10 w-full max-w-md fade-in-up">
        <div className="glass-card p-6 sm:p-8">
          <div className="text-center mb-6">
            <h1 className="font-display text-2xl font-bold text-white mb-2">
              Tạo tài khoản
            </h1>
            <p className="text-white/60 text-xs sm:text-sm">
              Đăng ký để quản lý các thiệp chúc mừng sinh nhật của bạn
            </p>
          </div>

          {/* Google signup button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white text-gray-900 font-semibold text-xs sm:text-sm hover:bg-gray-100 transition shadow-sm cursor-pointer disabled:opacity-60 mb-5"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Đăng ký nhanh với Google</span>
          </button>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[11px] text-white/40 uppercase tracking-wider">hoặc email</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <form onSubmit={handleRegister} noValidate className="space-y-4">
            <div>
              <label className="form-label text-xs sm:text-sm">Email</label>
              <input
                type="email"
                className={`form-input text-xs sm:text-sm ${
                  fieldErrors.email ? "border-red-500/60 bg-red-500/5" : ""
                }`}
                placeholder="name@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: undefined });
                }}
              />
              {fieldErrors.email && (
                <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                  <span>⚠</span> {fieldErrors.email}
                </p>
              )}
            </div>

            <div>
              <label className="form-label text-xs sm:text-sm">Mật khẩu</label>
              <input
                type="password"
                className={`form-input text-xs sm:text-sm ${
                  fieldErrors.password ? "border-red-500/60 bg-red-500/5" : ""
                }`}
                placeholder="Tối thiểu 6 ký tự"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: undefined });
                }}
              />
              {fieldErrors.password && (
                <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                  <span>⚠</span> {fieldErrors.password}
                </p>
              )}
            </div>

            <div>
              <label className="form-label text-xs sm:text-sm">Xác nhận mật khẩu</label>
              <input
                type="password"
                className={`form-input text-xs sm:text-sm ${
                  fieldErrors.confirmPassword ? "border-red-500/60 bg-red-500/5" : ""
                }`}
                placeholder="Nhập lại mật khẩu"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (fieldErrors.confirmPassword)
                    setFieldErrors({ ...fieldErrors, confirmPassword: undefined });
                }}
              />
              {fieldErrors.confirmPassword && (
                <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                  <span>⚠</span> {fieldErrors.confirmPassword}
                </p>
              )}
            </div>

            {error && (
              <div className="bg-red-500/15 border border-red-500/30 rounded-xl p-3 text-red-300 text-xs sm:text-sm leading-relaxed">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-95 text-white font-semibold py-3 rounded-xl transition text-xs sm:text-sm"
            >
              {loading ? "Đang xử lý..." : "Tạo tài khoản"}
            </button>
          </form>

          <p className="text-center text-xs sm:text-sm text-white/60 mt-6">
            Đã có tài khoản?{" "}
            <Link href="/login" className="text-pink-400 hover:text-pink-300 font-medium">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
