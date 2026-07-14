import type { Question, RoomStats, Subject } from "./types";

// ─── Score ────────────────────────────────────────────────────────────────────

export function computeScore(
  questions: Question[],
  answers: Map<string, number | null>
): { score: number; total: number; bySubject: Record<Subject, { score: number; total: number }> } {
  let score = 0;
  const total = questions.length;

  const bySubject: Record<Subject, { score: number; total: number }> = {
    MATH: { score: 0, total: 0 },
    FRENCH: { score: 0, total: 0 },
    ENGLISH: { score: 0, total: 0 },
    GENERAL_CULTURE: { score: 0, total: 0 },
  };

  for (const q of questions) {
    const subject = q.subject;
    bySubject[subject].total++;

    const selected = answers.get(q.id);
    if (selected !== null && selected !== undefined && selected === q.answerIndex) {
      score++;
      bySubject[subject].score++;
    }
  }

  return { score, total, bySubject };
}

export function toPercentage(score: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((score / total) * 100);
}

// ─── Statistiques de salle ────────────────────────────────────────────────────

interface AttemptResult {
  questionId: string;
  selectedIndex: number | null;
}

interface SubmittedAttempt {
  score: number;
  percentage: number;
  scoreBySubject: Record<Subject, number>;
  answers: AttemptResult[];
}

export function computeRoomStats(
  attempts: SubmittedAttempt[],
  questions: Question[]
): RoomStats {
  const submitted = attempts.length;
  if (submitted === 0) {
    return {
      participants: 0,
      submitted: 0,
      submissionRate: 0,
      average: 0,
      best: 0,
      worst: 0,
      stdDev: 0,
      bySubject: { MATH: 0, FRENCH: 0, ENGLISH: 0, GENERAL_CULTURE: 0 },
      mostFailed: [],
      mostPassed: [],
    };
  }

  const percentages = attempts.map((a) => a.percentage);
  const average = percentages.reduce((s, p) => s + p, 0) / submitted;
  const best = Math.max(...percentages);
  const worst = Math.min(...percentages);
  const variance = percentages.reduce((s, p) => s + (p - average) ** 2, 0) / submitted;
  const stdDev = Math.sqrt(variance);

  // Moyennes par rubrique
  const bySubject = { MATH: 0, FRENCH: 0, ENGLISH: 0, GENERAL_CULTURE: 0 } as Record<Subject, number>;
  for (const subject of Object.keys(bySubject) as Subject[]) {
    const vals = attempts.map((a) => a.scoreBySubject[subject] ?? 0);
    bySubject[subject] = Math.round(vals.reduce((s, v) => s + v, 0) / submitted * 10) / 10;
  }

  // Stats par question
  const questionStats = new Map<string, { correct: number; total: number }>();
  for (const q of questions) {
    questionStats.set(q.id, { correct: 0, total: 0 });
  }
  for (const attempt of attempts) {
    for (const ans of attempt.answers) {
      const stat = questionStats.get(ans.questionId);
      if (!stat) continue;
      stat.total++;
      const q = questions.find((x) => x.id === ans.questionId);
      if (q && ans.selectedIndex === q.answerIndex) stat.correct++;
    }
  }

  const questionList = questions.map((q) => {
    const stat = questionStats.get(q.id) ?? { correct: 0, total: submitted };
    const failRate = stat.total === 0 ? 0 : Math.round(((stat.total - stat.correct) / stat.total) * 100);
    const passRate = 100 - failRate;
    return { questionId: q.id, statement: q.statement, failRate, passRate };
  });

  const mostFailed = [...questionList]
    .sort((a, b) => b.failRate - a.failRate)
    .slice(0, 5)
    .map(({ questionId, statement, failRate }) => ({ questionId, statement, failRate }));

  const mostPassed = [...questionList]
    .sort((a, b) => b.passRate - a.passRate)
    .slice(0, 5)
    .map(({ questionId, statement, passRate }) => ({ questionId, statement, passRate }));

  return {
    participants: submitted,
    submitted,
    submissionRate: 100,
    average: Math.round(average * 10) / 10,
    best,
    worst,
    stdDev: Math.round(stdDev * 10) / 10,
    bySubject,
    mostFailed,
    mostPassed,
  };
}

// ─── Classement ───────────────────────────────────────────────────────────────

export interface RankingEntry {
  rank: number;
  userId: string;
  fullname: string;
  score: number;
  percentage: number;
  bySubject: Record<Subject, number>;
  submittedAt: Date | null;
  status: string;
}

export function buildRanking(
  attempts: Array<{
    userId: string;
    fullname: string;
    score: number | null;
    percentage: number | null;
    scoreBySubject: any;
    submittedAt: Date | null;
    status: string;
  }>
): RankingEntry[] {
  const sorted = [...attempts].sort((a, b) => {
    // 1. Meilleur pourcentage
    const pctDiff = (b.percentage ?? 0) - (a.percentage ?? 0);
    if (pctDiff !== 0) return pctDiff;
    // 2. Soumission plus rapide
    if (a.submittedAt && b.submittedAt) {
      return a.submittedAt.getTime() - b.submittedAt.getTime();
    }
    // 3. Alphabétique
    return a.fullname.localeCompare(b.fullname);
  });

  return sorted.map((a, i) => {
    let bySubject: Record<Subject, number> = { MATH: 0, FRENCH: 0, ENGLISH: 0, GENERAL_CULTURE: 0 };
    if (a.scoreBySubject) {
      if (typeof a.scoreBySubject === 'string') {
        try { bySubject = JSON.parse(a.scoreBySubject); } catch { /* */ }
      } else {
        bySubject = a.scoreBySubject as Record<Subject, number>;
      }
    }
    return {
      rank: i + 1,
      userId: a.userId,
      fullname: a.fullname,
      score: a.score ?? 0,
      percentage: a.percentage ?? 0,
      bySubject,
      submittedAt: a.submittedAt,
      status: a.status,
    };
  });
}

// ─── WhatsApp ─────────────────────────────────────────────────────────────────

export function buildWhatsAppMessage(
  title: string,
  date: string,
  durationMin: number,
  ranking: RankingEntry[],
  totalQuestions: number
): string {
  const top = ranking.slice(0, 20);
  const lines = [
    `🏆 *Resultats — ${title}*`,
    `📅 ${date} | ⏱ ${durationMin} min | 👥 ${ranking.length} participants`,
    ``,
    ...top.map((e) => `${e.rank}. ${e.fullname} — ${e.percentage}% (${e.score}/${totalQuestions})`),
    ``,
    `_Plateforme Excellantia_`,
  ];
  return lines.join("\n");
}

export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
