"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { ThemeKey, CelebrationEffectKey } from "@/lib/utils";
import { THEMES, formatRevealTime } from "@/lib/utils";
import BirthdayCake from "@/components/BirthdayCake";
import AmbientCakeDecorations from "@/components/AmbientCakeDecorations";
import CountdownTimer from "@/components/CountdownTimer";
import CelebrationEffect from "@/components/CelebrationEffect";
import StarField from "@/components/StarField";
import Envelope from "@/components/Envelope";
import PolaroidStack from "@/components/PolaroidStack";
import { useAuth } from "@/lib/auth-context";

interface StatusData {
  isRevealed: boolean;
  serverTime: number;
  revealAt: number;
  wishCount: number;
  recipientName: string;
  theme: ThemeKey;
  description?: string | null;
  imageUrl?: string | null;
  imageUrls?: string[];
  isCreator: boolean;
  ownerUserId?: string | null;
  celebrationEffect?: CelebrationEffectKey;
}

interface Wish {
  id: string;
  authorName: string;
  message: string;
  createdAt: string;
}

// ─── Colour palettes for mini envelope cards ──────────────────────────────────
const ENVELOPE_PALETTES = [
  { body: "#ffd6e0", flap: "#ffb3c6", accent: "#e8738a", tape: "#fce38a" },
  { body: "#c8e6ff", flap: "#93cbff", accent: "#4a9fd4", tape: "#bde0fe" },
  { body: "#d8f3dc", flap: "#b7e4c7", accent: "#52b788", tape: "#b8f0c8" },
  { body: "#e9d5ff", flap: "#d8b4fe", accent: "#9b72cf", tape: "#e0d0ff" },
  { body: "#fef3c7", flap: "#fde68a", accent: "#d97706", tape: "#fce38a" },
  { body: "#fce7f3", flap: "#fbcfe8", accent: "#db2777", tape: "#ffd6e0" },
];
const ROTATIONS = [-2, 1.5, -1, 2.2, -1.8, 1.2, -1.5, 1.8];

// ─── Mini Envelope Card (in gallery) ─────────────────────────────────────────
function MiniEnvelopeCard({
  wish,
  index,
  isOpened,
  onClick,
}: {
  wish: Wish;
  index: number;
  isOpened: boolean;
  onClick: () => void;
}) {
  const pal = ENVELOPE_PALETTES[index % ENVELOPE_PALETTES.length];
  const rotate = ROTATIONS[index % ROTATIONS.length];
  const displayName =
    !wish.authorName ||
    wish.authorName.toLowerCase().includes("bí mật") ||
    wish.authorName.toLowerCase().includes("ẩn danh")
      ? "Người gửi bí mật"
      : wish.authorName;

  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.06 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
      style={{ rotate: `${rotate}deg` }}
      className="w-full max-w-[115px] sm:max-w-[145px] md:max-w-[160px] relative cursor-pointer focus:outline-none group flex flex-col items-center select-none"
      aria-label={`Mở thiệp từ ${displayName}`}
    >
      {/* Envelope Container */}
      <div
        className="relative w-full aspect-[16/11] rounded-xl sm:rounded-2xl transition-all duration-300"
        style={{
          backgroundColor: pal.body,
          boxShadow: isOpened
            ? "0 3px 10px rgba(0,0,0,0.25)"
            : "0 8px 18px rgba(0,0,0,0.35), 0 2px 5px rgba(0,0,0,0.2)",
        }}
      >
        {/* If opened: The Letter Paper is Peeking Out from inside the envelope! */}
        {isOpened && (
          <div
            className="absolute left-2 right-2 -top-3 sm:-top-3.5 h-8 sm:h-10 rounded-t-md sm:rounded-t-lg bg-[#fffdf0] border-t border-x border-black/10 px-1.5 pt-1 shadow-sm overflow-hidden z-0"
            style={{
              backgroundImage: "repeating-linear-gradient(transparent, transparent 8px, #e8e0c8 8px, #e8e0c8 9px)",
            }}
          >
            <p className="font-note text-[8px] sm:text-[10px] text-gray-700 truncate leading-tight italic">
              {wish.message}
            </p>
          </div>
        )}

        {/* Envelope Body Folds */}
        <svg
          className="absolute inset-0 w-full h-full rounded-xl sm:rounded-2xl overflow-hidden z-10 pointer-events-none"
          viewBox="0 0 208 128"
          preserveAspectRatio="none"
        >
          {/* Bottom pocket triangles */}
          <path d="M0,128 L104,70 L0,70 Z" fill={pal.flap} opacity="0.4" />
          <path d="M208,128 L104,70 L208,70 Z" fill={pal.flap} opacity="0.4" />
          <path d="M0,128 L104,65 L208,128 Z" fill={pal.flap} opacity="0.65" />

          {/* Flap: Open (Upwards) or Closed (Downwards) */}
          {isOpened ? (
            /* Open Flap turned upward */
            <path d="M0,0 L104,-28 L208,0 Z" fill={pal.flap} opacity="0.9" />
          ) : (
            /* Closed Flap pointing down */
            <path d="M0,0 L104,58 L208,0 Z" fill={pal.flap} opacity="0.95" />
          )}

          {/* Outline creases */}
          <line x1="0" y1="128" x2="104" y2="65" stroke={pal.accent} strokeWidth="1" opacity="0.2" />
          <line x1="208" y1="128" x2="104" y2="65" stroke={pal.accent} strokeWidth="1" opacity="0.2" />
        </svg>

        {/* Wax Seal Stamp (if NOT opened) */}
        {!isOpened ? (
          <div
            className="absolute top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-white text-[9px] sm:text-xs font-bold shadow-md z-20 group-hover:scale-110 transition"
            style={{
              background: `radial-gradient(circle, ${pal.accent}, ${pal.flap})`,
              border: "1px solid rgba(255,255,255,0.5)",
            }}
          >
            ✦
          </div>
        ) : (
          /* Opened Badge */
          <div className="absolute bottom-1 right-1 sm:bottom-1.5 sm:right-1.5 px-1 py-0.5 rounded bg-black/25 text-white text-[8px] sm:text-[9px] font-medium tracking-wide z-20">
            ✓ Đã đọc
          </div>
        )}

        {/* Washi tape strip at top (if closed) */}
        {!isOpened && (
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-8 sm:w-10 h-2 sm:h-2.5 rounded-b-xs sm:rounded-b-sm z-20 opacity-80"
            style={{ background: pal.tape }}
          />
        )}
      </div>

      {/* Sender Name label */}
      <div className="mt-1 text-center w-full px-0.5">
        <span
          className="font-note text-[11px] sm:text-xs md:text-sm font-bold truncate block"
          style={{
            color: isOpened ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.95)",
          }}
        >
          {displayName}
        </span>
      </div>
    </motion.button>
  );
}

