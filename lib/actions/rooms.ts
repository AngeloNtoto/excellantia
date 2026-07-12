"use server";

import { prisma } from "@/lib/prisma";
import { createRoomSchema, accessCodeSchema } from "@/lib/validations";
import { getSession } from "@/lib/session";
import { generateRoomQuestions } from "@/lib/questions";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { autoSubmitExpiredAttempts } from "./attempts";
import type { RoomConfig, Subject } from "@/lib/types";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/");
  return session;
}

async function requireAuth() {
  const session = await getSession();
  if (!session) redirect("/");
  return session;
}

// ─── Créer une salle ──────────────────────────────────────────────────────────

export async function createRoomAction(formData: FormData) {
  const admin = await requireAdmin();

  const raw = Object.fromEntries(formData.entries());
  const result = createRoomSchema.safeParse({
    ...raw,
    startNow: raw.startNow === "true",
  });

  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const d = result.data;

  // Calculer la répartition des difficultés
  const hardPct = 100 - d.easyPct - d.mediumPct;
  if (hardPct < 0) return { error: "La somme des pourcentages de difficulté dépasse 100%." };

  const makeSubjectDiff = (total: number) => ({
    easy: Math.round(total * d.easyPct / 100),
    medium: Math.round(total * d.mediumPct / 100),
    hard: Math.max(0, total - Math.round(total * d.easyPct / 100) - Math.round(total * d.mediumPct / 100)),
  });

  const config: RoomConfig = {
    totalQuestions: d.mathCount + d.frenchCount + d.englishCount + d.cultureCount,
    bySubject: {
      MATH: d.mathCount,
      FRENCH: d.frenchCount,
      ENGLISH: d.englishCount,
      GENERAL_CULTURE: d.cultureCount,
    },
    difficulty: {
      MATH: makeSubjectDiff(d.mathCount),
      FRENCH: makeSubjectDiff(d.frenchCount),
      ENGLISH: makeSubjectDiff(d.englishCount),
      GENERAL_CULTURE: makeSubjectDiff(d.cultureCount),
    },
    french: d.frenchPassageQuestions > 0
      ? { passageQuestions: d.frenchPassageQuestions, passages: d.frenchPassages }
      : undefined,
    english: d.englishPassageQuestions > 0
      ? { passageQuestions: d.englishPassageQuestions, passages: d.englishPassages }
      : undefined,
    generalCulture: d.cultureDrc > 0
      ? { drc: d.cultureDrc, international: d.cultureCount - d.cultureDrc }
      : undefined,
  };

  // Générer les questions
  const gen = generateRoomQuestions(config);
  if (!gen.ok) {
    return { error: gen.errors?.join("\n") ?? "Génération impossible." };
  }

  // Dates
  let startsAt: Date | null = null;
  let endsAt: Date | null = null;
  let status: "WAITING" | "SCHEDULED" | "RUNNING" = "WAITING";

  if (d.startNow) {
    startsAt = new Date();
    status = "RUNNING";
    if (d.timeMode === "ABSOLUTE") {
      endsAt = new Date(startsAt.getTime() + d.durationMin * 60_000);
    }
  } else if (d.scheduledAt) {
    startsAt = new Date(d.scheduledAt);
    status = "SCHEDULED";
    if (d.timeMode === "ABSOLUTE") {
      endsAt = new Date(startsAt.getTime() + d.durationMin * 60_000);
    }
  }

  const room = await prisma.room.create({
    data: {
      title: d.title,
      status,
      visibility: d.visibility,
      accessCode: d.visibility === "PRIVATE" ? (d.accessCode || generateAccessCode()) : null,
      timeMode: d.timeMode,
      durationMin: d.durationMin,
      startsAt,
      endsAt,
      questionIds: gen.questionIds as any,
      config: config as any,
      createdById: admin.id,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/rooms");
  redirect(`/admin/salles/${room.id}`);
}

function generateAccessCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return "EXC-" + Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
    + "-" + Array.from({ length: 2 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

// ─── Démarrer une salle maintenant ───────────────────────────────────────────

export async function startRoomNowAction(roomId: string) {
  await requireAdmin();
  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room) return { error: "Salle introuvable." };
  if (room.status === "RUNNING") return { error: "Salle déjà en cours." };
  if (room.status === "CLOSED" || room.status === "CANCELLED") return { error: "Salle terminée ou annulée." };

  const startsAt = new Date();
  const endsAt = room.timeMode === "ABSOLUTE"
    ? new Date(startsAt.getTime() + room.durationMin * 60_000)
    : null;

  await prisma.room.update({
    where: { id: roomId },
    data: { status: "RUNNING", startsAt, endsAt },
  });

  revalidatePath("/admin");
  revalidatePath(`/admin/salles/${roomId}`);
  revalidatePath("/rooms");
  return { ok: true };
}

// ─── Fermer / annuler une salle ───────────────────────────────────────────────

export async function closeRoomAction(roomId: string) {
  await requireAdmin();
  await prisma.room.update({
    where: { id: roomId },
    data: { status: "CLOSED", endsAt: new Date() },
  });
  revalidatePath("/admin");
  revalidatePath(`/admin/salles/${roomId}`);
  revalidatePath("/rooms");
  return { ok: true };
}

export async function cancelRoomAction(roomId: string) {
  await requireAdmin();
  await prisma.room.update({ where: { id: roomId }, data: { status: "CANCELLED" } });
  revalidatePath("/admin");
  revalidatePath("/rooms");
  return { ok: true };
}

// ─── Vérifier le statut des salles ───────────────────────────────
// À appeler au chargement des pages salles pour auto-démarrer les salles à l'heure
// et fermer celles dont le temps est écoulé

export async function checkRoomStatuses() {
  const now = new Date();
  
  // 1. Démarrer les salles programmées
  const scheduled = await prisma.room.findMany({
    where: { status: "SCHEDULED", startsAt: { lte: now } },
  });

  for (const room of scheduled) {
    const endsAt = room.timeMode === "ABSOLUTE" && room.startsAt
      ? new Date(room.startsAt.getTime() + room.durationMin * 60_000)
      : null;

    await prisma.room.update({
      where: { id: room.id },
      data: { status: "RUNNING", endsAt },
    });
  }

  // 2. Fermer les salles terminées
  const expired = await prisma.room.findMany({
    where: { status: "RUNNING", endsAt: { lte: now } },
  });

  for (const room of expired) {
    await prisma.room.update({
      where: { id: room.id },
      data: { status: "CLOSED" },
    });
    await autoSubmitExpiredAttempts(room.id);
  }
}

// ─── Accès salle privée ───────────────────────────────────────────────────────

export async function grantRoomAccessAction(formData: FormData) {
  const session = await requireAuth();
  const raw = { code: formData.get("code") as string, roomId: formData.get("roomId") as string };
  const result = accessCodeSchema.safeParse(raw);
  if (!result.success) return { error: result.error.issues[0].message };

  const room = await prisma.room.findUnique({ where: { id: result.data.roomId } });
  if (!room) return { error: "Salle introuvable." };
  if (room.accessCode !== result.data.code) return { error: "Code d'accès incorrect." };

  await prisma.roomAccess.upsert({
    where: { roomId_userId: { roomId: room.id, userId: session.id } },
    create: { roomId: room.id, userId: session.id },
    update: {},
  });

  revalidatePath("/rooms");
  return { ok: true };
}

// ─── Suppression salle ────────────────────────────────────────────────────────

export async function deleteRoomAction(roomId: string) {
  const session = await requireAuth();
  if (session.role !== "ADMIN") {
    return { error: "Non autorisé" };
  }

  try {
    // Delete room and cascade delete its attempts due to Prisma relations
    // Ensure you have onDelete: Cascade in prisma schema for related attempts/accesses or manually delete them
    // Assuming attempts and roomAccess have onDelete: Cascade. Let's delete manually to be safe if not configured.
    await prisma.$transaction([
      prisma.answer.deleteMany({ where: { attempt: { roomId } } }),
      prisma.attempt.deleteMany({ where: { roomId } }),
      prisma.roomAccess.deleteMany({ where: { roomId } }),
      prisma.room.delete({ where: { id: roomId } })
    ]);

    revalidatePath("/admin/salles");
    revalidatePath("/rooms");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (error: any) {
    console.error("Error deleting room:", error);
    return { error: "Erreur lors de la suppression de la salle." };
  }
}
