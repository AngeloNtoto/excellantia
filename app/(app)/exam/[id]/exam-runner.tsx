"use client";

import { useState } from "react";
import { BriefingScreen } from "./briefing-screen";
import { ExamClient } from "./client";
import { TimingRegime, ClockMode, ChronoMode, NewtonTimingConfig, Subject } from "@/lib/types";

export function ExamRunner({
  attemptId,
  roomId,
  roomTitle,
  accessCode,
  questions,
  passages,
  initialAnswers,
  endsAt,
  durationMin,
  startedAt,
  timingRegime = "EINSTEIN",
  clockMode = "ABSOLUTE",
  chronoMode = "GALILEE",
  timingConfig,
  pausableTimer,
  previousTimeUsedSec,
  bySubject,
  subjectOrder,
}: {
  attemptId: string;
  roomId: string;
  roomTitle: string;
  accessCode?: string | null;
  questions: Array<{
    id: string;
    subject: Subject;
    statement: string;
    options: [string, string, string, string];
    passageId?: string;
  }>;
  passages: Array<{
    id: string;
    title: string;
    language: string;
    content: string;
  }>;
  initialAnswers: Record<string, { selectedIndex: number | null; flagged: boolean }>;
  endsAt: number | null;
  durationMin: number;
  startedAt: number;
  timingRegime?: TimingRegime;
  clockMode?: ClockMode;
  chronoMode?: ChronoMode;
  timingConfig?: NewtonTimingConfig | null;
  pausableTimer?: boolean;
  previousTimeUsedSec: number;
  bySubject?: Record<Subject, number>;
  subjectOrder?: Subject[];
}) {
  // Le briefing est affiché au début si aucune réponse n'a été saisie encore
  const hasAlreadyStarted = Object.keys(initialAnswers).length > 0;
  const [hasConfirmedBriefing, setHasConfirmedBriefing] = useState<boolean>(hasAlreadyStarted);

  if (!hasConfirmedBriefing) {
    return (
      <BriefingScreen
        roomTitle={roomTitle}
        timingRegime={timingRegime}
        chronoMode={chronoMode}
        durationMin={durationMin}
        totalQuestions={questions.length}
        bySubject={bySubject}
        onStartExam={() => setHasConfirmedBriefing(true)}
      />
    );
  }

  return (
    <ExamClient
      attemptId={attemptId}
      roomId={roomId}
      accessCode={accessCode}
      questions={questions}
      passages={passages}
      initialAnswers={initialAnswers}
      endsAt={endsAt}
      durationMin={durationMin}
      startedAt={startedAt}
      timingRegime={timingRegime}
      clockMode={clockMode}
      chronoMode={chronoMode}
      timingConfig={timingConfig}
      pausableTimer={pausableTimer}
      previousTimeUsedSec={previousTimeUsedSec}
      subjectOrder={subjectOrder}
    />
  );
}
