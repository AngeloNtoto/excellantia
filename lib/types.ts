// ─── Sujets / Rubriques ──────────────────────────────────────────────────────

export type Subject = "MATH" | "FRENCH" | "ENGLISH" | "GENERAL_CULTURE";
export type Difficulty = "EASY" | "MEDIUM" | "HARD";
export type Scope = "DRC" | "INTERNATIONAL";
export type Language = "FR" | "EN";
export type RoomMode = "TRAINING" | "SIMULATION";
export type QuestionType = "MULTIPLE_CHOICE" | "PASSAGE_BASED";
export type QuestionSource = "USER_CREATED" | "ROOM_GENERATED" | "TRAINING_POOL";
export type AttemptLockReason = "NONE" | "TIME_EXPIRED";

// ─── Régimes Temporels & Modes d'Horloge ─────────────────────────────────────

export type TimingRegime = "EINSTEIN" | "NEWTON" | "TESLA";
export type ClockMode = "ABSOLUTE" | "RELATIVE";

export interface TimingRegimeMeta {
  key: TimingRegime;
  name: string;
  subtitle: string;
  badge: string;
  color: string;
  bgLight: string;
  borderLight: string;
  summary: string;
  description: string;
  rules: string[];
}

export const TIMING_REGIMES: Record<TimingRegime, TimingRegimeMeta> = {
  EINSTEIN: {
    key: "EINSTEIN",
    name: "Régime Einstein",
    subtitle: "Le Continuum",
    badge: "Einstein",
    color: "#6366f1",
    bgLight: "rgba(99, 102, 241, 0.08)",
    borderLight: "rgba(99, 102, 241, 0.25)",
    summary: "Flux temporel monolithique sans segmentation. Toutes les questions sont accessibles en continu.",
    description:
      "Inspiré du principe du continuum espace-temps, le temps s'écoule comme un bloc unifié. Le candidat dispose d'une liberté totale pour naviguer d'une matière à l'autre, revenir sur ses choix et gérer son rythme global.",
    rules: [
      "Toutes les questions sont affichées et accessibles librement.",
      "Navigation bidirectionnelle intégrale (aller-retour entre questions et matières).",
      "Chronomètre global pour l'ensemble de l'épreuve.",
      "Idéal pour les concours standards et le mode entraînement.",
    ],
  },
  NEWTON: {
    key: "NEWTON",
    name: "Régime Newton",
    subtitle: "La Mécanique",
    badge: "Newton",
    color: "#f59e0b",
    bgLight: "rgba(245, 158, 11, 0.08)",
    borderLight: "rgba(245, 158, 11, 0.25)",
    summary: "Temps mécaniquement segmenté par matière. Écran de repos inter-phase pour les candidats en avance.",
    description:
      "Selon les lois du mouvement newtonien, le temps est découpé en phases d'action précises. Chaque domaine dispose d'un temps dédié calculé au prorata de ses questions. Une fois une phase terminée, le candidat patiente en zone de repos jusqu'au déclenchement de la phase suivante.",
    rules: [
      "Chaque matière constitue une phase indépendante avec son propre temps imparti.",
      "Accès restreint aux questions de la phase en cours uniquement.",
      "Si vous terminez une phase en avance, vous accédez à un écran de repos avec compte à rebours.",
      "Transition synchronisée vers la matière suivante dès l'échéance de la phase.",
      "Aucun retour possible vers les matières des phases précédentes.",
    ],
  },
  TESLA: {
    key: "TESLA",
    name: "Régime Tesla",
    subtitle: "L'Éclair",
    badge: "Tesla",
    color: "#06b6d4",
    bgLight: "rgba(6, 182, 212, 0.08)",
    borderLight: "rgba(6, 182, 212, 0.25)",
    summary: "Cadence électrique stricte : 1 question = 1 minute chrono sans aucun temps mort.",
    description:
      "Inspiré de l'impulsion électrique instantanée de Nikola Tesla, chaque question se présente comme une décharge de 60 secondes. Lorsque le chronomètre individuel expire, la question suivante s'impose automatiquement. Un défi intense de réactivité et d'endurance cognitive.",
    rules: [
      "Exactement 60 secondes allouées par question.",
      "Affichage séquentiel : une seule question présentée à la fois.",
      "Passage automatique à la question suivante à l'expiration de la minute.",
      "Aucun retour en arrière possible : chaque décision est définitive.",
      "Durée totale de la salle plafonnée à 5 heures au maximum.",
    ],
  },
};

