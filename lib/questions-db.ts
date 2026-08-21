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
  // Respecter l'ordre des matières si spécifié, sinon ordre par défaut
  const subjects: Subject[] = config.subjectOrder && config.subjectOrder.length === 4
    ? config.subjectOrder
    : ["FRENCH", "ENGLISH", "MATH", "GENERAL_CULTURE"];
  const selected: Question[] = [];

  for (const subject of subjects) {
    const targetCount = config.bySubject[subject] ?? 0;
    if (targetCount === 0) continue;

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
      orderBy: { createdAt: "asc" },
    });
    
    let available = questions.map((question) => toQuestion(question as DatabaseQuestion)).filter((question): question is Question => question !== null);
    const topics = config.selectedTopics?.[subject] ?? [];
    if (topics.length > 0) available = available.filter((question) => question.topic && topics.includes(question.topic));

    // ── RÈGLE POUR LES LANGUES (FRANÇAIS & ANGLAIS) : 1 SEUL TEXTE DE COMPRÉHENSION DÉDIÉ ──
    if (subject === "FRENCH" || subject === "ENGLISH") {
      const lang = subject === "ENGLISH" ? "EN" : "FR";
      
      // Trouver tous les textes disponibles pour cette langue compatibles avec le mode
      const textsWithQuestions = await prisma.textContent.findMany({
        where: {
          language: lang,
          isActive: true,
          OR: [
            { mode },
            { mode: null },
            ...(mode === "SIMULATION" && includeTrainingQuestions ? [{ mode: "TRAINING" as const }] : []),
          ],
        },
        include: { questions: { select: { id: true } } },
      });

      const eligibleTexts = textsWithQuestions.filter((t) => t.questions.length > 0);
      
      if (eligibleTexts.length > 0) {
        // Sélectionner 1 seul texte aléatoirement
        const chosenText = eligibleTexts[Math.floor(Math.random() * eligibleTexts.length)];
        const textQuestionIds = new Set(chosenText.questions.map((q) => q.id));

        // Questions liées à CE texte uniquement (dans leur ordre chronologique d'origine 1..N)
        const textQuestions = available.filter((q) => textQuestionIds.has(q.id));
        // Questions strictement autonomes (aucun texte associé)
        const standaloneQuestions = available.filter((q) => !q.passageId);

        // Déterminer le quota de questions de texte (proportionnel : 10 sur 25, ou max disponible)
        const targetTextQCount = Math.min(
          textQuestions.length,
          Math.min(targetCount, Math.max(1, Math.round(targetCount * (10 / 25))))
        );

        // Conserver l'ordre naturel des questions du texte (1, 2, 3, ...) au lieu de les mélanger
        const chosenFromText = textQuestions.slice(0, targetTextQCount);
        const neededStandalone = targetCount - chosenFromText.length;
        const chosenStandalone = pickRandom(standaloneQuestions, neededStandalone);

        // Si le stock de questions autonomes est insuffisant, compléter avec les questions restantes de CE texte (jamais d'un autre texte)
        if (chosenStandalone.length < neededStandalone) {
          const remainingFromThisText = textQuestions.filter((q) => !chosenFromText.some((c) => c.id === q.id));
          const stillNeeded = neededStandalone - chosenStandalone.length;
          const additionalFromText = remainingFromThisText.slice(0, stillNeeded);
          chosenFromText.push(...additionalFromText);
        }

        const totalChosen = [...chosenFromText, ...chosenStandalone];
        if (totalChosen.length >= targetCount) {
          selected.push(...totalChosen.slice(0, targetCount));
          continue;
        } else if (totalChosen.length > 0) {
          // Si le stock total disponible (ce texte + questions autonomes) ne suffit pas tout à fait
          selected.push(...totalChosen);
          continue;
        }
      } else {
        // Aucun texte éligible : utiliser exclusivement des questions autonomes (sans texte)
        const standaloneOnly = available.filter((q) => !q.passageId);
        if (standaloneOnly.length >= targetCount) {
          selected.push(...pickRandom(standaloneOnly, targetCount));
          continue;
        }
      }
    }

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
    
    // Si la sélection par difficulté stricte est possible
    if (easy.length >= difficulty.easy && medium.length >= difficulty.medium && hard.length >= difficulty.hard) {
      selected.push(...pickRandom(easy, difficulty.easy), ...pickRandom(medium, difficulty.medium), ...pickRandom(hard, difficulty.hard));
    } else if (available.length >= targetCount) {
      // Fallback souple : piocher parmi le stock disponible pour ne pas bloquer l'entraînement
      selected.push(...pickRandom(available, targetCount));
    } else {
      errors.push(`${subject} : stock insuffisant en base (${available.length}/${targetCount} demandées).`);
    }
  }

  if (errors.length > 0) return { ok: false, errors };

  // Les questions sont renvoyées dans l'ordre structuré par matière (avec questions de texte au début dans l'ordre 1..N)
  return {
    ok: true,
    questionIds: selected.map((question) => question.id),
  };
}