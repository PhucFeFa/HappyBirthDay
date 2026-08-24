/**
 * Firebase Admin SDK – Server-side only
 * Chỉ dùng trong API routes, KHÔNG import trong component client-side
 */
import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getAuth, Auth } from "firebase-admin/auth";

let adminApp: App;
let adminDb: Firestore;
let adminAuth: Auth;

function getPrivateKey(): string | undefined {
  let key = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  if (!key) return undefined;
  key = key.trim();
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1);
  }
  return key.replace(/\\n/g, "\n");
}

function getAdminApp(): App {
  if (adminApp) return adminApp;

  const apps = getApps();
  if (apps.length > 0) {
    adminApp = apps[0];
    return adminApp;
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = getPrivateKey();

  if (!projectId || !clientEmail || !privateKey) {
    console.error("[Firebase Admin] Missing credentials:", {
      hasProjectId: Boolean(projectId),
      hasClientEmail: Boolean(clientEmail),
      hasPrivateKey: Boolean(privateKey),
    });
  }

  adminApp = initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });

  return adminApp;
}

export function getAdminDb(): Firestore {
  if (!adminDb) {
    adminDb = getFirestore(getAdminApp());
  }
  return adminDb;
}

export function getAdminAuth(): Auth {
  if (!adminAuth) {
    adminAuth = getAuth(getAdminApp());
  }
  return adminAuth;
}
