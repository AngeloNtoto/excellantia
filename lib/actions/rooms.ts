"use server";

import { prisma } from "@/lib/prisma";
import { createRoomSchema, accessCodeSchema } from "@/lib/validations";
import { getSession } from "@/lib/session";
import { generateRoomQuestionsFromDb } from "@/lib/questions-db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { autoSubmitExpiredAttempts } from "./attempts";
import type { RoomConfig, Subject } from "@/lib/types";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/");
  return session;
}

async function requireRoomOwnerOrAdmin(roomId: string) {
  const session = await getSession();
  if (!session) redirect("/");

  const room = await prisma.room.findUnique({ where: { id: roomId }, select: { createdById: true } });
  if (!room) redirect("/rooms");
  if (session.role === "ADMIN" || room.createdById === session.id) {
    return session;
  }

  redirect("/");
}

async function requireAuth() {
  const session = await getSession();
  if (!session) redirect("/");
  return session;
}

// ─── Durée de vie maximale d'une salle : 5 heures après la création ────────────
const ROOM_MAX_DURATION_MS = 5 * 60 * 60 * 1000; // 5h en millisecondes

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
    generalCulture: d.cultureDrc > 0
      ? { drc: d.cultureDrc, international: d.cultureCount - d.cultureDrc }
      : undefined,
    selectedTopics: d.selectedTopics ? JSON.parse(d.selectedTopics) : undefined,
  };

  // Générer les questions depuis la base de données
  const gen = await generateRoomQuestionsFromDb(config, d.mode, d.includeTrainingQuestions);
  if (!gen.ok) {
    return { error: gen.errors?.join("\n") ?? "Génération impossible." };
  }

  // Dates
  const createdAt = new Date();
  // Hard limit : la salle expire au plus tard 5h après sa création
  const hardDeadline = new Date(createdAt.getTime() + ROOM_MAX_DURATION_MS);

  let startsAt: Date | null = null;
  let endsAt: Date | null = null;
  let status: "WAITING" | "SCHEDULED" | "RUNNING" = "WAITING";

  if (d.startNow) {
    startsAt = createdAt;
    status = "RUNNING";
    if (d.timeMode === "ABSOLUTE") {
      // Prendre le plus tôt entre la durée configurée et le hard limit
      const calculated = new Date(startsAt.getTime() + d.durationMin * 60_000);
      endsAt = calculated < hardDeadline ? calculated : hardDeadline;
    } else {
      // Mode relatif : imposer quand même la limite absolue de 5h
      endsAt = hardDeadline;
    }
  } else if (d.scheduledAt) {
    startsAt = new Date(d.scheduledAt);
    status = "SCHEDULED";
    if (d.timeMode === "ABSOLUTE") {
      const calculated = new Date(startsAt.getTime() + d.durationMin * 60_000);
      endsAt = calculated < hardDeadline ? calculated : hardDeadline;
    } else {
      endsAt = hardDeadline;
    }
  } else {
    // Salle en attente sans date de démarrage : hard limit quand même
    endsAt = hardDeadline;
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

  // Incrémenter le nombre d'apparitions des questions tirées
  if (gen.questionIds && gen.questionIds.length > 0) {
    await prisma.question.updateMany({
      where: { id: { in: gen.questionIds } },
      data: { timesAppeared: { increment: 1 } },
    });
  }

  revalidatePath("/admin");
  revalidatePath("/admin/contenus");
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
  await requireRoomOwnerOrAdmin(roomId);
  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room) return { error: "Salle introuvable." };
  if (room.status === "RUNNING") return { error: "Salle déjà en cours." };
  if (room.status === "CLOSED" || room.status === "CANCELLED") return { error: "Salle terminée ou annulée." };

  const startsAt = new Date();
  // Hard limit : 5h après la création originale de la salle
  const hardDeadline = new Date(room.createdAt.getTime() + ROOM_MAX_DURATION_MS);
  let endsAt: Date;
  if (room.timeMode === "ABSOLUTE") {
    const calculated = new Date(startsAt.getTime() + room.durationMin * 60_000);
    endsAt = calculated < hardDeadline ? calculated : hardDeadline;
  } else {
    // Mode relatif : imposer le hard limit de 5h
    endsAt = hardDeadline;
  }

  await prisma.room.update({
    where: { id: roomId },
    data: { status: "RUNNING", startsAt, endsAt },
  });

  revalidatePath("/admin");
  revalidatePath(`/admin/salles/${roomId}`);
  revalidatePath("/rooms");
  return { ok: true, endsAt };
}

