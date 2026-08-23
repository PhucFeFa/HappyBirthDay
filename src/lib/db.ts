import {
  collection,
  doc,
  getDocs,
  addDoc,
  query,
  where,
  Timestamp,
  updateDoc,
  deleteDoc,
  increment,
} from "firebase/firestore";
import { db } from "./firebase";
import { ThemeKey, CelebrationEffectKey } from "./utils";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface Card {
  id: string;
  slug: string;
  creatorToken: string;
  recipientName: string;
  revealAt: Date;
  theme: ThemeKey;
  createdAt: Date;
  wishCount: number;
  description?: string;
  imageUrl?: string;
  imageUrls?: string[];
  userId?: string;
  creatorEmail?: string;
  celebrationEffect?: CelebrationEffectKey;
  shareTitle?: string;
  shareDescription?: string;
}

export interface Wish {
  id: string;
  cardId: string;
  authorName: string;
  message: string;
  createdAt: Date;
}

export interface CreateCardInput {
  slug: string;
  creatorToken: string;
  recipientName: string;
  revealAt: Date;
  theme: ThemeKey;
  description?: string;
  imageUrl?: string;
  imageUrls?: string[];
  userId?: string;
  creatorEmail?: string;
  celebrationEffect?: CelebrationEffectKey;
  shareTitle?: string;
  shareDescription?: string;
}

export interface CreateWishInput {
  cardId: string;
  authorName: string;
  message: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toDate(val: unknown): Date {
  if (val instanceof Timestamp) return val.toDate();
  if (val instanceof Date) return val;
  return new Date(val as string | number);
}

// ─── Cards ───────────────────────────────────────────────────────────────────

export async function createCard(input: CreateCardInput): Promise<Card> {
  const payload: Record<string, unknown> = {
    slug: input.slug,
    creatorToken: input.creatorToken,
    recipientName: input.recipientName,
    revealAt: Timestamp.fromDate(input.revealAt),
    theme: input.theme,
    createdAt: Timestamp.now(),
    wishCount: 0,
    celebrationEffect: input.celebrationEffect ?? "flowers",
  };

  if (input.description) payload.description = input.description.trim();
  if (input.imageUrl) payload.imageUrl = input.imageUrl.trim();
  if (input.imageUrls && input.imageUrls.length > 0) payload.imageUrls = input.imageUrls;
  if (input.userId) payload.userId = input.userId;
  if (input.creatorEmail) payload.creatorEmail = input.creatorEmail;
  if (input.shareTitle) payload.shareTitle = input.shareTitle.trim();
  if (input.shareDescription) payload.shareDescription = input.shareDescription.trim();

  const docRef = await addDoc(collection(db, "cards"), payload);

  return {
    id: docRef.id,
    ...input,
    celebrationEffect: input.celebrationEffect ?? "flowers",
    createdAt: new Date(),
    wishCount: 0,
  };
}

export async function getCardBySlug(slug: string): Promise<Card | null> {
  const q = query(collection(db, "cards"), where("slug", "==", slug));
  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;

  const d = snapshot.docs[0];
  const data = d.data();

  return {
    id: d.id,
    slug: data.slug,
    creatorToken: data.creatorToken,
    recipientName: data.recipientName,
    revealAt: toDate(data.revealAt),
    theme: data.theme as ThemeKey,
    createdAt: toDate(data.createdAt),
    wishCount: data.wishCount ?? 0,
    description: data.description,
    imageUrl: data.imageUrl,
    imageUrls: data.imageUrls || (data.imageUrl ? [data.imageUrl] : undefined),
    userId: data.userId,
    creatorEmail: data.creatorEmail,
    celebrationEffect: (data.celebrationEffect as CelebrationEffectKey) ?? "flowers",
    shareTitle: data.shareTitle,
    shareDescription: data.shareDescription,
  };
}

export async function getCardsByUserId(userId: string): Promise<Card[]> {
  const q = query(collection(db, "cards"), where("userId", "==", userId));
  const snapshot = await getDocs(q);

  const list: Card[] = snapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      slug: data.slug,
      creatorToken: data.creatorToken,
      recipientName: data.recipientName,
      revealAt: toDate(data.revealAt),
      theme: data.theme as ThemeKey,
      createdAt: toDate(data.createdAt),
      wishCount: data.wishCount ?? 0,
      description: data.description,
      imageUrl: data.imageUrl,
      imageUrls: data.imageUrls || (data.imageUrl ? [data.imageUrl] : undefined),
      userId: data.userId,
      creatorEmail: data.creatorEmail,
      celebrationEffect: (data.celebrationEffect as CelebrationEffectKey) ?? "flowers",
      shareTitle: data.shareTitle,
      shareDescription: data.shareDescription,
    };
  });

  // Sort by createdAt descending (mới nhất lên đầu)
  list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return list;
}

export async function updateCard(
  cardId: string,
  updates: Partial<Omit<Card, "id" | "slug" | "creatorToken" | "createdAt" | "wishCount">>
): Promise<void> {
  const docRef = doc(db, "cards", cardId);
  const payload: Record<string, unknown> = {};

  if (updates.recipientName !== undefined) payload.recipientName = updates.recipientName.trim();
  if (updates.revealAt !== undefined) payload.revealAt = Timestamp.fromDate(updates.revealAt);
  if (updates.theme !== undefined) payload.theme = updates.theme;
  if (updates.description !== undefined) payload.description = updates.description.trim() || null;
  if (updates.imageUrl !== undefined) payload.imageUrl = updates.imageUrl || null;
  if (updates.imageUrls !== undefined) payload.imageUrls = updates.imageUrls.length > 0 ? updates.imageUrls : null;
  if (updates.celebrationEffect !== undefined) payload.celebrationEffect = updates.celebrationEffect;
  if (updates.shareTitle !== undefined) payload.shareTitle = updates.shareTitle.trim() || null;
  if (updates.shareDescription !== undefined) payload.shareDescription = updates.shareDescription.trim() || null;

  await updateDoc(docRef, payload);
}

export async function deleteCard(cardId: string): Promise<void> {
  await deleteDoc(doc(db, "cards", cardId));
}

// ─── Wishes ──────────────────────────────────────────────────────────────────

export async function addWish(input: CreateWishInput): Promise<Wish> {
  const cardRef = doc(db, "cards", input.cardId);
  const wishRef = await addDoc(collection(db, "wishes"), {
    cardId: input.cardId,
    authorName: input.authorName,
    message: input.message,
    createdAt: Timestamp.now(),
  });

  // Increment wish counter on card
  await updateDoc(cardRef, { wishCount: increment(1) });

  return {
    id: wishRef.id,
    cardId: input.cardId,
    authorName: input.authorName,
    message: input.message,
    createdAt: new Date(),
  };
}

export async function getWishesByCardId(cardId: string): Promise<Wish[]> {
  const q = query(collection(db, "wishes"), where("cardId", "==", cardId));
  const snapshot = await getDocs(q);

  const wishes: Wish[] = snapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      cardId: data.cardId,
      authorName: data.authorName,
      message: data.message,
      createdAt: toDate(data.createdAt),
    };
  });

  // Sort by createdAt ascending (lời chúc đầu tiên xuất hiện trước)
  wishes.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  return wishes;
}
