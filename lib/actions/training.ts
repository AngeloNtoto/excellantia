"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { generateRoomQuestionsFromDb } from "@/lib/questions-db";
import { redirect } from "next/navigation";
import { startAttemptAction } from "@/lib/actions/attempts";
import type { RoomConfig, Subject } from "@/lib/types";

export async function startTrainingAction(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "CANDIDATE") redirect("/");

  // ── Question counts per subject ──
  const countMath = parseInt(formData.get("subject_count_0") as string) || 0;
  const countFrench = parseInt(formData.get("subject_count_1") as string) || 0;
  const countEnglish = parseInt(formData.get("subject_count_2") as string) || 0;
  const countCulture = parseInt(formData.get("subject_count_3") as string) || 0;

  const totalQuestions = countMath + countFrench + countEnglish + countCulture;
  if (totalQuestions === 0) return { error: "Veuillez sélectionner au moins une matière avec des questions." };

  // ── Durée et difficulté ──
  const durationMin = parseInt(formData.get("duration") as string) || 60;
  const diffMode = formData.get("difficulty") as string;
  let easyPct = 40, mediumPct = 40;

  if (diffMode === "EASY") { easyPct = 70; mediumPct = 30; }
  else if (diffMode === "HARD") { easyPct = 0; mediumPct = 50; }

  const makeSubjectDiff = (total: number) => ({
    easy: Math.round(total * easyPct / 100),
    medium: Math.round(total * mediumPct / 100),
    hard: Math.max(0, total - Math.round(total * easyPct / 100) - Math.round(total * mediumPct / 100)),
  });

  // ── Sous-branches sélectionnées (JSON envoyé depuis le client) ──
  let selectedTopics: Record<Subject, string[]> | undefined;
  const rawTopics = formData.get("selectedTopics") as string | null;
  if (rawTopics) {
    try {
      const parsed = JSON.parse(rawTopics);
      // Filtrer les sous-branches vides (vide = tout inclus)
      const hasAny = Object.values(parsed).some((arr) => Array.isArray(arr) && arr.length > 0);
      if (hasAny) selectedTopics = parsed;
    } catch {
      // Ignorer les erreurs de parsing
    }
  }

  const config: RoomConfig = {
    totalQuestions,
    bySubject: {
      MATH: countMath,
      FRENCH: countFrench,
      ENGLISH: countEnglish,
      GENERAL_CULTURE: countCulture,
    },
    difficulty: {
      MATH: countMath > 0 ? makeSubjectDiff(countMath) : { easy: 0, medium: 0, hard: 0 },
      FRENCH: countFrench > 0 ? makeSubjectDiff(countFrench) : { easy: 0, medium: 0, hard: 0 },
      ENGLISH: countEnglish > 0 ? makeSubjectDiff(countEnglish) : { easy: 0, medium: 0, hard: 0 },
      GENERAL_CULTURE: countCulture > 0 ? makeSubjectDiff(countCulture) : { easy: 0, medium: 0, hard: 0 },
    },
    pausableTimer: formData.get("pausableTimer") === "true",
    selectedTopics,
  };

  const gen = await generateRoomQuestionsFromDb(config, "TRAINING");
  if (!gen.ok) return { error: "Pas assez de questions pour cet entraînement. " + gen.errors?.join(" ") };

  const accessCode = Math.random().toString(36).substring(2, 8).toUpperCase();

  const room = await prisma.room.create({
    data: {
      title:
        "Duel / Entraînement - " +
        new Date()
          .toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
          .replace(",", " à"),
      status: "RUNNING",
      mode: "TRAINING",
      visibility: "PRIVATE",
      timingRegime: "EINSTEIN",
      clockMode: "RELATIVE",
      schrodingerMode: false,
      durationMin,
      accessCode,
      questionIds: gen.questionIds as any,
      config: config as any,
      createdById: session.id,
      startsAt: new Date(),
    },
  });

  // Incrémenter le nombre d'apparitions des questions tirées
  if (gen.questionIds && gen.questionIds.length > 0) {
    await prisma.question.updateMany({
      where: { id: { in: gen.questionIds } },
      data: { timesAppeared: { increment: 1 } },
    });
  }

  // Donner l'accès au candidat
  await prisma.roomAccess.create({
    data: { roomId: room.id, userId: session.id },
  });

  // Démarrer la tentative
  const res = await startAttemptAction(room.id);

  if (res.ok) {
    redirect(`/exam/${res.attemptId}`);
  }

  return { error: res.error || "Erreur de démarrage." };
}