// ─── Fermer / annuler une salle ───────────────────────────────────────────────

export async function closeRoomAction(roomId: string) {
  await requireRoomOwnerOrAdmin(roomId);
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
  await requireRoomOwnerOrAdmin(roomId);
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
    // Hard limit : 5h après création
    const hardDeadline = new Date(room.createdAt.getTime() + ROOM_MAX_DURATION_MS);
    let endsAt: Date | null = null;

    if (room.timeMode === "ABSOLUTE" && room.startsAt) {
      const calculated = new Date(room.startsAt.getTime() + room.durationMin * 60_000);
      endsAt = calculated < hardDeadline ? calculated : hardDeadline;
    } else {
      // Mode relatif : imposer le hard limit
      endsAt = hardDeadline;
    }

    await prisma.room.update({
      where: { id: room.id },
      data: { status: "RUNNING", endsAt },
    });
  }

  // 2. Fermer les salles terminées
  const runningRooms = await prisma.room.findMany({
    where: { status: "RUNNING" },
  });

  for (const room of runningRooms) {
    // Hard limit : 5h après création (s'applique à tous les modes)
    const hardDeadline = new Date(room.createdAt.getTime() + ROOM_MAX_DURATION_MS);

    const effectiveEndAt = room.endsAt
      ? new Date(room.endsAt)
      : room.timeMode === "ABSOLUTE" && room.startsAt
        ? new Date(room.startsAt.getTime() + room.durationMin * 60_000)
        : null;

    // La vraie date de fin = la plus proche entre l'endsAt calculé et le hard limit
    const resolvedEndAt = effectiveEndAt
      ? (effectiveEndAt < hardDeadline ? effectiveEndAt : hardDeadline)
      : hardDeadline;

    const attempts = await prisma.attempt.findMany({
      where: { roomId: room.id },
      select: { status: true },
    });

    const allAttemptsSubmitted =
      attempts.length > 0 &&
      attempts.every((a) =>
        a.status === "SUBMITTED" ||
        a.status === "AUTO_SUBMITTED_TIME_EXPIRED" ||
        a.status === "AUTO_SUBMITTED_DISCONNECTED"
      );

    // Fermer si : durée écoulée (toute mode), hard limit atteint, ou tous soumis (mode relatif)
    const timeExpired = resolvedEndAt <= now;
    const shouldClose = timeExpired || (room.timeMode === "RELATIVE" && allAttemptsSubmitted);

    if (shouldClose) {
      await prisma.room.update({
        where: { id: room.id },
        data: { status: "CLOSED", endsAt: resolvedEndAt },
      });
      // Auto-soumettre les tentatives encore en cours
      await autoSubmitExpiredAttempts(room.id);
    }
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

// ─── Suppression d'une salle ──────────────────────────────────────────────────

export async function deleteRoomAction(roomId: string) {
  const session = await requireAuth();
  if (session.role !== "ADMIN") return { error: "Non autorisé" };

  try {
    // Suppression en cascade manuelle (sécurité si Prisma n'a pas onDelete: Cascade)
    await prisma.$transaction([
      prisma.answer.deleteMany({ where: { attempt: { roomId } } }),
      prisma.attempt.deleteMany({ where: { roomId } }),
      prisma.roomAccess.deleteMany({ where: { roomId } }),
      prisma.room.delete({ where: { id: roomId } }),
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

// ─── Suppression de plusieurs salles (lot) ────────────────────────────────────

export async function deleteManyRoomsAction(roomIds: string[]) {
  const session = await requireAuth();
  if (session.role !== "ADMIN") return { error: "Non autorisé" };
  if (!roomIds || roomIds.length === 0) return { error: "Aucune salle sélectionnée." };

  try {
    // Supprimer toutes les données liées pour chaque salle en une transaction
    await prisma.$transaction([
      prisma.answer.deleteMany({ where: { attempt: { roomId: { in: roomIds } } } }),
      prisma.attempt.deleteMany({ where: { roomId: { in: roomIds } } }),
      prisma.roomAccess.deleteMany({ where: { roomId: { in: roomIds } } }),
      prisma.room.deleteMany({ where: { id: { in: roomIds } } }),
    ]);

    revalidatePath("/admin/salles");
    revalidatePath("/rooms");
    revalidatePath("/dashboard");
    return { ok: true, deleted: roomIds.length };
  } catch (error: any) {
    console.error("Error deleting rooms:", error);
    return { error: "Erreur lors de la suppression des salles." };
  }
}