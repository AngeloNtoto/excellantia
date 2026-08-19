import { z } from "zod";
import type { Subject, Difficulty } from "./types";

// ─── Validation connexion ─────────────────────────────────────────────────────

export const loginSchema = z.object({
  code: z
    .string()
    .length(14, "Le code doit contenir exactement 14 chiffres")
    .regex(/^\d{14}$/, "Le code ne doit contenir que des chiffres"),
});

// ─── Validation import candidats ─────────────────────────────────────────────

export const candidateImportSchema = z.array(
  z.object({
    fullname: z.string().min(1, "Le nom complet est obligatoire"),
    code: z
      .string()
      .length(14, "Le code doit contenir exactement 14 chiffres")
      .regex(/^\d{14}$/, "Le code ne doit contenir que des chiffres"),
    role: z.enum(["ADMIN", "CANDIDATE"]).default("CANDIDATE"),
  })
);

export type CandidateImportRow = z.infer<typeof candidateImportSchema>[number];

export const createTextContentSchema = z.object({
  title: z.string().min(1, "Le titre du texte est obligatoire"),
  language: z.enum(["FR", "EN"]).default("FR"),
  content: z.string().min(20, "Le contenu doit contenir au moins 20 caractères"),
  source: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const createQuestionSchema = z.object({
  textContentId: z.string().cuid().nullable().optional(),
  subject: z.enum(["MATH", "FRENCH", "ENGLISH", "GENERAL_CULTURE"]),
  topic: z.string().optional(),
  subtopic: z.string().optional(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  language: z.enum(["FR", "EN"]).default("FR"),
  statement: z.string().min(2, "L'énoncé doit comporter au moins 2 caractères"),
  options: z.array(z.string().min(1, "Chaque option est obligatoire")).length(4, "Il faut exactement 4 options"),
  answerIndex: z.coerce.number().int().min(0).max(3),
  explanation: z.string().optional(),
  optionExplanations: z.array(z.string().optional()).max(4).optional(),
  type: z.enum(["MULTIPLE_CHOICE", "PASSAGE_BASED"]).default("MULTIPLE_CHOICE"),
  source: z.enum(["USER_CREATED", "ROOM_GENERATED", "TRAINING_POOL"]).default("USER_CREATED"),
  mode: z.enum(["TRAINING", "SIMULATION"]).optional(),
  scope: z.enum(["DRC", "INTERNATIONAL"]).optional(),
  passageId: z.string().optional(),
});

// ─── Validation création salle ────────────────────────────────────────────────

export const createRoomSchema = z.object({
  title: z.string().min(1, "Le titre est obligatoire"),
  mode: z.enum(["TRAINING", "SIMULATION"]).default("SIMULATION"),
  includeTrainingQuestions: z.boolean().default(false),
  visibility: z.enum(["PUBLIC", "PRIVATE"]).default("PUBLIC"),
  accessCode: z.string().optional(),
  timeMode: z.enum(["ABSOLUTE", "RELATIVE"]).default("ABSOLUTE"),
  durationMin: z.coerce.number().int().min(1).max(600).default(100),
  scheduledAt: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), "Date invalide"),
  startNow: z.boolean().default(false),
  // Répartition par rubrique
  mathCount: z.coerce.number().int().min(0).default(25),
  frenchCount: z.coerce.number().int().min(0).default(25),
  englishCount: z.coerce.number().int().min(0).default(25),
  cultureCount: z.coerce.number().int().min(0).default(25),
  // Difficultés (pourcentages 0-100)
  easyPct: z.coerce.number().min(0).max(100).default(50),
  mediumPct: z.coerce.number().min(0).max(100).default(25),
  // Culture générale
  cultureDrc: z.coerce.number().int().min(0).default(0),
  // Sélection des sous-branches (JSON string)
  selectedTopics: z.string().optional().default("{}"),
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;

// ─── Validation code salle privée ─────────────────────────────────────────────

export const accessCodeSchema = z.object({
  code: z.string().min(1, "Le code d'accès est obligatoire"),
  roomId: z.string().cuid(),
});

// ─── Validation question JSON ─────────────────────────────────────────────────

const subjectValues = ["MATH", "FRENCH", "ENGLISH", "GENERAL_CULTURE"] as const;
const difficultyValues = ["EASY", "MEDIUM", "HARD"] as const;
const scopeValues = ["DRC", "INTERNATIONAL"] as const;

export const questionSchema = z.object({
  id: z.string().min(1),
  subject: z.enum(subjectValues),
  topic: z.string().optional(),
  subtopic: z.string().optional(),
  difficulty: z.enum(difficultyValues),
  statement: z.string().min(1),
  options: z.tuple([z.string(), z.string(), z.string(), z.string()]),
  answerIndex: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
  explanation: z.string().min(1, "L'explication est obligatoire"),
  optionExplanations: z.tuple([z.string(), z.string(), z.string(), z.string()]).optional(),
  passageId: z.string().optional(),
  scope: z.enum(scopeValues).optional(),
  type: z.literal("PASSAGE_QUESTION").optional(),
});

export const passageSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  language: z.enum(["FR", "EN"]),
  content: z.string().min(1),
  source: z.string().optional(),
});

export type QuestionInput = z.infer<typeof questionSchema>;
export type PassageInput = z.infer<typeof passageSchema>;
