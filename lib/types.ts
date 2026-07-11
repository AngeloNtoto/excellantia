// ─── Sujets / Rubriques ──────────────────────────────────────────────────────

export type Subject = "MATH" | "FRENCH" | "ENGLISH" | "GENERAL_CULTURE";

export const SUBJECT_LABELS: Record<Subject, string> = {
  MATH: "Mathématiques",
  FRENCH: "Français",
  ENGLISH: "Anglais",
  GENERAL_CULTURE: "Culture générale",
};

export const SUBJECT_COLORS: Record<Subject, string> = {
  MATH: "#6366f1",       // indigo
  FRENCH: "#ec4899",     // pink
  ENGLISH: "#f59e0b",    // amber
  GENERAL_CULTURE: "#10b981", // emerald
};

export type Difficulty = "EASY" | "MEDIUM" | "HARD";
export type Scope = "DRC" | "INTERNATIONAL";

// ─── Questions (JSON) ────────────────────────────────────────────────────────

export interface Question {
  id: string;
  subject: Subject;
  topic?: string;
  subtopic?: string;
  difficulty: Difficulty;
  statement: string;
  options: [string, string, string, string];
  answerIndex: 0 | 1 | 2 | 3;
  explanation: string;
  optionExplanations?: [string, string, string, string];
  passageId?: string;         // Pour les questions liées à un texte
  scope?: Scope;              // Pour culture générale
  type?: "PASSAGE_QUESTION";
}

export interface Passage {
  id: string;
  title: string;
  language: "FR" | "EN";
  content: string;
  source?: string;
}

// ─── Salles ──────────────────────────────────────────────────────────────────

export type RoomStatus = "WAITING" | "SCHEDULED" | "RUNNING" | "CLOSED" | "CANCELLED";
export type RoomVisibility = "PUBLIC" | "PRIVATE";
export type TimeMode = "ABSOLUTE" | "RELATIVE";

export const ROOM_STATUS_LABELS: Record<RoomStatus, string> = {
  WAITING: "En attente",
  SCHEDULED: "Programmée",
  RUNNING: "En cours",
  CLOSED: "Terminée",
  CANCELLED: "Annulée",
};

export interface RoomConfig {
  totalQuestions: number;
  bySubject: Record<Subject, number>;
  difficulty: Record<Subject, { easy: number; medium: number; hard: number }>;
  french?: { passageQuestions: number; passages: number };
  english?: { passageQuestions: number; passages: number };
  generalCulture?: { drc: number; international: number };
}

// ─── Tentatives ──────────────────────────────────────────────────────────────

export type AttemptStatus =
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "AUTO_SUBMITTED_TIME_EXPIRED"
  | "AUTO_SUBMITTED_DISCONNECTED";

export interface SubjectScore {
  subject: Subject;
  score: number;
  total: number;
  percentage: number;
}

// ─── Session ─────────────────────────────────────────────────────────────────

export interface SessionUser {
  id: string;
  fullname: string;
  code: string;
  role: "ADMIN" | "CANDIDATE";
}

// ─── Statistiques ────────────────────────────────────────────────────────────

export interface RoomStats {
  participants: number;
  submitted: number;
  submissionRate: number;
  average: number;
  best: number;
  worst: number;
  stdDev: number;
  bySubject: Record<Subject, number>;
  mostFailed: Array<{ questionId: string; failRate: number; statement: string }>;
  mostPassed: Array<{ questionId: string; passRate: number; statement: string }>;
}
