"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getQuestionsByIds } from "@/lib/questions";
import { computeScore, toPercentage } from "@/lib/scoring";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Answer } from "@prisma/client";
import type { Subject } from "@/lib/types";

async function requireAuth() {
  const session = await getSession();
  if (!session) redirect("/");
  return session;
}

// ─── Démarrer ou reprendre une tentative ─────────────────────────────────────

export async function startAttemptAction(roomId: string) {
  const session = await requireAuth();

  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room) return { error: "Salle introuvable." };
  if (room.status !== "RUNNING") return { error: "La salle n'est pas en cours." };

  // Vérifier l'accès pour les salles privées
  if (room.visibility === "PRIVATE" && session.role !== "ADMIN") {
    const access = await prisma.roomAccess.findUnique({
      where: { roomId_userId: { roomId, userId: session.id } },
    });
    if (!access) return { error: "Accès non autorisé. Entrez le code de la salle." };
  }

  // Tentative existante en cours ?
  const existing = await prisma.attempt.findFirst({
    where: { userId: session.id, roomId, status: "IN_PROGRESS" },
  });
  if (existing) return { ok: true, attemptId: existing.id };

  // Tentative déjà soumise ?
  const submitted = await prisma.attempt.findFirst({
    where: { userId: session.id, roomId, status: { not: "IN_PROGRESS" } },
  });
  if (submitted) return { error: "Vous avez déjà soumis cette épreuve.", attemptId: submitted.id };

  const attempt = await prisma.attempt.create({
    data: { userId: session.id, roomId },
  });

  return { ok: true, attemptId: attempt.id };
}

// ─── Sauvegarder une réponse ──────────────────────────────────────────────────

export async function saveAnswerAction(
  attemptId: string,
  questionId: string,
  selectedIndex: number | null
) {
  const session = await requireAuth();

  const attempt = await prisma.attempt.findUnique({ where: { id: attemptId } });
  if (!attempt || attempt.userId !== session.id) return { error: "Tentative introuvable." };
  if (attempt.status !== "IN_PROGRESS") return { error: "Tentative déjà soumise." };

  await prisma.answer.upsert({
    where: { attemptId_questionId: { attemptId, questionId } },
    create: { attemptId, questionId, selectedIndex },
    update: { selectedIndex },
  });

  return { ok: true };
}

// ─── Marquer une question à revoir ────────────────────────────────────────────

export async function toggleFlagAction(attemptId: string, questionId: string) {
  const session = await requireAuth();

  const attempt = await prisma.attempt.findUnique({ where: { id: attemptId } });
  if (!attempt || attempt.userId !== session.id) return { error: "Tentative introuvable." };

  const existing = await prisma.answer.findUnique({
    where: { attemptId_questionId: { attemptId, questionId } },
  });

  if (existing) {
    await prisma.answer.update({
      where: { attemptId_questionId: { attemptId, questionId } },
      data: { flagged: !existing.flagged },
    });
  } else {
    await prisma.answer.create({
      data: { attemptId, questionId, selectedIndex: null, flagged: true },
    });
  }

  return { ok: true };
}

// ─── Soumettre une tentative ──────────────────────────────────────────────────

export async function submitAttemptAction(attemptId: string) {
  const session = await requireAuth();

  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: { answers: true, room: true },
  });

  if (!attempt || attempt.userId !== session.id) return { error: "Tentative introuvable." };
  if (attempt.status !== "IN_PROGRESS") return { error: "Déjà soumise." };

  const questionIds = attempt.room.questionIds as string[];
  const questions = getQuestionsByIds(questionIds);
  const answersMap = new Map<string, number | null>(
    attempt.answers.map((answer: Answer) => [answer.questionId, answer.selectedIndex])
  );

  const { score, total, bySubject } = computeScore(questions, answersMap);
  const percentage = toPercentage(score, total);

  const scoreBySubject: Record<Subject, number> = {
    MATH: bySubject.MATH.score,
    FRENCH: bySubject.FRENCH.score,
    ENGLISH: bySubject.ENGLISH.score,
    GENERAL_CULTURE: bySubject.GENERAL_CULTURE.score,
  };

  const now = new Date();
  const timeUsedSec = Math.floor((now.getTime() - attempt.startedAt.getTime()) / 1000);

  await prisma.attempt.update({
    where: { id: attemptId },
    data: {
      status: "SUBMITTED",
      submittedAt: now,
      score,
      percentage,
      scoreBySubject,
      timeUsedSec,
    },
  });

  revalidatePath(`/exam/${attempt.roomId}/correction`);
  return { ok: true, score, percentage, total };
}

// ─── Auto-soumettre les tentatives expirées (temps absolu) ───────────────────

export async function autoSubmitExpiredAttempts(roomId: string) {
  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room?.endsAt) return;

  const now = new Date();
  if (now < room.endsAt) return;

  const expiredAttempts = await prisma.attempt.findMany({
    where: { roomId, status: "IN_PROGRESS" },
    include: { answers: true },
  });

  const questionIds = room.questionIds as string[];
  const questions = getQuestionsByIds(questionIds);

  for (const attempt of expiredAttempts) {
    const answersMap = new Map<string, number | null>(
      attempt.answers.map((answer: Answer) => [answer.questionId, answer.selectedIndex])
    );
    const { score, total, bySubject } = computeScore(questions, answersMap);
    const percentage = toPercentage(score, total);
    const scoreBySubject: Record<Subject, number> = {
      MATH: bySubject.MATH.score,
      FRENCH: bySubject.FRENCH.score,
      ENGLISH: bySubject.ENGLISH.score,
      GENERAL_CULTURE: bySubject.GENERAL_CULTURE.score,
    };
    const timeUsedSec = Math.floor((room.endsAt.getTime() - attempt.startedAt.getTime()) / 1000);

    await prisma.attempt.update({
      where: { id: attempt.id },
      data: {
        status: "AUTO_SUBMITTED_TIME_EXPIRED",
        submittedAt: room.endsAt,
        score,
        percentage,
        scoreBySubject,
        timeUsedSec,
      },
    });
  }
}
