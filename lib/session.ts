"use server";

import { cookies } from "next/headers";
import { prisma } from "./prisma";
import type { SessionUser } from "./types";

const SESSION_COOKIE = "preexcellantia_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 jours

// ─── Encodage simple Base64 ─────────────────────────────────────────

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

// ─── Récupération et validation de session ─────────────────────────
// Vérifie que l'utilisateur existe toujours en base et est actif.
// Si le compte a été supprimé ou désactivé, le cookie obsolète est purgé.

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (!raw) return null;

  const session = decode(raw);
  if (!session || !session.id) return null;

  try {
    // Vérification d'existence et de statut dans la base de données
    const dbUser = await prisma.user.findUnique({
      where: { id: session.id },
      select: { id: true, isActive: true, role: true, fullname: true, code: true },
    });

    if (!dbUser || !dbUser.isActive) {
      // Compte supprimé ou désactivé : purge du cookie obsolète
      cookieStore.delete(SESSION_COOKIE);
      return null;
    }

    return {
      id: dbUser.id,
      fullname: dbUser.fullname,
      code: dbUser.code,
      role: dbUser.role,
      isActive: dbUser.isActive,
    };
  } catch (error) {
    // En cas d'erreur ponctuelle de connexion, retourner la session décodée temporairement
    return session;
  }
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

