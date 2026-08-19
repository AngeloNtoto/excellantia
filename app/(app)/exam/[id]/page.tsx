import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getQuestionsByIdsFromDb, getPassagesForQuestions } from "@/lib/questions-db";
import { ExamRunner } from "./exam-runner";

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
  const questions = await getQuestionsByIdsFromDb(room.questionIds as string[]);
  
  // Extraire les passages nécessaires de façon unifiée
  const passages = await getPassagesForQuestions(questions);

  // Préparer les données pour le client
  const clientQuestions = questions.map(q => ({
    id: q.id,
    subject: q.subject,
    statement: q.statement,
    options: q.options,
    passageId: q.passageId
  }));

  const initialAnswers = attempt.answers.reduce((acc: Record<string, { selectedIndex: number | null, flagged: boolean }>, ans: any) => {
    acc[ans.questionId] = { selectedIndex: ans.selectedIndex, flagged: ans.flagged };
    return acc;
  }, {} as Record<string, { selectedIndex: number | null, flagged: boolean }>);

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <ExamRunner 
        attemptId={attempt.id}
        roomId={room.id}
        roomTitle={room.title}
        accessCode={room.accessCode}
        questions={clientQuestions}
        passages={passages}
        initialAnswers={initialAnswers}
        endsAt={room.endsAt?.getTime() ?? null}
        durationMin={room.durationMin}
        startedAt={attempt.startedAt.getTime()}
        timingRegime={room.timingRegime}
        clockMode={room.clockMode}
        chronoMode={room.chronoMode}
        timingConfig={room.timingConfig as any}
        pausableTimer={(room.config as any)?.pausableTimer === true}
        previousTimeUsedSec={attempt.timeUsedSec ?? 0}
        bySubject={(room.config as any)?.bySubject}
      />
    </div>
  );
}
