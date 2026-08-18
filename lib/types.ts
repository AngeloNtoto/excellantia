// ─── Sujets / Rubriques ──────────────────────────────────────────────────────

export type Subject = "MATH" | "FRENCH" | "ENGLISH" | "GENERAL_CULTURE";
export type Difficulty = "EASY" | "MEDIUM" | "HARD";
export type Scope = "DRC" | "INTERNATIONAL";
export type Language = "FR" | "EN";
export type RoomMode = "TRAINING" | "SIMULATION";
export type QuestionType = "MULTIPLE_CHOICE" | "PASSAGE_BASED";
export type QuestionSource = "USER_CREATED" | "ROOM_GENERATED" | "TRAINING_POOL";
export type AttemptLockReason = "NONE" | "TIME_EXPIRED";

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

export const ROOM_MODE_LABELS: Record<RoomMode, string> = {
  TRAINING: "Entraînement",
  SIMULATION: "Simulation",
};

export const QUESTION_SOURCE_LABELS: Record<QuestionSource, string> = {
  USER_CREATED: "Créée par l'utilisateur",
  ROOM_GENERATED: "Générée par la salle",
  TRAINING_POOL: "Pool d'entraînement",
};

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
  generalCulture?: { drc: number; international: number };
  pausableTimer?: boolean;
  selectedTopics?: Record<Subject, string[]>;
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
