"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import StarField from "@/components/StarField";
import { formatRevealTime, THEMES, ThemeKey } from "@/lib/utils";

interface UserCard {
  id: string;
  slug: string;
  recipientName: string;
  revealAt: string;
  theme: ThemeKey;
  wishCount: number;
  createdAt: string;
  isRevealed: boolean;
  shareLink: string;
  viewLink: string;
}

export default function MyCardsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [cards, setCards] = useState<UserCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      fetch(`/api/cards/user/${user.uid}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.cards) {
            setCards(data.cards);
          }
        })
        .catch((err) => console.error("Error fetching user cards:", err))
        .finally(() => setLoading(false));
    }
  }, [user, authLoading, router]);

  const handleCopyLink = async (cardId: string, link: string) => {
    await navigator.clipboard.writeText(link);
    setCopiedId(cardId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (authLoading || (loading && user)) {
    return (
      <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/40 text-sm">Đang tải danh sách thiệp...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] relative p-4 sm:p-8">
      <StarField />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
          <div>
            <h1 className="font-display text-3xl font-bold text-white mb-1">
              Thiệp của tôi
            </h1>
            <p className="text-white/50 text-sm">
              Theo dõi và mở xem các thiệp sinh nhật do bạn tạo
            </p>
          </div>
          <Link
            href="/"
            className="btn-primary py-2.5 px-5 text-sm bg-gradient-to-r from-pink-500 to-purple-600 self-start sm:self-auto rounded-full font-medium"
          >
            + Tạo thiệp mới
          </Link>
        </div>

        {/* Cards Grid */}
        {cards.length === 0 ? (
          <div className="glass-card p-12 text-center max-w-md mx-auto my-12">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 text-white/30 text-2xl font-serif">
              ✦
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">
              Chưa có thiệp nào
            </h2>
            <p className="text-white/50 text-sm mb-6">
              Bạn chưa tạo thiệp sinh nhật nào. Hãy tạo thiệp đầu tiên để chia sẻ với bạn bè!
            </p>
            <Link
              href="/"
              className="btn-primary py-2.5 px-6 text-sm bg-gradient-to-r from-pink-500 to-purple-600 rounded-full font-medium"
            >
              Tạo thiệp ngay
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card) => {
              const theme = THEMES[card.theme] || THEMES.pink;
              return (
                <div
                  key={card.id}
                  className={`glass-card p-6 rounded-2xl border flex flex-col justify-between transition hover:-translate-y-1 ${theme.card}`}
                  style={{
                    boxShadow: `0 4px 20px ${theme.primary}15`,
                  }}
                >
                  <div>
                    {/* Status Badge & Theme pill */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                          card.isRevealed
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                            : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                        }`}
                      >
                        {card.isRevealed ? "Đã mở thiệp" : "Đang chờ mở"}
                      </span>
                      <span className="text-xs text-white/40 font-mono">
                        {theme.label}
                      </span>
                    </div>

                    {/* Recipient Name */}
                    <h2 className="text-xl font-bold text-white mb-2 truncate">
                      {card.recipientName}
                    </h2>

                    {/* Meta info */}
                    <div className="space-y-1.5 text-xs text-white/60 mb-6">
                      <p>
                        Thời gian mở:{" "}
                        <span className="text-white/80 font-medium">
                          {formatRevealTime(new Date(card.revealAt))}
                        </span>
                      </p>
                      <p>
                        Số lời chúc đã nhận:{" "}
                        <span className="text-white/90 font-bold">
                          {card.wishCount}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-4 border-t border-white/10">
                    <Link
                      href={card.viewLink}
                      className="w-full block text-center py-2.5 px-4 rounded-xl text-sm font-semibold text-white transition hover:brightness-110"
                      style={{
                        background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                      }}
                    >
                      {card.isRevealed ? "Xem thiệp & Lời chúc" : "Xem màn hình đếm ngược"}
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleCopyLink(card.id, card.shareLink)}
                      className="w-full py-2 px-4 rounded-xl text-xs font-medium text-white/80 bg-white/10 hover:bg-white/15 border border-white/15 transition cursor-pointer"
                    >
                      {copiedId === card.id ? "Đã sao chép link viết lời chúc" : "Sao chép link viết lời chúc"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