// ─── Modes d'Affichage du Chronomètre ─────────────────────────────────────────

export type ChronoMode = "GALILEE" | "HEISENBERG" | "SCHRODINGER";

export interface ChronoModeMeta {
  key: ChronoMode;
  name: string;
  subtitle: string;
  badge: string;
  color: string;
  bgLight: string;
  borderLight: string;
  summary: string;
  description: string;
  rules: string[];
}

export const CHRONO_MODES: Record<ChronoMode, ChronoModeMeta> = {
  GALILEE: {
    key: "GALILEE",
    name: "Mode Galilée",
    subtitle: "L'Observation Continue",
    badge: "Galilée",
    color: "#6366f1",
    bgLight: "rgba(99, 102, 241, 0.08)",
    borderLight: "rgba(99, 102, 241, 0.25)",
    summary: "Affichage permanent et continu du chronomètre de la première à la dernière seconde.",
    description:
      "Inspiré du principe d'observation galiléenne et de l'isochronisme du pendule, le temps est mesurable et observable à chaque instant. Idéal pour une gestion temporelle classique et méthodique.",
    rules: [
      "Chronomètre affiché en permanence à l'écran.",
      "Décompte continu et fluide de 100% jusqu'à l'échéance.",
      "Passage en état critique visuel et sonore sous les 60 secondes.",
    ],
  },
  HEISENBERG: {
    key: "HEISENBERG",
    name: "Mode Heisenberg",
    subtitle: "Les Fenêtres d'Incertitude",
    badge: "Heisenberg",
    color: "#f59e0b",
    bgLight: "rgba(245, 158, 11, 0.08)",
    borderLight: "rgba(245, 158, 11, 0.25)",
    summary: "Chronomètre intermittent visible uniquement lors de fenêtres clés : 100-95%, 75-70%, 55-50%, 25-20% et sous 60s.",
    description:
      "Inspiré du principe d'incertitude quantique, le chronomètre ne s'impose pas en continu. Il apparaît ponctuellement lors de fenêtres de repérage stratégiques, puis s'efface pour favoriser votre concentration.",
    rules: [
      "Visible au départ : de 100% à 95% du temps total.",
      "Fenêtre du 1er quart : visible entre 75% et 70% du temps restant.",
      "Fenêtre médiane : visible entre 55% et 50% du temps restant.",
      "Fenêtre du dernier quart : visible entre 25% et 20% du temps restant.",
      "Révélation complète sous les 60 secondes (avec tierces et bips d'adrénaline).",
    ],
  },
  SCHRODINGER: {
    key: "SCHRODINGER",
    name: "Mode Schrödinger",
    subtitle: "La Boîte Noire & Mesure Quantique",
    badge: "Schrödinger",
    color: "#8b5cf6",
    bgLight: "rgba(139, 92, 246, 0.08)",
    borderLight: "rgba(139, 92, 246, 0.25)",
    summary: "Chronomètre masqué avec 2 ouvertures de boîte autorisées (flash de 5s) et révélation d'urgence à 60s.",
    description:
      "L'effet boîte noire absolu. Le temps s'écoule à l'état latent sans indication visuelle. Le candidat dispose d'exactement 2 'Mesures Quantiques' pour ouvrir la boîte et observer le chrono pendant 5 secondes. À 60 secondes de la fin, la boîte s'ouvre définitivement pour le rush final.",
    rules: [
      "Chronomètre 100% masqué par défaut.",
      "Le candidat dispose de 2 jokers 'Ouvrir la boîte' (5 secondes de visibilité par utilisation).",
      "Révélation d'urgence automatique sous les 60 secondes (avec tierces/centièmes et bips audio).",
    ],
  },
};

// ─── Legacy compatibility ───────────────────────────────────────────────────
export const SCHRODINGER_CONFIG = CHRONO_MODES.SCHRODINGER;

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

// ─── Questions ───────────────────────────────────────────────────────────────

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
  passageId?: string;
  scope?: Scope;
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
  timingRegime?: TimingRegime;
  clockMode?: ClockMode;
  chronoMode?: ChronoMode;
  subjectOrder?: Subject[];
}

export interface NewtonPhaseConfig {
  subject: Subject;
  label: string;
  durationSec: number;
  questionCount: number;
  questionIds: string[];
}

export interface NewtonTimingConfig {
  totalSec: number;
  phases: NewtonPhaseConfig[];
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
