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

// ─── Validation création salle ────────────────────────────────────────────────

export const createRoomSchema = z.object({
  title: z.string().min(1, "Le titre est obligatoire"),
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
  // hardPct = 100 - easyPct - mediumPct
  // Spécial français/anglais
  frenchPassageQuestions: z.coerce.number().int().min(0).default(0),
  frenchPassages: z.coerce.number().int().min(0).default(0),
  englishPassageQuestions: z.coerce.number().int().min(0).default(0),
  englishPassages: z.coerce.number().int().min(0).default(0),
  // Culture générale
  cultureDrc: z.coerce.number().int().min(0).default(0),
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
