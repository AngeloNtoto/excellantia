"use server";

import { cookies } from "next/headers";
import type { SessionUser } from "./types";

const SESSION_COOKIE = "excellantia_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 jours

// ─── Encodage simple Base64 (pour SQLite / développement) ──────────────────
// En production, utiliser iron-session ou JWT signé

function encode(data: SessionUser): string {
  return Buffer.from(JSON.stringify(data)).toString("base64");
}

function decode(raw: string): SessionUser | null {
  try {
    return JSON.parse(Buffer.from(raw, "base64").toString("utf-8")) as SessionUser;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  return decode(raw);
}

export async function createSession(user: SessionUser): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, encode(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
