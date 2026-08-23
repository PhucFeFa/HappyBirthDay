"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import StarField from "@/components/StarField";
import EditCardModal from "@/components/EditCardModal";
import { formatRevealTime, THEMES, ThemeKey, CelebrationEffectKey } from "@/lib/utils";
import { copyTextToClipboard } from "@/lib/clipboard";
import {
  Copy,
  Check,
  Edit3,
  Layers,
  Plus,
  Sparkles,
  Calendar,
  Mail,
  ExternalLink,
} from "lucide-react";

interface CardItem {
  id: string;
  slug: string;
  recipientName: string;
  revealAt: string;
  theme: ThemeKey;
  wishCount: number;
  isRevealed: boolean;
  shareLink: string;
  viewLink: string;
  creatorToken?: string;
  celebrationEffect?: CelebrationEffectKey;
  description?: string;
  imageUrl?: string;
  imageUrls?: string[];
  shareTitle?: string;
  shareDescription?: string;
}

export default function MyCardsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [cards, setCards] = useState<CardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingCard, setEditingCard] = useState<CardItem | null>(null);

  const fetchCards = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/cards/user/${user.uid}`);
      const data = await res.json();
      if (data.cards) {
        setCards(data.cards);
      }
    } catch (err) {
      console.error("Error fetching user cards:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      fetchCards();
    }
  }, [user, authLoading, router, fetchCards]);

  const handleCopyLink = async (cardId: string, link: string) => {
    const success = await copyTextToClipboard(link);
    if (success) {
      setCopiedId(cardId);
      setTimeout(() => setCopiedId(null), 2000);
    }
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
            <h1 className="font-display text-3xl font-bold text-white mb-1 flex items-center gap-2.5">
              <Layers className="w-7 h-7 text-pink-400" />
              <span>Thiệp của tôi</span>
            </h1>
            <p className="text-white/50 text-sm">
              Theo dõi và mở xem các thiệp sinh nhật do bạn tạo
            </p>
          </div>
          <Link
            href="/"
            className="btn-primary py-2.5 px-5 text-sm bg-gradient-to-r from-pink-500 to-purple-600 self-start sm:self-auto rounded-full font-medium flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo thiệp mới</span>
          </Link>
        </div>

        {/* Cards Grid */}
        {cards.length === 0 ? (
          <div className="glass-card p-12 text-center max-w-md mx-auto my-12">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 text-pink-400">
              <Sparkles className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">
              Chưa có thiệp nào
            </h2>
            <p className="text-white/50 text-sm mb-6">
              Bạn chưa tạo thiệp sinh nhật nào. Hãy tạo thiệp đầu tiên để chia sẻ với bạn bè!
            </p>
            <Link
              href="/"
              className="btn-primary py-2.5 px-6 text-sm bg-gradient-to-r from-pink-500 to-purple-600 rounded-full font-medium inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo thiệp ngay</span>
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
                      <p className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                        <span>Mở lúc: {formatRevealTime(new Date(card.revealAt))}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span>Số lời chúc: <strong className="text-white/90 font-bold">{card.wishCount}</strong></span>
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-4 border-t border-white/10">
                    <Link
                      href={card.viewLink}
                      className="w-full text-center py-2.5 px-4 rounded-xl text-sm font-semibold text-white transition hover:brightness-110 flex items-center justify-center gap-1.5"
                      style={{
                        background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                      }}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>{card.isRevealed ? "Xem thiệp & Lời chúc" : "Xem màn hình đếm ngược"}</span>
                    </Link>

                    {/* Nút sửa thiệp trước khi mở */}
                    {!card.isRevealed && (
                      <button
                        type="button"
                        onClick={() => setEditingCard(card)}
                        className="w-full py-2 px-4 rounded-xl text-xs font-semibold text-pink-300 hover:text-pink-200 bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/30 transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Chỉnh sửa thông tin thiệp</span>
                      </button>
                    )}

                    {/* Nút sao chép link thuần */}
                    <button
                      type="button"
                      onClick={() => handleCopyLink(card.id, card.shareLink)}
                      className="w-full py-2 px-4 rounded-xl text-xs font-semibold text-white/90 bg-white/10 hover:bg-white/20 border border-white/20 transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {copiedId === card.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Đã chép link</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Sao chép link gửi bạn bè</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Chỉnh Sửa Thiệp */}
      {editingCard && (
        <EditCardModal
          slug={editingCard.slug}
          creatorToken={editingCard.creatorToken}
          userId={user?.uid}
          initialData={{
            recipientName: editingCard.recipientName,
            revealAt: new Date(editingCard.revealAt).getTime(),
            theme: editingCard.theme,
            celebrationEffect: editingCard.celebrationEffect,
            description: editingCard.description,
            imageUrl: editingCard.imageUrl,
            imageUrls: editingCard.imageUrls,
            shareTitle: editingCard.shareTitle,
            shareDescription: editingCard.shareDescription,
          }}
          isOpen={Boolean(editingCard)}
          onClose={() => setEditingCard(null)}
          onSuccess={fetchCards}
        />
      )}
    </main>
  );
}
