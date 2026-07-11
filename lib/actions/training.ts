"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { generateRoomQuestions } from "@/lib/questions";
import { redirect } from "next/navigation";
import { startAttemptAction } from "@/lib/actions/attempts";
import type { RoomConfig } from "@/lib/types";

export async function startTrainingAction(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "CANDIDATE") redirect("/");

  const hasMath = formData.get("subject_0") === "true";
  const hasFrench = formData.get("subject_1") === "true";
  const hasEnglish = formData.get("subject_2") === "true";
  const hasCulture = formData.get("subject_3") === "true";
  
  const selectedCount = [hasMath, hasFrench, hasEnglish, hasCulture].filter(Boolean).length;
  if (selectedCount === 0) return { error: "Veuillez sélectionner au moins une matière." };

  const durationMin = parseInt(formData.get("duration") as string) || 60;
  const totalQuestions = 50; // Pour un entrainement, on peut réduire à 50
  const perSubject = Math.floor(totalQuestions / selectedCount);

  const diffMode = formData.get("difficulty") as string;
  let easyPct = 40, mediumPct = 40, hardPct = 20;

  if (diffMode === "EASY") { easyPct = 70; mediumPct = 30; hardPct = 0; }
  else if (diffMode === "HARD") { easyPct = 0; mediumPct = 50; hardPct = 50; }

  const makeSubjectDiff = (total: number) => ({
    easy: Math.round(total * easyPct / 100),
    medium: Math.round(total * mediumPct / 100),
    hard: Math.max(0, total - Math.round(total * easyPct / 100) - Math.round(total * mediumPct / 100)),
  });

  const config: RoomConfig = {
    totalQuestions,
    bySubject: {
      MATH: hasMath ? perSubject : 0,
      FRENCH: hasFrench ? perSubject : 0,
      ENGLISH: hasEnglish ? perSubject : 0,
      GENERAL_CULTURE: hasCulture ? perSubject : 0,
    },
    difficulty: {
      MATH: hasMath ? makeSubjectDiff(perSubject) : { easy: 0, medium: 0, hard: 0 },
      FRENCH: hasFrench ? makeSubjectDiff(perSubject) : { easy: 0, medium: 0, hard: 0 },
      ENGLISH: hasEnglish ? makeSubjectDiff(perSubject) : { easy: 0, medium: 0, hard: 0 },
      GENERAL_CULTURE: hasCulture ? makeSubjectDiff(perSubject) : { easy: 0, medium: 0, hard: 0 },
    }
  };

  const gen = generateRoomQuestions(config);
  if (!gen.ok) return { error: "Pas assez de questions pour cet entraînement. " + gen.errors?.join(" ") };

  const room = await prisma.room.create({
    data: {
      title: "Entraînement - " + new Date().toLocaleDateString(),
      status: "RUNNING",
      visibility: "PRIVATE",
      timeMode: "RELATIVE",
      durationMin,
      questionIds: JSON.stringify(gen.questionIds),
      config: JSON.stringify(config),
      createdById: session.id, // Créé par le candidat lui-même
      startsAt: new Date()
    },
  });

  // Donner l'accès au candidat
  await prisma.roomAccess.create({
    data: { roomId: room.id, userId: session.id }
  });

  // Démarrer la tentative
  const res = await startAttemptAction(room.id);
  
  if (res.ok) {
    redirect(`/exam/${res.attemptId}`);
  }
  
  return { error: res.error || "Erreur de démarrage." };
}
