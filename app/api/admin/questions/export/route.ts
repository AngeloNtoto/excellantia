import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// Mapping des valeurs enum vers des libellés lisibles dans l'export JSON
const SUBJECT_LABELS: Record<string, string> = {
  MATH: "Mathématiques",
  FRENCH: "Français",
  ENGLISH: "Anglais",
  GENERAL_CULTURE: "Culture Générale",
};

const DIFFICULTY_LABELS: Record<string, string> = {
  EASY: "Facile",
  MEDIUM: "Moyen",
  HARD: "Difficile",
};

const MODE_LABELS: Record<string, string> = {
  TRAINING: "Entraînement",
  SIMULATION: "Simulation",
};

/**
 * GET /api/admin/questions/export
 * Exporte les questions en JSON selon les filtres passés en query string.
 * Paramètres optionnels :
 *   - subject : MATH | FRENCH | ENGLISH | GENERAL_CULTURE
 *   - difficulty : EASY | MEDIUM | HARD
 *   - mode : TRAINING | SIMULATION | UNIVERSAL
 *   - textOnly : WITH_TEXT | WITHOUT_TEXT
 *   - sortBy : RECENT | MOST_APPEARED | MOST_ANSWERED | LEAST_APPEARED
 */
export async function GET(req: NextRequest) {
  // Vérification admin uniquement
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const subject = searchParams.get("subject");
  const difficulty = searchParams.get("difficulty");
  const mode = searchParams.get("mode");
  const textOnly = searchParams.get("textOnly");
  const sortBy = searchParams.get("sortBy") || "RECENT";

  // Construction du filtre Prisma
  const where: Record<string, unknown> = {};
  if (subject && subject !== "ALL") where.subject = subject;
  if (difficulty && difficulty !== "ALL") where.difficulty = difficulty;
  if (mode === "TRAINING") where.mode = "TRAINING";
  else if (mode === "SIMULATION") where.mode = "SIMULATION";
  else if (mode === "UNIVERSAL") where.mode = null;
  if (textOnly === "WITH_TEXT") where.textContentId = { not: null };
  else if (textOnly === "WITHOUT_TEXT") where.textContentId = null;

  // Détermination du tri
  let orderBy: Record<string, string> = { createdAt: "desc" };
  if (sortBy === "MOST_APPEARED") orderBy = { timesAppeared: "desc" };
  else if (sortBy === "MOST_ANSWERED") orderBy = { timesAnswered: "desc" };
  else if (sortBy === "LEAST_APPEARED") orderBy = { timesAppeared: "asc" };

  const questions = await prisma.question.findMany({
    where,
    orderBy,
    include: {
      textContent: { select: { id: true, title: true, language: true } },
    },
  });

  // Transformation en format d'export propre et lisible
  const exported = questions.map((q) => ({
    id: q.id,
    matiere: SUBJECT_LABELS[q.subject] ?? q.subject,
    matiereCode: q.subject,
    difficulte: DIFFICULTY_LABELS[q.difficulty] ?? q.difficulty,
    difficulteCode: q.difficulty,
    mode: q.mode ? MODE_LABELS[q.mode] ?? q.mode : "Universelle",
    modeCode: q.mode ?? "UNIVERSAL",
    langue: q.language,
    chapitre: q.topic ?? null,
    sousChapitre: q.subtopic ?? null,
    portee: q.scope ?? null,
    enonce: q.statement,
    options: Array.isArray(q.options) ? q.options : [],
    reponseCorrecteIndex: q.answerIndex,
    explication: q.explanation ?? null,
    texteDeComprehension: q.textContent
      ? {
          id: q.textContent.id,
          titre: q.textContent.title,
          langue: q.textContent.language,
        }
      : null,
    statistiques: {
      apparitions: q.timesAppeared,
      reponses: q.timesAnswered,
    },
    createdAt: q.createdAt.toISOString(),
  }));

  const filename = `questions_export_${new Date().toISOString().slice(0, 10)}.json`;

  return new NextResponse(
    JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        totalQuestions: exported.length,
        filtresAppliques: {
          matiere: subject || "Toutes",
          difficulte: difficulty || "Toutes",
          mode: mode || "Tous",
          type: textOnly || "Tous",
          tri: sortBy,
        },
        questions: exported,
      },
      null,
      2
    ),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    }
  );
}
