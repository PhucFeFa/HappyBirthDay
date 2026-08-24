"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  LayoutDashboard, CreditCard, MessageSquare, Users,
  Search, Trash2, Eye, RefreshCw, ChevronLeft, ChevronRight,
  CheckCircle, Clock, Sparkles, X, AlertTriangle,
  Link2, AlertCircle
} from "lucide-react";
import { THEMES } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Stats {
  totalCards: number;
  totalWishes: number;
  revealedCards: number;
  pendingCards: number;
  cardsThisWeek: number;
  wishesThisWeek: number;
  themeDistribution: Record<string, number>;
}

interface AdminCard {
  id: string;
  slug: string;
  recipientName: string;
  revealAt: string;
  createdAt: string;
  theme: string;
  wishCount: number;
  userId?: string;
  creatorEmail?: string;
  description?: string;
  isRevealed: boolean;
}

interface AdminWish {
  id: string;
  cardId: string;
  authorName: string;
  message: string;
  createdAt: string;
}

interface AdminUser {
  userId: string;
  email: string;
  cardCount: number;
  latestCardAt?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtDate(d: string | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ─── Hook: Get admin token ────────────────────────────────────────────────────

function useAdminFetch() {
  const { user } = useAuth();

  const adminFetch = useCallback(async (url: string, options?: RequestInit) => {
    if (!user) {
      throw new Error("Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn.");
    }
    const token = await user.getIdToken(true);
    return fetch(url, {
      ...options,
      headers: {
        ...options?.headers,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  }, [user]);

  return { adminFetch, user };
}

// ─── Stat Card Component ──────────────────────────────────────────────────────

function StatCard({
  label, value, sub, icon: Icon, color,
}: {
  label: string; value: number; sub?: string;
  icon: React.ElementType; color: string;
}) {
  return (
    <div className="glass-card p-5 flex items-start gap-4">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${color}20`, border: `1px solid ${color}40` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div>
        <p className="text-white/50 text-xs font-medium uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-white text-3xl font-bold">{value.toLocaleString("vi-VN")}</p>
        {sub && <p className="text-white/40 text-xs mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────

function ConfirmDialog({ message, onConfirm, onCancel }: {
  message: string; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative glass-card p-6 max-w-sm w-full text-center">
        <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
        <p className="text-white font-semibold mb-1">Xác nhận xóa</p>
        <p className="text-white/60 text-sm mb-5">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition cursor-pointer">
            Hủy
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition cursor-pointer">
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Overview ────────────────────────────────────────────────────────────

function OverviewTab({ stats, loading, error, onRetry }: {
  stats: Stats | null;
  loading: boolean;
  error?: string | null;
  onRetry: () => void;
}) {
  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <div className="w-10 h-10 border-2 border-white/20 border-t-pink-400 rounded-full animate-spin" />
      <p className="text-white/50 text-sm">Đang tải số liệu hệ thống...</p>
    </div>
  );

  if (error || !stats) return (
    <div className="glass-card p-8 text-center max-w-md mx-auto my-12">
      <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
      <h3 className="text-white font-bold text-lg mb-1">Không thể tải dữ liệu</h3>
      <p className="text-rose-300 text-xs sm:text-sm mb-4">{error || "Lỗi kết nối máy chủ Firebase"}</p>
      <button
        onClick={onRetry}
        className="px-5 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold transition cursor-pointer inline-flex items-center gap-2"
      >
        <RefreshCw className="w-4 h-4" />
        Thử lại
      </button>
    </div>
  );

  const themeTotal = Object.values(stats.themeDistribution).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Tổng thiệp" value={stats.totalCards} sub={`+${stats.cardsThisWeek} tuần này`} icon={CreditCard} color="#f472b6" />
        <StatCard label="Tổng lời chúc" value={stats.totalWishes} sub={`+${stats.wishesThisWeek} tuần này`} icon={MessageSquare} color="#a78bfa" />
        <StatCard label="Đã mở" value={stats.revealedCards} sub="thiệp đã reveal" icon={CheckCircle} color="#34d399" />
        <StatCard label="Chưa mở" value={stats.pendingCards} sub="đang đếm ngược" icon={Clock} color="#fbbf24" />
      </div>

      {/* Theme Distribution */}
      <div className="glass-card p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-pink-400" />
          Phân bố tông màu thiệp
        </h3>
        <div className="space-y-3">
          {Object.entries(stats.themeDistribution)
            .sort((a, b) => b[1] - a[1])
            .map(([theme, count]) => {
              const t = THEMES[theme as keyof typeof THEMES];
              const pct = Math.round((count / themeTotal) * 100);
              return (
                <div key={theme}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white/70 capitalize">{t?.label ?? theme}</span>
                    <span className="text-white/50">{count} thiệp ({pct}%)</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
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
  onDeleteWish: (wishId: string) => Promise<void>;
}) {
  const { adminFetch } = useAdminFetch();
  const [wishes, setWishes] = useState<AdminWish[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);

  useEffect(() => {
    adminFetch(`/api/admin/wishes?cardId=${card.id}`)
      .then((r) => r.json())
      .then((d) => setWishes(d.wishes ?? []))
      .finally(() => setLoading(false));
  }, [card.id, adminFetch]);

  const handleDeleteWish = async (wishId: string) => {
    setDeletingId(wishId);
    await onDeleteWish(wishId);
    setWishes((prev) => prev.filter((w) => w.id !== wishId));
    setDeletingId(null);
    setConfirm(null);
  };

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://hpbd-mail.vercel.app";

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-16 overflow-y-auto">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-card w-full max-w-2xl mb-8">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div>
            <h2 className="text-white font-bold text-lg">{card.recipientName}</h2>
            <p className="text-white/50 text-xs font-mono mt-0.5">/thiep/{card.slug}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info */}
        <div className="p-5 grid grid-cols-2 gap-3 border-b border-white/10">
          {[
            { label: "Email tạo", value: card.creatorEmail ?? "—" },
            { label: "Ngày tạo", value: fmtDate(card.createdAt) },
            { label: "Ngày mở", value: fmtDate(card.revealAt) },
            { label: "Trạng thái", value: card.isRevealed ? "✅ Đã mở" : "⏳ Chưa mở" },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-white/40 text-xs uppercase tracking-wider mb-0.5">{label}</p>
              <p className="text-white/80 text-sm font-medium">{value}</p>
            </div>
          ))}
          {card.description && (
            <div className="col-span-2">
              <p className="text-white/40 text-xs uppercase tracking-wider mb-0.5">Lời tựa</p>
              <p className="text-white/80 text-sm">"{card.description}"</p>
            </div>
          )}
        </div>

        {/* Links */}
        <div className="px-5 pt-3 pb-4 border-b border-white/10 flex gap-3 flex-wrap">
          <a href={`${baseUrl}/thiep/${card.slug}`} target="_blank" rel="noreferrer"
            className="text-xs text-pink-400 hover:text-pink-300 flex items-center gap-1 transition">
            <Link2 className="w-3 h-3" /> Link gửi
          </a>
        </div>

        {/* Wishes */}
        <div className="p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-purple-400" />
            Lời chúc ({wishes.length})
          </h3>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-white/20 border-t-pink-400 rounded-full animate-spin" />
            </div>
          ) : wishes.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-6">Chưa có lời chúc nào.</p>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {wishes.map((wish) => (
                <div key={wish.id} className="bg-white/5 rounded-xl p-3 flex items-start gap-3 group">
                  <div className="flex-1 min-w-0">
                    <p className="text-pink-300 text-sm font-semibold mb-0.5">
                      {wish.authorName || "Người gửi bí mật"}
                    </p>
                    <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">{wish.message}</p>
                    <p className="text-white/30 text-xs mt-1">{fmtDate(wish.createdAt)}</p>
                  </div>
                  <button
                    onClick={() => setConfirm(wish.id)}
                    disabled={deletingId === wish.id}
                    className="w-7 h-7 rounded-lg bg-red-500/20 hover:bg-red-500/40 flex items-center justify-center text-red-400 transition opacity-0 group-hover:opacity-100 cursor-pointer shrink-0"
                  >
                    {deletingId === wish.id
                      ? <div className="w-3.5 h-3.5 border border-red-400 border-t-transparent rounded-full animate-spin" />
                      : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {confirm && (
        <ConfirmDialog
          message="Xóa lời chúc này? Hành động không thể hoàn tác."
          onConfirm={() => handleDeleteWish(confirm)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}

// ─── Tab: Cards ───────────────────────────────────────────────────────────────

function CardsTab() {
  const { adminFetch } = useAdminFetch();
  const [cards, setCards] = useState<AdminCard[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<AdminCard | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<AdminCard | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const LIMIT = 15;

  const fetchCards = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
      if (search) qs.set("search", search);
      const res = await adminFetch(`/api/admin/cards?${qs}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Không thể tải danh sách thiệp");
      }
      setCards(data.cards ?? []);
      setTotal(data.total ?? 0);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [adminFetch, page, search]);

  useEffect(() => { fetchCards(); }, [fetchCards]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleDelete = async (card: AdminCard) => {
    setDeletingId(card.id);
    try {
      await adminFetch(`/api/admin/cards/${card.id}`, { method: "DELETE" });
      setCards((prev) => prev.filter((c) => c.id !== card.id));
      setTotal((t) => t - 1);
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  };

  const handleDeleteWish = async (wishId: string) => {
    await adminFetch(`/api/admin/wishes?id=${wishId}`, { method: "DELETE" });
  };

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <div className="space-y-4">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder:text-white/30 outline-none focus:border-pink-500/50 focus:bg-white/8 transition"
            placeholder="Tìm theo tên người nhận, slug, email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <button type="submit"
          className="px-4 py-2.5 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/30 text-pink-300 text-sm font-medium transition cursor-pointer">
          Tìm
        </button>
        {search && (
          <button type="button" onClick={() => { setSearch(""); setSearchInput(""); setPage(1); }}
            className="px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 transition cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        )}
      </form>

      {/* Total */}
      <p className="text-white/40 text-sm">
        {search ? `Tìm thấy ${total} thiệp` : `Tổng cộng ${total} thiệp`}
      </p>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-white/20 border-t-pink-400 rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-300 text-sm">
            <p>{error}</p>
            <button onClick={fetchCards} className="mt-3 px-4 py-2 rounded-lg bg-pink-500/30 text-white text-xs">Thử lại</button>
          </div>
        ) : cards.length === 0 ? (
          <p className="text-white/30 text-center py-12">Không có thiệp nào.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  {["Người nhận", "Slug", "Email tạo", "Ngày tạo", "Ngày mở", "Lời chúc", "Trạng thái", ""].map((h) => (
                    <th key={h} className="text-left text-white/40 font-medium px-4 py-3 text-xs uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cards.map((card) => {
                  const t = THEMES[card.theme as keyof typeof THEMES];
                  return (
                    <tr key={card.id} className="border-b border-white/5 hover:bg-white/3 group transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full shrink-0"
                            style={{ background: t?.primary ?? "#f472b6" }} />
                          <span className="text-white font-medium max-w-[130px] truncate">{card.recipientName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-white/50 font-mono text-xs">{card.slug}</td>
                      <td className="px-4 py-3 text-white/50 max-w-[150px] truncate">{card.creatorEmail ?? "—"}</td>
                      <td className="px-4 py-3 text-white/40 whitespace-nowrap text-xs">{fmtDate(card.createdAt)}</td>
                      <td className="px-4 py-3 text-white/40 whitespace-nowrap text-xs">{fmtDate(card.revealAt)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-purple-300 font-bold">{card.wishCount}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${card.isRevealed ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
                          {card.isRevealed ? "Đã mở" : "Chưa mở"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                          <button onClick={() => setSelectedCard(card)}
                            className="w-7 h-7 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 flex items-center justify-center text-purple-300 cursor-pointer transition"
                            title="Xem chi tiết">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setConfirmDelete(card)}
                            disabled={deletingId === card.id}
                            className="w-7 h-7 rounded-lg bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center text-red-400 cursor-pointer transition"
                            title="Xóa thiệp">
                            {deletingId === card.id
                              ? <div className="w-3.5 h-3.5 border border-red-400 border-t-transparent rounded-full animate-spin" />
                              : <Trash2 className="w-3.5 h-3.5" />}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-white/50 text-sm">Trang {page}/{totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">
            <ChevronRight className="w-4 h-4" />
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
          message={`Xóa thiệp "${confirmDelete.recipientName}" và tất cả ${confirmDelete.wishCount} lời chúc? Không thể hoàn tác!`}
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}

// ─── Tab: Users ───────────────────────────────────────────────────────────────

function UsersTab() {
  const { adminFetch } = useAdminFetch();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch("/api/admin/users");
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Không thể tải danh sách tài khoản");
      setUsers(d.users ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [adminFetch]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-2 border-white/20 border-t-pink-400 rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="p-8 text-center text-rose-300 text-sm glass-card">
      <p>{error}</p>
      <button onClick={fetchUsers} className="mt-3 px-4 py-2 rounded-lg bg-pink-500/30 text-white text-xs">Thử lại</button>
    </div>
  );

  return (
    <div className="glass-card overflow-hidden">
      {users.length === 0 ? (
        <p className="text-white/30 text-center py-12">Chưa có user nào tạo thiệp.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                {["#", "Email", "Số thiệp đã tạo", "Thiệp gần nhất"].map((h) => (
                  <th key={h} className="text-left text-white/40 font-medium px-4 py-3 text-xs uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, idx) => (
                <tr key={u.userId} className="border-b border-white/5 hover:bg-white/3 transition">
                  <td className="px-4 py-3 text-white/30 text-xs">{idx + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {u.email[0].toUpperCase()}
                      </div>
                      <span className="text-white/80 max-w-[220px] truncate">{u.email}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-pink-300 font-bold text-base">{u.cardCount}</span>
                    <span className="text-white/40 text-xs ml-1">thiệp</span>
                  </td>
                  <td className="px-4 py-3 text-white/40 text-xs">{fmtDate(u.latestCardAt)}</td>
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
  const { adminFetch } = useAdminFetch();
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async () => {
    if (!user) return;
    setStatsLoading(true);
    setStatsError(null);
    try {
      const res = await adminFetch("/api/admin/stats");
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Lỗi truy vấn thống kê");
      }
      setStats(data);
    } catch (e: unknown) {
      setStatsError(e instanceof Error ? e.message : String(e));
    } finally {
      setStatsLoading(false);
    }
  }, [adminFetch, user]);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user, fetchStats]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  return (
    <main
      className="min-h-[calc(100vh-4rem)] pt-20 sm:pt-24 pb-16 px-4 sm:px-6"
      style={{
        background: "radial-gradient(ellipse at top, #2d0a3e22, transparent 60%), radial-gradient(ellipse at bottom, #0d1b3e22, transparent 60%), #050508",
      }}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Page Header (No duplicate topbar, clean integrated title) */}
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
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
              <span>Làm mới số liệu</span>
            </button>
          </div>
        </div>

        {/* Tabs Selection */}
        <div className="flex gap-1.5 bg-white/5 p-1 rounded-xl border border-white/8 w-fit">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer ${
                activeTab === id
                  ? "bg-gradient-to-r from-pink-500/30 to-purple-500/30 text-white border border-white/15 shadow-sm"
                  : "text-white/50 hover:text-white hover:bg-white/5"
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
            onRetry={fetchStats}
          />
        )}
        {activeTab === "cards" && <CardsTab />}
        {activeTab === "users" && <UsersTab />}
      </div>
    </main>
  );
}
