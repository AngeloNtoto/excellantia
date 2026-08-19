import { prisma } from "@/lib/prisma";
import type { Question, Passage, RoomConfig, RoomMode, Subject } from "@/lib/types";

type DatabaseQuestion = {
  id: string;
  textContentId?: string | null;
  subject: Subject;
  topic: string | null;
  subtopic: string | null;
  difficulty: Question["difficulty"];
  statement: string;
  options: unknown;
  answerIndex: number;
  explanation: string | null;
  optionExplanations: unknown;
  passageId: string | null;
  scope: string | null;
};

/**
 * Convertit un enregistrement Prisma Question en type applicatif Question.
 */
function toQuestion(question: DatabaseQuestion): Question | null {
  if (
    !Array.isArray(question.options) ||
    question.options.length !== 4 ||
    !question.options.every((option) => typeof option === "string") ||
    question.answerIndex < 0 ||
    question.answerIndex > 3
  ) {
    return null;
  }

  const optionExplanations = Array.isArray(question.optionExplanations)
    ? question.optionExplanations.filter((value): value is string => typeof value === "string")
    : undefined;

  return {
    id: question.id,
    subject: question.subject,
    topic: question.topic ?? undefined,
    subtopic: question.subtopic ?? undefined,
    difficulty: question.difficulty,
    statement: question.statement,
    options: question.options as Question["options"],
    answerIndex: question.answerIndex as Question["answerIndex"],
    explanation: question.explanation ?? "",
    optionExplanations: optionExplanations?.length === 4
      ? optionExplanations as Question["optionExplanations"]
      : undefined,
    passageId: question.textContentId || question.passageId || undefined,
    scope: question.scope === "DRC" || question.scope === "INTERNATIONAL"
      ? question.scope
      : undefined,
  };
}

/**
 * Mélange aléatoirement une liste d'éléments et en extrait un sous-ensemble.
 */
function pickRandom<T>(items: T[], count: number): T[] {
  return [...items].sort(() => Math.random() - 0.5).slice(0, count);
}

/**
 * Récupère les questions depuis la base PostgreSQL par leurs identifiants.
 */
export async function getQuestionsByIdsFromDb(ids: string[]): Promise<Question[]> {
  if (!ids || ids.length === 0) return [];
  const questions = await prisma.question.findMany({ where: { id: { in: ids } } });
  const byId = new Map(questions.map((question) => [question.id, toQuestion(question as DatabaseQuestion)]));
  return ids.map((id) => byId.get(id)).filter((question): question is Question => question !== null && question !== undefined);
}

/**
 * Récupère tous les textes de lecture (TextContent) liés à une liste de questions en base de données.
 */
export async function getPassagesForQuestions(questions: Question[]): Promise<Passage[]> {
  const passageIds = Array.from(
    new Set(questions.map((q) => q.passageId).filter((id): id is string => Boolean(id)))
  );

  if (passageIds.length === 0) return [];

  const dbTexts = await prisma.textContent.findMany({
    where: { id: { in: passageIds } },
  });

  return dbTexts.map((text) => ({
    id: text.id,
    title: text.title,
    language: text.language,
    content: text.content,
    source: text.source ?? undefined,
  }));
}

/**
 * Génère dynamiquement les questions d'une salle à partir du stock de la base PostgreSQL.
 */
export async function generateRoomQuestionsFromDb(
  config: RoomConfig,
  mode: RoomMode,
  includeTrainingQuestions = false,
): Promise<{ ok: boolean; questionIds?: string[]; errors?: string[] }> {
  const errors: string[] = [];
  const subjects: Subject[] = ["MATH", "FRENCH", "ENGLISH", "GENERAL_CULTURE"];
  const selected: Question[] = [];

  for (const subject of subjects) {
    const questions = await prisma.question.findMany({
      where: {
        subject,
        OR: [
          { mode },
          { source: "USER_CREATED" as const },
          { source: "TRAINING_POOL" as const },
          ...(mode === "SIMULATION" && includeTrainingQuestions ? [{ mode: "TRAINING" as const }] : []),
          ...(mode === "TRAINING" ? [{ mode: "TRAINING" as const }, { mode: null }] : []),
        ],
      },
    });
    
    let available = questions.map((question) => toQuestion(question as DatabaseQuestion)).filter((question): question is Question => question !== null);
    const topics = config.selectedTopics?.[subject] ?? [];
    if (topics.length > 0) available = available.filter((question) => question.topic && topics.includes(question.topic));

    if (subject === "GENERAL_CULTURE" && config.generalCulture) {
      const drc = available.filter((question) => question.scope === "DRC");
      const international = available.filter((question) => question.scope !== "DRC");
      if (drc.length < config.generalCulture.drc || international.length < config.generalCulture.international) {
        errors.push(`Culture générale : stock insuffisant en base de données pour la répartition demandée (${available.length} disponibles).`);
      } else {
        selected.push(...pickRandom(drc, config.generalCulture.drc), ...pickRandom(international, config.generalCulture.international));
      }
      continue;
    }

    const difficulty = config.difficulty[subject];
    const byDifficulty = (value: Question["difficulty"]) => available.filter((question) => question.difficulty === value);
    const easy = byDifficulty("EASY");
    const medium = byDifficulty("MEDIUM");
    const hard = byDifficulty("HARD");
    if (easy.length < difficulty.easy || medium.length < difficulty.medium || hard.length < difficulty.hard) {
      errors.push(`${subject} : stock insuffisant en base (EASY ${easy.length}/${difficulty.easy}, MEDIUM ${medium.length}/${difficulty.medium}, HARD ${hard.length}/${difficulty.hard}).`);
      continue;
    }
    selected.push(...pickRandom(easy, difficulty.easy), ...pickRandom(medium, difficulty.medium), ...pickRandom(hard, difficulty.hard));
  }

  return errors.length > 0
    ? { ok: false, errors }
    : { ok: true, questionIds: pickRandom(selected, selected.length).map((question) => question.id) };
}