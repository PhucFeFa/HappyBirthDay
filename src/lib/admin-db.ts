/**
 * Admin-only database functions – server-side only
 * Dùng Firebase Admin SDK để bypass Firestore security rules
 */
import { getAdminDb } from "./firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toDate(val: unknown): Date {
  if (val instanceof Timestamp) return val.toDate();
  if (val instanceof Date) return val;
  return new Date(val as string | number);
}

function docToAdminCard(id: string, data: FirebaseFirestore.DocumentData): AdminCard {
  const revealAt = toDate(data.revealAt);
  return {
    id,
    slug: data.slug ?? "",
    recipientName: data.recipientName ?? "",
    revealAt,
    createdAt: toDate(data.createdAt),
    theme: (data.theme as ThemeKey) ?? "pink",
    wishCount: data.wishCount ?? 0,
    userId: data.userId,
    creatorEmail: data.creatorEmail,
    description: data.description,
    celebrationEffect: (data.celebrationEffect as CelebrationEffectKey) ?? "flowers",
    shareTitle: data.shareTitle,
    shareDescription: data.shareDescription,
    isRevealed: revealAt.getTime() <= Date.now(),
  };
}

// ─── Stats ───────────────────────────────────────────────────────────────────

export async function getAdminStats(): Promise<AdminStats> {
  const db = getAdminDb();
  const now = Date.now();
  const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

  const [cardsSnap, wishesSnap] = await Promise.all([
    db.collection("cards").get(),
    db.collection("wishes").get(),
  ]);

  let revealedCards = 0;
  let cardsThisWeek = 0;
  const themeDistribution: Record<string, number> = {};

  cardsSnap.docs.forEach((doc) => {
    const data = doc.data();
    const revealAt = toDate(data.revealAt);
    if (revealAt.getTime() <= now) revealedCards++;
    if (toDate(data.createdAt).getTime() >= oneWeekAgo) cardsThisWeek++;
    const theme = (data.theme as string) ?? "pink";
    themeDistribution[theme] = (themeDistribution[theme] ?? 0) + 1;
  });

  let wishesThisWeek = 0;
  wishesSnap.docs.forEach((doc) => {
    const data = doc.data();
    if (toDate(data.createdAt).getTime() >= oneWeekAgo) wishesThisWeek++;
  });

  return {
    totalCards: cardsSnap.size,
    totalWishes: wishesSnap.size,
    revealedCards,
    pendingCards: cardsSnap.size - revealedCards,
    cardsThisWeek,
    wishesThisWeek,
    themeDistribution,
  };
}

// ─── Cards ───────────────────────────────────────────────────────────────────

export async function getAllCards(options?: {
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ cards: AdminCard[]; total: number }> {
  const db = getAdminDb();
  const snap = await db.collection("cards").orderBy("createdAt", "desc").get();

  let cards = snap.docs.map((doc) => docToAdminCard(doc.id, doc.data()));

  // Client-side filtering (Firestore free tier doesn't support full-text search)
  if (options?.search) {
    const q = options.search.toLowerCase();
    cards = cards.filter(
      (c) =>
        c.recipientName.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        c.creatorEmail?.toLowerCase().includes(q) ||
        c.shareTitle?.toLowerCase().includes(q)
    );
  }

  const total = cards.length;
  const page = options?.page ?? 1;
  const limit = options?.limit ?? 20;
  const start = (page - 1) * limit;
  const paginated = cards.slice(start, start + limit);

  return { cards: paginated, total };
}

export async function getAdminCardById(cardId: string): Promise<AdminCard | null> {
  const db = getAdminDb();
  const doc = await db.collection("cards").doc(cardId).get();
  if (!doc.exists) return null;
  return docToAdminCard(doc.id, doc.data()!);
}

export async function deleteCardWithWishes(cardId: string): Promise<void> {
  const db = getAdminDb();
  const batch = db.batch();

  // Delete all wishes for this card
  const wishesSnap = await db
    .collection("wishes")
    .where("cardId", "==", cardId)
    .get();
  wishesSnap.docs.forEach((doc) => batch.delete(doc.ref));

  // Delete the card
  batch.delete(db.collection("cards").doc(cardId));

  await batch.commit();
}

// ─── Wishes ──────────────────────────────────────────────────────────────────

export async function getWishesForCard(cardId: string): Promise<AdminWish[]> {
  const db = getAdminDb();
  const snap = await db
    .collection("wishes")
    .where("cardId", "==", cardId)
    .orderBy("createdAt", "desc")
    .get();

  return snap.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      cardId: data.cardId,
      authorName: data.authorName ?? "Ẩn danh",
      message: data.message ?? "",
      createdAt: toDate(data.createdAt),
    };
  });
}

export async function deleteWish(wishId: string): Promise<void> {
  const db = getAdminDb();
  const wishRef = db.collection("wishes").doc(wishId);
  const wish = await wishRef.get();
  if (!wish.exists) throw new Error("Wish not found");

  // Decrement wishCount on card
  const cardId = wish.data()!.cardId as string;
  const cardRef = db.collection("cards").doc(cardId);
  const batch = db.batch();
  batch.delete(wishRef);
  const cardSnap = await cardRef.get();
  const currentCount = (cardSnap.data()?.wishCount as number | undefined) ?? 1;
  batch.update(cardRef, { wishCount: Math.max(0, currentCount - 1) });
  await batch.commit();
}

// ─── Users ───────────────────────────────────────────────────────────────────

export interface AdminUserSummary {
  userId: string;
  email: string;
  cardCount: number;
  latestCardAt?: Date;
}

export async function getAllUserSummaries(): Promise<AdminUserSummary[]> {
  const db = getAdminDb();
  const snap = await db.collection("cards").get();

  const userMap = new Map<string, { email: string; cardCount: number; latestCardAt?: Date }>();

  snap.docs.forEach((doc) => {
    const data = doc.data();
    const userId = data.userId as string | undefined;
    const email = data.creatorEmail as string | undefined;
    if (!userId || !email) return;

    const existing = userMap.get(userId);
    const createdAt = toDate(data.createdAt);
    if (!existing) {
      userMap.set(userId, { email, cardCount: 1, latestCardAt: createdAt });
    } else {
      existing.cardCount++;
      if (!existing.latestCardAt || createdAt > existing.latestCardAt) {
        existing.latestCardAt = createdAt;
      }
    }
  });

  return Array.from(userMap.entries())
    .map(([userId, val]) => ({ userId, ...val }))
    .sort((a, b) => b.cardCount - a.cardCount);
}
