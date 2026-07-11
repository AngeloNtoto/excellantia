import { readFileSync } from "fs";
import { join } from "path";
import { questionSchema, passageSchema } from "./validations";
import type { Question, Passage, Subject, Difficulty, RoomConfig } from "./types";

const DATA_DIR = join(process.cwd(), "data");

// ─── Chargement des questions ─────────────────────────────────────────────────

function loadQuestions(filename: string): Question[] {
  try {
    const raw = readFileSync(join(DATA_DIR, "questions", filename), "utf-8");
    const parsed = JSON.parse(raw) as unknown[];
    return parsed.map((q, i) => {
      const result = questionSchema.safeParse(q);
      if (!result.success) {
        console.warn(`Question invalide à l'index ${i} dans ${filename}:`, result.error.issues);
        return null;
      }
      return result.data as Question;
    }).filter(Boolean) as Question[];
  } catch {
    return [];
  }
}

function loadPassages(filename: string): Passage[] {
  try {
    const raw = readFileSync(join(DATA_DIR, "passages", filename), "utf-8");
    const parsed = JSON.parse(raw) as unknown[];
    return parsed.map((p) => {
      const result = passageSchema.safeParse(p);
      return result.success ? result.data as Passage : null;
    }).filter(Boolean) as Passage[];
  } catch {
    return [];
  }
}

// ─── Banque de questions ──────────────────────────────────────────────────────

export function getAllQuestions(): Question[] {
  return [
    ...loadQuestions("maths.json"),
    ...loadQuestions("francais.json"),
    ...loadQuestions("anglais.json"),
    ...loadQuestions("culture-generale.json"),
  ];
}

export function getQuestionsBySubject(subject: Subject): Question[] {
  const fileMap: Record<Subject, string> = {
    MATH: "maths.json",
    FRENCH: "francais.json",
    ENGLISH: "anglais.json",
    GENERAL_CULTURE: "culture-generale.json",
  };
  return loadQuestions(fileMap[subject]);
}

export function getQuestionById(id: string): Question | null {
  return getAllQuestions().find((q) => q.id === id) ?? null;
}

export function getQuestionsByIds(ids: string[]): Question[] {
  const all = getAllQuestions();
  const map = new Map(all.map((q) => [q.id, q]));
  return ids.map((id) => map.get(id)).filter(Boolean) as Question[];
}

export function getAllPassages(): Passage[] {
  return [
    ...loadPassages("francais.json"),
    ...loadPassages("anglais.json"),
  ];
}

export function getPassageById(id: string): Passage | null {
  return getAllPassages().find((p) => p.id === id) ?? null;
}

// ─── Validation de la banque ──────────────────────────────────────────────────

export interface BankValidationError {
  type: "missing_explanation" | "duplicate_id" | "invalid_passage" | "insufficient_questions";
  message: string;
  questionId?: string;
}

export function validateBank(): BankValidationError[] {
  const errors: BankValidationError[] = [];
  const questions = getAllQuestions();
  const passages = getAllPassages();
  const passageIds = new Set(passages.map((p) => p.id));
  const seenIds = new Set<string>();

  for (const q of questions) {
    if (seenIds.has(q.id)) {
      errors.push({ type: "duplicate_id", message: `ID dupliqué : ${q.id}`, questionId: q.id });
    }
    seenIds.add(q.id);

    if (!q.explanation?.trim()) {
      errors.push({
        type: "missing_explanation",
        message: `Explication manquante : ${q.id}`,
        questionId: q.id,
      });
    }

    if (q.passageId && !passageIds.has(q.passageId)) {
      errors.push({
        type: "invalid_passage",
        message: `Passage introuvable "${q.passageId}" pour la question ${q.id}`,
        questionId: q.id,
      });
    }
  }

  return errors;
}

// ─── Génération des questions pour une salle ──────────────────────────────────

export interface GenerationResult {
  ok: boolean;
  questionIds?: string[];
  errors?: string[];
}

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function splitByDifficulty(
  questions: Question[],
  easy: number,
  medium: number,
  hard: number
): Question[] | null {
  const easyQ = questions.filter((q) => q.difficulty === "EASY");
  const mediumQ = questions.filter((q) => q.difficulty === "MEDIUM");
  const hardQ = questions.filter((q) => q.difficulty === "HARD");

  if (easyQ.length < easy || mediumQ.length < medium || hardQ.length < hard) {
    return null;
  }

  return [
    ...pickRandom(easyQ, easy),
    ...pickRandom(mediumQ, medium),
    ...pickRandom(hardQ, hard),
  ];
}

export function generateRoomQuestions(config: RoomConfig): GenerationResult {
  const errors: string[] = [];
  const subjects: Subject[] = ["MATH", "FRENCH", "ENGLISH", "GENERAL_CULTURE"];
  const selected: Question[] = [];

  for (const subject of subjects) {
    const allForSubject = getQuestionsBySubject(subject);
    const total = config.bySubject[subject];
    const diff = config.difficulty[subject];

    // Cas spéciaux
    if (subject === "FRENCH" && config.french?.passageQuestions) {
      const passageQs = allForSubject.filter((q) => q.passageId);
      const nonPassageQs = allForSubject.filter((q) => !q.passageId);
      const needed = config.french.passageQuestions;

      if (passageQs.length < needed) {
        errors.push(`Français texte : ${needed} questions demandées, ${passageQs.length} disponibles.`);
      } else {
        const regularNeeded = total - needed;
        const result = splitByDifficulty(
          nonPassageQs,
          Math.round(regularNeeded * diff.easy / 100),
          Math.round(regularNeeded * diff.medium / 100),
          Math.round(regularNeeded * diff.hard / 100)
        );
        if (!result) errors.push(`Français hors-texte : stock insuffisant.`);
        else selected.push(...pickRandom(passageQs, needed), ...result);
        continue;
      }
    }

    if (subject === "GENERAL_CULTURE" && config.generalCulture) {
      const drcQs = allForSubject.filter((q) => q.scope === "DRC");
      const intlQs = allForSubject.filter((q) => q.scope !== "DRC");
      const { drc, international } = config.generalCulture;

      if (drcQs.length < drc) errors.push(`Culture RDC : ${drc} demandées, ${drcQs.length} disponibles.`);
      else if (intlQs.length < international) errors.push(`Culture internationale : ${international} demandées, ${intlQs.length} disponibles.`);
      else {
        selected.push(...pickRandom(drcQs, drc), ...pickRandom(intlQs, international));
        continue;
      }
    }

    const result = splitByDifficulty(
      allForSubject,
      diff.easy,
      diff.medium,
      diff.hard
    );

    if (!result) {
      const easyQ = allForSubject.filter((q) => q.difficulty === "EASY").length;
      const mediumQ = allForSubject.filter((q) => q.difficulty === "MEDIUM").length;
      const hardQ = allForSubject.filter((q) => q.difficulty === "HARD").length;
      errors.push(
        `${subject} : stock insuffisant (EASY ${easyQ}/${diff.easy}, MEDIUM ${mediumQ}/${diff.medium}, HARD ${hardQ}/${diff.hard})`
      );
    } else {
      selected.push(...result);
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, questionIds: selected.map((q) => q.id) };
}