// ─── Wish Reveal Modal ────────────────────────────────────────────────────────
function WishRevealModal({
  wish,
  index,
  isInitiallyOpened,
  theme,
  onClose,
}: {
  wish: Wish;
  index: number;
  isInitiallyOpened: boolean;
  theme: ThemeKey;
  onClose: () => void;
}) {
  const pal = ENVELOPE_PALETTES[index % ENVELOPE_PALETTES.length];

  // If already opened previously, start directly at 'open'
  const [phase, setPhase] = useState<"sealed" | "opening" | "open">(
    isInitiallyOpened ? "open" : "sealed"
  );

  const isAnon =
    !wish.authorName ||
    wish.authorName.toLowerCase().includes("bí mật") ||
    wish.authorName.toLowerCase().includes("ẩn danh");

  const displayName = isAnon ? "Người gửi bí mật" : wish.authorName;
  const initial = isAnon ? "✦" : wish.authorName.charAt(0).toUpperCase();

  const handleOpen = () => {
    if (phase !== "sealed") return;
    setPhase("opening");
    setTimeout(() => setPhase("open"), 450);
  };

  const PAPER_STYLES = [
    { bg: "#fffdf0", lines: "#f0e8c8", margin: "#f093b0", authorBg: "#e8738a" },
    { bg: "#f0f5ff", lines: "#d5e3f8", margin: "#c8b4f8", authorBg: "#7c6cf0" },
    { bg: "#f3fff5", lines: "#d5f0d5", margin: "#fcd38a", authorBg: "#50c87a" },
    { bg: "#fdf5ff", lines: "#ebd5f8", margin: "#a8e8d8", authorBg: "#a855f7" },
    { bg: "#fffef0", lines: "#f0eac8", margin: "#74c0fc", authorBg: "#4dabf7" },
    { bg: "#fff5f8", lines: "#f5d5e5", margin: "#a8d8f0", authorBg: "#e06090" },
  ];
  const paper = PAPER_STYLES[index % PAPER_STYLES.length];

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 backdrop-blur-md"
        style={{ background: "rgba(5,5,8,0.85)" }}
        onClick={onClose}
      />

      {/* Modal content */}
      <motion.div
        className="relative z-10 flex flex-col items-center w-full max-w-sm sm:max-w-md"
        initial={{ scale: 0.85, opacity: 0, y: 25 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="self-end mb-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
        >
          ✕ Đóng thư
        </button>

        {/* ── Envelope Header Box ────────────────────────────────────────── */}
        <div
          className="relative w-full rounded-2xl overflow-hidden shadow-2xl transition-all duration-300"
          style={{
            height: phase === "open" ? 80 : 170,
            backgroundColor: pal.body,
          }}
        >
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 180" preserveAspectRatio="none">
            <path d="M0,180 L200,95 L400,180 Z" fill={pal.flap} opacity="0.6" />
            {phase !== "open" ? (
              <path d="M0,0 L200,90 L400,0 Z" fill={pal.flap} opacity="0.9" />
            ) : (
              <path d="M0,0 L200,-40 L400,0 Z" fill={pal.flap} opacity="0.9" />
            )}
          </svg>

          {/* Seal button when sealed */}
          {phase === "sealed" && (
            <motion.button
              type="button"
              onClick={handleOpen}
              className="absolute top-[85px] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 cursor-pointer group focus:outline-none"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-xl"
                style={{
                  background: `radial-gradient(circle, ${pal.accent}, ${pal.flap})`,
                  border: "2px solid rgba(255,255,255,0.6)",
                }}
              >
                ✦
              </div>
              <span className="font-note text-xs font-bold text-gray-800 bg-white/80 px-2.5 py-0.5 rounded-full shadow-sm">
                Bấm để bóc thư
              </span>
            </motion.button>
          )}

          {phase === "opening" && (
            <div className="absolute inset-0 flex items-center justify-center font-note text-base font-bold text-gray-800 animate-pulse">
              Đang mở thư...
            </div>
          )}
        </div>

        {/* ── Letter Note Paper (Slides Out) ─────────────────────────────── */}
        <AnimatePresence>
          {phase === "open" && (
            <motion.div
              className="w-full rounded-2xl overflow-hidden -mt-4 z-20 shadow-2xl relative"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              style={{
                backgroundColor: paper.bg,
                backgroundImage: `repeating-linear-gradient(transparent, transparent 27px, ${paper.lines} 27px, ${paper.lines} 28.5px)`,
                backgroundPositionY: "36px",
              }}
            >
              {/* Left margin line */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: 36,
                  width: 1.5,
                  background: paper.margin,
                  opacity: 0.6,
                }}
              />

              {/* Content */}
              <div className="pl-12 pr-5 pt-6 pb-5">
                <p className="font-note text-lg sm:text-xl leading-[28px] text-gray-900 mb-5 font-medium whitespace-pre-wrap max-h-72 overflow-y-auto">
                  {wish.message}
                </p>

                {/* Author Footer */}
                <div
                  className="flex items-center justify-between pt-3"
                  style={{ borderTop: `1.5px solid ${paper.lines}` }}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm select-none shrink-0"
                      style={{ background: paper.authorBg }}
                    >
                      {initial}
                    </div>
                    <span className="font-note font-bold text-base text-gray-900">
                      {displayName}
                    </span>
                  </div>

                  {isAnon && (
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-black/10 text-gray-600 tracking-wider">
                      Ẩn danh
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// ─── Countdown Screen ─────────────────────────────────────────────────────────
function CountdownScreen({ status, onReveal }: { status: StatusData; onReveal: () => void }) {
  const t = THEMES[status.theme];
  return (
    <main
      className="min-h-[calc(100vh-4rem)] relative flex items-center justify-center p-4"
      style={{
        background: `radial-gradient(ellipse at top, ${t.primary}15, transparent 60%),
                     radial-gradient(ellipse at bottom, ${t.secondary}10, transparent 60%), #050508`,
      }}
    >
      <StarField color={t.primary} />
      <div
        className="fixed inset-0 flex items-center justify-center pointer-events-none opacity-10 blur-lg"
        aria-hidden
      >
        <BirthdayCake theme={status.theme} isRevealed={false} />
      </div>

      <div className="relative z-10 text-center max-w-lg w-full fade-in-up">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: `linear-gradient(135deg, ${t.primary}25, ${t.secondary}15)`, border: `1px solid ${t.primary}40` }}
          >
            <svg className="w-7 h-7 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="5" y="11" width="14" height="10" rx="2" strokeWidth="2" />
              <path d="M8 11V7a4 4 0 118 0v4" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="font-script text-4xl sm:text-6xl text-white mb-2">Sắp mở thiệp...</h1>
          <p className="text-white/60 mb-1 text-sm sm:text-base">
            Dành cho <span className="font-semibold text-white" style={{ color: t.primary }}>{status.recipientName}</span>
          </p>
          <p className="text-white/40 text-xs sm:text-sm mb-8">
            Thời điểm mở: {formatRevealTime(new Date(status.revealAt))} (Giờ VN)
          </p>
          <div className="mb-8">
            <CountdownTimer revealAt={status.revealAt} serverTime={status.serverTime} onReveal={onReveal} />
          </div>
          {status.wishCount > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="glass-card px-6 py-2.5 inline-block">
              <p className="text-white/70 text-xs sm:text-sm">
                📮 Đã có <span className="text-white font-bold">{status.wishCount}</span> phong bì lời chúc đang chờ bạn mở
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </main>
  );
}

// ─── Reveal Screen ────────────────────────────────────────────────────────────
function RevealScreen({ status, wishes, slug }: { status: StatusData; wishes: Wish[]; slug: string }) {
  const t = THEMES[status.theme];
  const effect = status.celebrationEffect ?? "flowers";

  // Persistent opened IDs
  const storageKey = `opened_wishes_${slug}`;
  const [openedIds, setOpenedIds] = useState<Set<string>>(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(storageKey) : null;
      return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
    } catch {
      return new Set();
    }
  });

  const [activeWish, setActiveWish] = useState<{ wish: Wish; index: number; isOpened: boolean } | null>(null);

  const markOpened = useCallback((id: string) => {
    setOpenedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      try { localStorage.setItem(storageKey, JSON.stringify([...next])); } catch { /* ignore */ }
      return next;
    });
  }, [storageKey]);

  const handleOpenWish = (wish: Wish, index: number) => {
    const isAlreadyOpened = openedIds.has(wish.id);
    setActiveWish({ wish, index, isOpened: isAlreadyOpened });
    markOpened(wish.id);
  };

  return (
    <main
      className="min-h-[calc(100vh-4rem)] relative pb-20"
      style={{
        background: `radial-gradient(ellipse at top, ${t.primary}25, transparent 50%),
                     radial-gradient(ellipse at 80% 50%, ${t.secondary}15, transparent 50%), #050508`,
      }}
    >
      <StarField color={t.primary} />

      {/* Celebration Effect */}
      <CelebrationEffect effect={effect} trigger={true} />

      {/* Wish Reveal Modal */}
      <AnimatePresence>
        {activeWish && (
          <WishRevealModal
            wish={activeWish.wish}
            index={activeWish.index}
            isInitiallyOpened={activeWish.isOpened}
            theme={status.theme}
            onClose={() => setActiveWish(null)}
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-8 sm:pt-12">
        {/* Cake with Ambient Dynamic Decorations */}
        <motion.div
          initial={{ scale: 0.3, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex justify-center mb-6"
        >
          <div className="relative inline-block">
            <AmbientCakeDecorations effect={effect} />
            <BirthdayCake theme={status.theme} isRevealed={true} />
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-6"
        >
          <h1 className="font-script text-5xl sm:text-7xl gradient-text mb-2">Happy Birthday!</h1>
          <p className="font-display text-2xl sm:text-4xl text-white/95 font-bold tracking-wide">
            {status.recipientName}
          </p>
        </motion.div>

        {/* Multi-Image Polaroid Stack */}
        {((status.imageUrls && status.imageUrls.length > 0) || status.imageUrl) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-8 flex justify-center"
          >
            <PolaroidStack
              images={status.imageUrls && status.imageUrls.length > 0 ? status.imageUrls : [status.imageUrl!]}
              recipientName={status.recipientName}
            />
          </motion.div>
        )}

        {/* Description note */}
        {status.description && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-10 max-w-xl mx-auto"
          >
            <div
              style={{
                position: "relative",
                backgroundColor: "#fffdf0",
                backgroundImage: "repeating-linear-gradient(transparent, transparent 27px, #f0e8c8 27px, #f0e8c8 28.5px)",
                backgroundPositionY: "40px",
                borderRadius: 8,
                boxShadow: "0 8px 24px rgba(0,0,0,0.22)",
                transform: "rotate(0.6deg)",
              }}
            >
              <div style={{ position: "absolute", top: 0, bottom: 0, left: 36, width: 1.5, background: "#f4a8b5", opacity: 0.6 }} />
              <div style={{ paddingLeft: 48, paddingRight: 20, paddingTop: 20, paddingBottom: 18 }}>
                <p className="font-note text-lg sm:text-xl leading-[28px] text-gray-800 text-center font-medium">
                  "{status.description}"
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Divider */}
        <div
          className="h-px my-8"
          style={{ background: `linear-gradient(90deg, transparent, ${t.primary}, ${t.secondary}, transparent)` }}
        />

        {/* ─── HỘP THƯ YÊU THƯƠNG (Lưới 3 cột trên mobile, 4-5 cột trên desktop) ── */}
        <div>
          {wishes.length > 0 ? (
            <>
              <div className="text-center mb-6">
                <h2 className="font-script text-3xl sm:text-5xl text-white/90 mb-1">
                  Hộp Thư Yêu Thương
                </h2>
                <p className="text-white/50 text-xs sm:text-sm font-note">
                  Đã mở {openedIds.size}/{wishes.length} phong bì thư
                </p>
              </div>

              {/* Envelope grid: 3 cột trên điện thoại, 4-5 cột trên máy tính */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-4 md:gap-5 justify-items-center py-2">
                {wishes.map((wish, idx) => (
                  <MiniEnvelopeCard
                    key={wish.id}
                    wish={wish}
                    index={idx}
                    isOpened={openedIds.has(wish.id)}
                    onClick={() => handleOpenWish(wish, idx)}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-white/40 text-sm sm:text-base font-note text-lg">
                Chưa có phong bì lời chúc nào được gửi.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-6 border-t border-white/10">
          <p className="font-script text-2xl text-white/40">HappyBirthday</p>
        </div>
      </div>
    </main>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
function ViewPage() {
  const { user } = useAuth();
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const creatorKey = searchParams.get("key") ?? "";

  const [status, setStatus] = useState<StatusData | null>(null);
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [hasOpenedEnvelope, setHasOpenedEnvelope] = useState(false);
  const [phase, setPhase] = useState<"loading" | "countdown" | "revealed">("loading");

  const buildAuthQueryParams = useCallback(() => {
    const query = new URLSearchParams();
    if (creatorKey) query.set("key", creatorKey);
    if (user?.uid) query.set("userId", user.uid);
    const qs = query.toString();
    return qs ? `?${qs}` : "";
  }, [creatorKey, user?.uid]);

  const fetchStatus = useCallback(async () => {
    const res = await fetch(`/api/cards/${slug}/status${buildAuthQueryParams()}`);
    if (res.status === 404) { setNotFound(true); return null; }
    return res.json() as Promise<StatusData>;
  }, [slug, buildAuthQueryParams]);

  const fetchWishes = useCallback(async (retry = 2) => {
    try {
      const res = await fetch(`/api/cards/${slug}/wishes${buildAuthQueryParams()}`);
      if (res.ok) { const d = await res.json(); setWishes(d.wishes ?? []); }
      else if (retry > 0) setTimeout(() => fetchWishes(retry - 1), 1000);
    } catch { if (retry > 0) setTimeout(() => fetchWishes(retry - 1), 1000); }
  }, [slug, buildAuthQueryParams]);

  useEffect(() => {
    fetchStatus().then((data) => {
      if (!data) return;
      setStatus(data);
      if (data.isRevealed) { setPhase("revealed"); fetchWishes(); }
      else { setPhase("countdown"); }
    }).finally(() => setLoading(false));
  }, [fetchStatus, fetchWishes]);

  if (loading) return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center" style={{ background: "#050508" }}>
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/40 text-sm">Đang tải thiệp...</p>
      </div>
    </main>
  );

  if (notFound || !status) return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4" style={{ background: "#050508" }}>
      <div className="glass-card p-10 text-center max-w-sm">
        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4 text-white/40 text-xl">?</div>
        <h2 className="font-display text-xl text-white mb-2">Không tìm thấy thiệp</h2>
        <p className="text-white/50 text-sm">Liên kết không chính xác hoặc đã hết hạn.</p>
      </div>
    </main>
  );

  if (phase === "countdown") return <CountdownScreen status={status} onReveal={() => { setPhase("revealed"); fetchWishes(); }} />;

  if (!hasOpenedEnvelope) {
    const t = THEMES[status.theme];
    return (
      <main
        className="min-h-[calc(100vh-4rem)] relative flex items-center justify-center p-4"
        style={{ background: `radial-gradient(ellipse at top, ${t.primary}18, transparent 60%), radial-gradient(ellipse at bottom, ${t.secondary}12, transparent 60%), #050508` }}
      >
        <StarField color={t.primary} />
        <Envelope recipientName={status.recipientName} theme={status.theme} onOpen={() => setHasOpenedEnvelope(true)} />
      </main>
    );
  }

  return <RevealScreen status={status} wishes={wishes} slug={slug} />;
}

function LoadingFallback() {
  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center" style={{ background: "#050508" }}>
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/40 text-sm">Đang tải...</p>
      </div>
    </main>
  );
}

export default function ViewPageWrapper() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ViewPage />
    </Suspense>
  );
}
