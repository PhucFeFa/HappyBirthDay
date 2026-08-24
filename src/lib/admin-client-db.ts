import {
  collection,
  doc,
  getDocs,
  deleteDoc,
  updateDoc,
  increment,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { ThemeKey, CelebrationEffectKey } from "./utils";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AdminCard {
  id: string;
  slug: string;
  recipientName: string;
  revealAt: Date;
  createdAt: Date;
  theme: ThemeKey;
  wishCount: number;
  userId?: string;
  creatorEmail?: string;
  description?: string;
  celebrationEffect?: CelebrationEffectKey;
  shareTitle?: string;
  shareDescription?: string;
  isRevealed: boolean;
}

export interface AdminWish {
  id: string;
  cardId: string;
  authorName: string;
  message: string;
  createdAt: Date;
}

export interface AdminStats {
  totalCards: number;
  totalWishes: number;
  revealedCards: number;
  pendingCards: number;
  cardsThisWeek: number;
  wishesThisWeek: number;
  themeDistribution: Record<string, number>;
}

export interface AdminUserSummary {
  userId: string;
  email: string;
  cardCount: number;
  latestCardAt?: Date;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toDate(val: unknown): Date {
  if (!val) return new Date(0);
  if (val instanceof Timestamp) return val.toDate();
  if (val instanceof Date) return val;
  if (typeof val === "number" || typeof val === "string") {
    const d = new Date(val);
    return isNaN(d.getTime()) ? new Date(0) : d;
  }
  return new Date(0);
}

// ─── Stats & Cards ───────────────────────────────────────────────────────────

export async function fetchAdminStatsDirect(): Promise<AdminStats> {
  const [cardsSnap, wishesSnap] = await Promise.all([
    getDocs(collection(db, "cards")),
    getDocs(collection(db, "wishes")),
  ]);

  const now = Date.now();
  const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

  let revealedCards = 0;
  let cardsThisWeek = 0;
  const themeDistribution: Record<string, number> = {};

  cardsSnap.docs.forEach((d) => {
    const data = d.data();
    try {
      const revealAt = toDate(data.revealAt);
      if (revealAt.getTime() <= now) revealedCards++;
    } catch { /* skip */ }

    try {
      const createdAt = toDate(data.createdAt);
      if (createdAt.getTime() >= oneWeekAgo) cardsThisWeek++;
    } catch { /* skip */ }

    const theme = (data.theme as string) || "pink";
    themeDistribution[theme] = (themeDistribution[theme] ?? 0) + 1;
  });

  let wishesThisWeek = 0;
  wishesSnap.docs.forEach((d) => {
    const data = d.data();
    try {
      const createdAt = toDate(data.createdAt);
      if (createdAt.getTime() >= oneWeekAgo) wishesThisWeek++;
    } catch { /* skip */ }
  });

  return {
    totalCards: cardsSnap.size,
    totalWishes: wishesSnap.size,
    revealedCards,
    pendingCards: Math.max(0, cardsSnap.size - revealedCards),
    cardsThisWeek,
    wishesThisWeek,
    themeDistribution,
  };
}

export async function fetchAllCardsDirect(): Promise<AdminCard[]> {
  const snap = await getDocs(collection(db, "cards"));
  const now = Date.now();

  const list: AdminCard[] = snap.docs.map((d) => {
    const data = d.data();
    const revealAt = toDate(data.revealAt);
    const createdAt = toDate(data.createdAt);

    return {
      id: d.id,
      slug: data.slug || "",
      recipientName: data.recipientName || "(Chưa đặt tên)",
      revealAt,
      createdAt,
      theme: (data.theme as ThemeKey) || "pink",
      wishCount: typeof data.wishCount === "number" ? data.wishCount : 0,
      userId: data.userId,
      creatorEmail: data.creatorEmail,
      description: data.description,
      celebrationEffect: (data.celebrationEffect as CelebrationEffectKey) || "flowers",
      shareTitle: data.shareTitle,
      shareDescription: data.shareDescription,
      isRevealed: revealAt.getTime() <= now,
    };
  });

  // Sắp xếp mới nhất lên đầu
  list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return list;
}

export async function fetchWishesForCardDirect(cardId: string): Promise<AdminWish[]> {
  const q = query(collection(db, "wishes"), where("cardId", "==", cardId));
  const snap = await getDocs(q);

  const list: AdminWish[] = snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      cardId: data.cardId,
      authorName: data.authorName || "Người gửi bí mật",
      message: data.message || "",
      createdAt: toDate(data.createdAt),
    };
  });

  list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return list;
}

export async function deleteCardDirect(cardId: string): Promise<void> {
  // 1. Xóa tất cả lời chúc thuộc thiệp này
  const q = query(collection(db, "wishes"), where("cardId", "==", cardId));
  const wishesSnap = await getDocs(q);
  const deleteWishesPromises = wishesSnap.docs.map((d) => deleteDoc(doc(db, "wishes", d.id)));
  await Promise.all(deleteWishesPromises);

  // 2. Xóa thiệp
  await deleteDoc(doc(db, "cards", cardId));
}

export async function deleteWishDirect(wishId: string, cardId: string): Promise<void> {
  await deleteDoc(doc(db, "wishes", wishId));
  try {
    const cardRef = doc(db, "cards", cardId);
    await updateDoc(cardRef, { wishCount: increment(-1) });
  } catch {
    /* ignore if card was deleted */
  }
}

export async function fetchAllUsersDirect(): Promise<AdminUserSummary[]> {
  const cards = await fetchAllCardsDirect();
  const map = new Map<string, { email: string; cardCount: number; latestCardAt?: Date }>();

  cards.forEach((c) => {
    const email = c.creatorEmail || (c.userId ? `User ${c.userId.slice(0, 8)}` : null);
    const id = c.userId || c.creatorEmail || c.id;

    if (!email) return;

    const existing = map.get(id);
    if (!existing) {
      map.set(id, { email, cardCount: 1, latestCardAt: c.createdAt });
    } else {
      existing.cardCount++;
      if (!existing.latestCardAt || c.createdAt > existing.latestCardAt) {
        existing.latestCardAt = c.createdAt;
      }
    }
  });

  return Array.from(map.entries())
    .map(([userId, val]) => ({ userId, ...val }))
    .sort((a, b) => b.cardCount - a.cardCount);
}
