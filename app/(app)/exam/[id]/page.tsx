import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getQuestionsByIds, getPassageById } from "@/lib/questions";
import { ExamClient } from "./client";

export default async function ExamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/");

  // L'ID ici est celui de la tentative (attemptId)
  const attempt = await prisma.attempt.findUnique({
    where: { id },
    include: { room: true, answers: true }
  });

  if (!attempt || attempt.userId !== session.id) {
    redirect("/dashboard");
  }

  if (attempt.status !== "IN_PROGRESS") {
    redirect(`/exam/${attempt.roomId}/correction/${attempt.id}`);
  }

  const room = attempt.room;
  
  if (room.status !== "RUNNING") {
     // Si la salle n'est plus en cours, forcer la soumission de l'examen au chargement (fait côté client ou check de cron)
  }

  const questions = getQuestionsByIds(room.questionIds as string[]);
  
  // Extraire les passages nécessaires
  const passagesMap = new Map();
  for (const q of questions) {
    if (q.passageId && !passagesMap.has(q.passageId)) {
      const p = getPassageById(q.passageId);
      if (p) passagesMap.set(q.passageId, p);
    }
  }

  // Préparer les données pour le client
  const clientQuestions = questions.map(q => ({
    id: q.id,
    subject: q.subject,
    statement: q.statement,
    options: q.options,
    passageId: q.passageId
  }));

  const initialAnswers = attempt.answers.reduce((acc, ans) => {
    acc[ans.questionId] = { selectedIndex: ans.selectedIndex, flagged: ans.flagged };
    return acc;
  }, {} as Record<string, { selectedIndex: number | null, flagged: boolean }>);

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <ExamClient 
        attemptId={attempt.id}
        roomId={room.id}
        questions={clientQuestions}
        passages={Array.from(passagesMap.values())}
        initialAnswers={initialAnswers}
        endsAt={room.endsAt?.getTime() ?? null}
        durationMin={room.durationMin}
        startedAt={attempt.startedAt.getTime()}
        timeMode={room.timeMode}
      />
    </div>
  );
}
