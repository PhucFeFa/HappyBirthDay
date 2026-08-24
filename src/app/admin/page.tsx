"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  LayoutDashboard, CreditCard, MessageSquare, Users,
  Search, Trash2, Eye, RefreshCw, ChevronLeft, ChevronRight,
  CheckCircle, Clock, Sparkles, X, AlertTriangle,
  Link2, AlertCircle, Calendar, Mail, ExternalLink
} from "lucide-react";
import { THEMES } from "@/lib/utils";
import {
  AdminCard,
  AdminWish,
  AdminStats,
  AdminUserSummary,
  fetchAdminStatsDirect,
  fetchAllCardsDirect,
  fetchWishesForCardDirect,
  deleteCardDirect,
  deleteWishDirect,
  fetchAllUsersDirect,
} from "@/lib/admin-client-db";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtDate(d: Date | string | undefined) {
  if (!d) return "—";
  const dateObj = d instanceof Date ? d : new Date(d);
  if (isNaN(dateObj.getTime()) || dateObj.getTime() === 0) return "—";
  return dateObj.toLocaleString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ─── Stat Card Component ──────────────────────────────────────────────────────

function StatCard({
  label, value, sub, icon: Icon, color,
}: {
  label: string; value: number; sub?: string;
  icon: React.ElementType; color: string;
}) {
  return (
    <div className="bg-[#14121e] border border-white/10 rounded-2xl p-5 flex items-start gap-4 shadow-lg hover:border-white/20 transition duration-200">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${color}20`, border: `1px solid ${color}40` }}>
        <Icon className="w-6 h-6" style={{ color }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-1">{label}</p>
        <p className="text-white text-2xl sm:text-3xl font-extrabold tracking-tight">{value.toLocaleString("vi-VN")}</p>
        {sub && <p className="text-white/40 text-xs mt-1 truncate">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────

function ConfirmDialog({ message, onConfirm, onCancel }: {
  message: string; onConfirm: () => void; onCancel: () => void;
}) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "unset"; };
  }, []);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80" onClick={onCancel} />
      <div className="relative bg-[#181524] border border-white/20 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl">
        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
        <p className="text-white font-bold text-lg mb-1.5">Xác nhận thao tác</p>
        <p className="text-white/70 text-sm mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition cursor-pointer">
            Hủy bỏ
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 hover:brightness-110 text-white text-sm font-bold transition cursor-pointer shadow-md">
            Xác nhận xóa
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Overview ────────────────────────────────────────────────────────────

function OverviewTab({ stats, loading, error, onRetry }: {
  stats: AdminStats | null;
  loading: boolean;
  error?: string | null;
  onRetry: () => void;
}) {
  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <div className="w-10 h-10 border-2 border-white/20 border-t-pink-400 rounded-full animate-spin" />
      <p className="text-white/50 text-sm">Đang tính toán số liệu thời gian thực...</p>
    </div>
  );

  if (error || !stats) return (
    <div className="bg-[#14121e] border border-white/10 rounded-2xl p-8 text-center max-w-md mx-auto my-12 shadow-xl">
      <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
      <h3 className="text-white font-bold text-lg mb-1">Không thể tải dữ liệu</h3>
      <p className="text-rose-300 text-xs sm:text-sm mb-5 leading-relaxed">{error || "Lỗi kết nối cơ sở dữ liệu"}</p>
      <button
        onClick={onRetry}
        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:brightness-110 text-white text-sm font-bold transition cursor-pointer inline-flex items-center gap-2 shadow-lg"
      >
        <RefreshCw className="w-4 h-4" />
        Thử lại ngay
      </button>
    </div>
  );

  const themeTotal = Object.values(stats.themeDistribution).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <StatCard label="Tổng thiệp" value={stats.totalCards} sub={`+${stats.cardsThisWeek} tuần này`} icon={CreditCard} color="#f472b6" />
        <StatCard label="Tổng lời chúc" value={stats.totalWishes} sub={`+${stats.wishesThisWeek} tuần này`} icon={MessageSquare} color="#a78bfa" />
        <StatCard label="Đã mở" value={stats.revealedCards} sub="thiệp đã tới sinh nhật" icon={CheckCircle} color="#34d399" />
        <StatCard label="Đang đếm ngược" value={stats.pendingCards} sub="chờ mở bí mật" icon={Clock} color="#fbbf24" />
      </div>

      {/* Theme Distribution */}
      <div className="bg-[#14121e] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-lg">
        <h3 className="text-white font-bold text-base sm:text-lg mb-5 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-pink-400" />
          Phân bố tông màu thiệp sinh nhật
        </h3>
        <div className="space-y-4">
          {Object.entries(stats.themeDistribution)
            .sort((a, b) => b[1] - a[1])
            .map(([theme, count]) => {
              const t = THEMES[theme as keyof typeof THEMES];
              const pct = Math.round((count / themeTotal) * 100);
              return (
                <div key={theme} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/80 font-medium capitalize flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: t?.primary ?? "#f472b6" }} />
                      {t?.label ?? theme}
                    </span>
                    <span className="text-white/50 text-xs font-mono">{count} thiệp ({pct}%)</span>
                  </div>
                  <div className="h-3 rounded-full bg-white/5 overflow-hidden p-0.5 border border-white/5">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${pct}%`,
                        background: `linear-gradient(90deg, ${t?.primary ?? "#f472b6"}, ${t?.secondary ?? "#c084fc"})`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

// ─── Card Detail Modal ────────────────────────────────────────────────────────

function CardDetailModal({ card, onClose, onDeleteWish }: {
  card: AdminCard;
  onClose: () => void;
  onDeleteWish: (wishId: string, cardId: string) => Promise<void>;
}) {
  const [wishes, setWishes] = useState<AdminWish[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmWishId, setConfirmWishId] = useState<string | null>(null);

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "unset"; };
  }, []);

  useEffect(() => {
    fetchWishesForCardDirect(card.id)
      .then((data) => setWishes(data))
      .catch((e) => console.error("Error loading wishes:", e))
      .finally(() => setLoading(false));
  }, [card.id]);

  const handleDeleteWish = async (wishId: string) => {
    setDeletingId(wishId);
    await onDeleteWish(wishId, card.id);
    setWishes((prev) => prev.filter((w) => w.id !== wishId));
    setDeletingId(null);
    setConfirmWishId(null);
  };

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://hpbd-mail.vercel.app";

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/85 transition-opacity" onClick={onClose} />

      {/* Modal Dialog Container */}
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-[#14121e] border border-white/20 rounded-2xl shadow-2xl overflow-hidden z-10">
        {/* Header (Fixed at top) */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 bg-[#1a1728] border-b border-white/10 shrink-0">
          <div className="min-w-0 pr-3">
            <h2 className="text-white font-bold text-lg sm:text-xl truncate">{card.recipientName}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-pink-400 font-mono text-xs truncate">/thiep/{card.slug}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                card.isRevealed ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
              }`}>
                {card.isRevealed ? "Đã mở" : "Chờ mở"}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer shrink-0"
            aria-label="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-5 flex-1 custom-scrollbar">
          {/* Card Info Box */}
          <div className="bg-[#1a1728] border border-white/10 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-0.5">Email người tạo</p>
              <p className="text-white font-medium text-sm truncate">{card.creatorEmail ?? "—"}</p>
            </div>
            <div>
              <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-0.5">Thời điểm tạo</p>
              <p className="text-white font-medium text-sm">{fmtDate(card.createdAt)}</p>
            </div>
            <div>
              <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-0.5">Thời điểm mở thiệp</p>
              <p className="text-white font-medium text-sm text-yellow-300 font-mono">{fmtDate(card.revealAt)}</p>
            </div>
            <div>
              <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-0.5">Tông màu & Hiệu ứng</p>
              <p className="text-white font-medium text-sm capitalize">{card.theme} • {card.celebrationEffect ?? "Hoa nở"}</p>
            </div>
            {card.description && (
              <div className="sm:col-span-2 pt-2 border-t border-white/5">
                <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-1">Lời tựa thiệp</p>
                <p className="text-pink-200/90 text-sm italic bg-black/20 p-3 rounded-lg border border-white/5 leading-relaxed">
                  "{card.description}"
                </p>
              </div>
            )}
          </div>

          {/* Direct Links */}
          <div className="flex flex-wrap gap-2.5">
            <a
              href={`${baseUrl}/thiep/${card.slug}`}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 rounded-xl bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/30 text-pink-300 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Xem trang viết thiệp</span>
            </a>
            <a
              href={`${baseUrl}/thiep/${card.slug}/xem`}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Xem trang đếm ngược</span>
            </a>
          </div>

          {/* Wishes Section */}
          <div className="space-y-3 pt-2">
            <h3 className="text-white font-bold text-base flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-purple-400" />
              <span>Danh sách lời chúc đã gửi</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono">
                {wishes.length}
              </span>
            </h3>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <div className="w-7 h-7 border-2 border-white/20 border-t-pink-400 rounded-full animate-spin" />
                <p className="text-white/40 text-xs">Đang tải phong bì lời chúc...</p>
              </div>
            ) : wishes.length === 0 ? (
              <div className="p-8 text-center bg-[#1a1728]/50 rounded-xl border border-white/5">
                <Mail className="w-8 h-8 text-white/20 mx-auto mb-2" />
                <p className="text-white/40 text-sm">Chưa có ai gửi lời chúc vào thiệp này.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                {wishes.map((wish, idx) => (
                  <div
                    key={wish.id}
                    className="bg-[#1a1728] border border-white/10 hover:border-white/20 rounded-xl p-3.5 flex items-start gap-3 transition"
                  >
                    <span className="w-6 h-6 rounded-full bg-white/10 text-white/50 text-xs flex items-center justify-center font-mono shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-pink-300 text-sm font-bold truncate">
                          {wish.authorName || "Người gửi bí mật"}
                        </p>
                        <span className="text-white/40 text-[11px] font-mono shrink-0">
                          {fmtDate(wish.createdAt)}
                        </span>
                      </div>
                      <p className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {wish.message}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setConfirmWishId(wish.id)}
                      disabled={deletingId === wish.id}
                      className="w-7 h-7 rounded-lg bg-red-500/15 hover:bg-red-500/30 text-red-400 flex items-center justify-center transition cursor-pointer shrink-0"
                      title="Xóa lời chúc này"
                    >
                      {deletingId === wish.id ? (
                        <div className="w-3.5 h-3.5 border border-red-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer (Close button) */}
        <div className="px-5 sm:px-6 py-3.5 bg-[#1a1728] border-t border-white/10 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold transition cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>

      {confirmWishId && (
        <ConfirmDialog
          message="Bạn có chắc chắn muốn xóa lời chúc này không? Hành động này không thể hoàn tác."
          onConfirm={() => handleDeleteWish(confirmWishId)}
          onCancel={() => setConfirmWishId(null)}
        />
      )}
    </div>
  );
}

// ─── Tab: Cards ───────────────────────────────────────────────────────────────

function CardsTab({ onCardDeleted }: { onCardDeleted?: () => void }) {
  const [allCards, setAllCards] = useState<AdminCard[]>([]);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<AdminCard | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<AdminCard | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const LIMIT = 15;

  const loadCards = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllCardsDirect();
      setAllCards(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi khi tải danh sách thiệp");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  // Filter client-side
  const filtered = allCards.filter((c) => {
    if (!searchInput.trim()) return true;
    const q = searchInput.toLowerCase().trim();
    return (
      c.recipientName.toLowerCase().includes(q) ||
      c.slug.toLowerCase().includes(q) ||
      (c.creatorEmail && c.creatorEmail.toLowerCase().includes(q)) ||
      (c.description && c.description.toLowerCase().includes(q))
    );
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));
  const paginated = filtered.slice((page - 1) * LIMIT, page * LIMIT);

  const handleDelete = async (card: AdminCard) => {
    setDeletingId(card.id);
    try {
      await deleteCardDirect(card.id);
      setAllCards((prev) => prev.filter((c) => c.id !== card.id));
      if (onCardDeleted) onCardDeleted();
    } catch (e) {
      alert("Lỗi khi xóa thiệp: " + String(e));
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  };

  const handleDeleteWish = async (wishId: string, cardId: string) => {
    await deleteWishDirect(wishId, cardId);
    setAllCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, wishCount: Math.max(0, c.wishCount - 1) } : c))
    );
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            className="w-full bg-[#14121e] border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder:text-white/30 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition"
            placeholder="Tìm theo tên người nhận, slug, email..."
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setPage(1);
            }}
          />
        </div>
        {searchInput && (
          <button
            type="button"
            onClick={() => {
              setSearchInput("");
              setPage(1);
            }}
            className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 transition cursor-pointer flex items-center gap-1 text-xs font-semibold"
          >
            <X className="w-4 h-4" />
            <span>Xóa lọc</span>
          </button>
        )}
      </div>

      {/* Total Count */}
      <div className="flex items-center justify-between text-xs text-white/50 px-1">
        <span>
          {searchInput ? `Tìm thấy ${total} / ${allCards.length} thiệp` : `Tổng số: ${allCards.length} thiệp`}
        </span>
        <span>Trang {page} / {totalPages}</span>
      </div>

      {/* Table Container */}
      <div className="bg-[#14121e] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-2 border-white/20 border-t-pink-400 rounded-full animate-spin" />
            <p className="text-white/40 text-xs">Đang tải danh sách thiệp...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-300 text-sm">
            <p>{error}</p>
            <button onClick={loadCards} className="mt-3 px-4 py-2 rounded-xl bg-pink-500/30 text-white text-xs font-bold">Thử lại</button>
          </div>
        ) : paginated.length === 0 ? (
          <div className="p-12 text-center text-white/40 text-sm">
            <CreditCard className="w-10 h-10 mx-auto mb-2 opacity-20" />
            <p>Không tìm thấy thiệp nào phù hợp.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-[#1a1728] border-b border-white/10 text-white/60 text-xs uppercase tracking-wider font-semibold">
                  <th className="px-4 py-3.5 min-w-[150px]">Người nhận</th>
                  <th className="px-4 py-3.5 min-w-[120px]">Slug</th>
                  <th className="px-4 py-3.5 min-w-[180px]">Email tạo</th>
                  <th className="px-4 py-3.5 min-w-[130px]">Ngày tạo</th>
                  <th className="px-4 py-3.5 min-w-[130px]">Ngày mở</th>
                  <th className="px-4 py-3.5 min-w-[85px] text-center">Lời chúc</th>
                  <th className="px-4 py-3.5 min-w-[100px]">Trạng thái</th>
                  <th className="px-4 py-3.5 min-w-[90px] text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paginated.map((card) => {
                  const t = THEMES[card.theme as keyof typeof THEMES];
                  return (
                    <tr key={card.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ background: t?.primary ?? "#f472b6" }} />
                          <span className="text-white font-semibold truncate max-w-[140px]" title={card.recipientName}>
                            {card.recipientName}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-pink-300/80 truncate max-w-[120px]" title={card.slug}>
                        {card.slug}
                      </td>
                      <td className="px-4 py-3.5 text-white/70 text-xs truncate max-w-[180px]" title={card.creatorEmail ?? "—"}>
                        {card.creatorEmail ?? "—"}
                      </td>
                      <td className="px-4 py-3.5 text-white/50 text-xs whitespace-nowrap">{fmtDate(card.createdAt)}</td>
                      <td className="px-4 py-3.5 text-white/80 font-mono text-xs whitespace-nowrap">{fmtDate(card.revealAt)}</td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold text-xs font-mono">
                          {card.wishCount}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${
                          card.isRevealed ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        }`}>
                          {card.isRevealed ? "Đã mở" : "Chờ mở"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedCard(card)}
                            className="w-8 h-8 rounded-lg bg-purple-500/20 hover:bg-purple-500/35 text-purple-300 flex items-center justify-center transition cursor-pointer"
                            title="Xem chi tiết thiệp & lời chúc"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDelete(card)}
                            disabled={deletingId === card.id}
                            className="w-8 h-8 rounded-lg bg-red-500/20 hover:bg-red-500/35 text-red-400 flex items-center justify-center transition cursor-pointer"
                            title="Xóa thiệp này"
                          >
                            {deletingId === card.id ? (
                              <div className="w-3.5 h-3.5 border border-red-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg bg-[#14121e] border border-white/10 text-white text-xs font-semibold hover:bg-white/10 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Trang trước</span>
          </button>
          <span className="text-white/60 text-xs px-3 font-mono">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 rounded-lg bg-[#14121e] border border-white/10 text-white text-xs font-semibold hover:bg-white/10 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <span>Trang sau</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {selectedCard && (
        <CardDetailModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onDeleteWish={handleDeleteWish}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          message={`Bạn có chắc muốn xóa thiệp "${confirmDelete.recipientName}" cùng toàn bộ ${confirmDelete.wishCount} lời chúc bên trong?`}
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}

// ─── Tab: Users ───────────────────────────────────────────────────────────────

function UsersTab() {
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllUsersDirect();
      setUsers(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi khi tải danh sách tài khoản");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-2">
      <div className="w-8 h-8 border-2 border-white/20 border-t-pink-400 rounded-full animate-spin" />
      <p className="text-white/40 text-xs">Đang tổng hợp danh sách tài khoản...</p>
    </div>
  );

  if (error) return (
    <div className="p-8 text-center text-rose-300 text-sm bg-[#14121e] border border-white/10 rounded-2xl">
      <p>{error}</p>
      <button onClick={loadUsers} className="mt-3 px-4 py-2 rounded-xl bg-pink-500/30 text-white text-xs font-bold">Thử lại</button>
    </div>
  );

  return (
    <div className="bg-[#14121e] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
      {users.length === 0 ? (
        <div className="p-12 text-center text-white/40 text-sm">
          <Users className="w-10 h-10 mx-auto mb-2 opacity-20" />
          <p>Chưa có người dùng nào tạo thiệp trên hệ thống.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-[#1a1728] border-b border-white/10 text-white/60 text-xs uppercase tracking-wider font-semibold">
                <th className="px-4 py-3.5 w-14">#</th>
                <th className="px-4 py-3.5 min-w-[220px]">Email Người Tạo</th>
                <th className="px-4 py-3.5 min-w-[130px]">Số Thiệp Đã Tạo</th>
                <th className="px-4 py-3.5 min-w-[150px]">Thiệp Gần Nhất</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((u, idx) => (
                <tr key={u.userId} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3.5 text-white/30 text-xs font-mono">{idx + 1}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-md">
                        {u.email[0].toUpperCase()}
                      </div>
                      <span className="text-white font-medium truncate max-w-[260px]">{u.email}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-pink-400 font-bold text-base font-mono">{u.cardCount}</span>
                    <span className="text-white/40 text-xs ml-1.5 font-medium">thiệp</span>
                  </td>
                  <td className="px-4 py-3.5 text-white/50 text-xs whitespace-nowrap">{fmtDate(u.latestCardAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────

const TABS = [
  { id: "overview", label: "Tổng Quan", icon: LayoutDashboard },
  { id: "cards", label: "Danh Sách Thiệp", icon: CreditCard },
  { id: "users", label: "Tài Khoản", icon: Users },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function AdminPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      const data = await fetchAdminStatsDirect();
      setStats(data);
    } catch (e: unknown) {
      setStatsError(e instanceof Error ? e.message : "Lỗi khi lấy dữ liệu");
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  return (
    <main
      className="min-h-[calc(100vh-4rem)] pt-20 sm:pt-24 pb-16 px-4 sm:px-6"
      style={{
        background: "radial-gradient(ellipse at top, #2d0a3e30, transparent 60%), radial-gradient(ellipse at bottom, #0d1b3e30, transparent 60%), #07060b",
      }}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-pink-400" />
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Quản Trị Hệ Thống
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 uppercase tracking-wider">
                Admin
              </span>
            </div>
            <p className="text-white/50 text-xs sm:text-sm">
              Theo dõi số liệu, quản lý thiệp sinh nhật và người dùng thời gian thực
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2 rounded-xl bg-[#14121e] hover:bg-white/10 border border-white/15 text-white/90 hover:text-white text-xs font-semibold flex items-center gap-2 transition cursor-pointer shadow-md"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-pink-400 ${refreshing ? "animate-spin" : ""}`} />
              <span>Làm mới số liệu</span>
            </button>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex gap-1.5 bg-[#14121e] p-1.5 rounded-2xl border border-white/10 w-fit shadow-md">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
                activeTab === id
                  ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md scale-[1.02]"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <OverviewTab
            stats={stats}
            loading={statsLoading}
            error={statsError}
            onRetry={loadStats}
          />
        )}
        {activeTab === "cards" && <CardsTab onCardDeleted={loadStats} />}
        {activeTab === "users" && <UsersTab />}
      </div>
    </main>
  );
}
