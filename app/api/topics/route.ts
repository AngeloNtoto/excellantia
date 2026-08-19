import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Subject } from "@/lib/types";

// ─── GET /api/topics?subject=MATH ────────────────────────────────────────────
// Retourne la liste unique des sous-branches / chapitres pour une matière donnée.
export async function GET(req: NextRequest) {
  const subject = req.nextUrl.searchParams.get("subject") as Subject | null;

  // Validation du paramètre matière
  const validSubjects: Subject[] = ["MATH", "FRENCH", "ENGLISH", "GENERAL_CULTURE"];
  if (!subject || !validSubjects.includes(subject)) {
    return NextResponse.json(
      { error: "Paramètre 'subject' invalide. Valeurs acceptées: MATH, FRENCH, ENGLISH, GENERAL_CULTURE" },
      { status: 400 }
    );
  }

  // Récupération des topics uniquement depuis la base de données
  const dbQuestions = await prisma.question.findMany({
    where: { subject, topic: { not: null } },
    select: { topic: true },
    distinct: ["topic"],
  });
  const topics = dbQuestions
    .map((q) => q.topic)
    .filter((t): t is string => Boolean(t))
    .sort();

  return NextResponse.json({ subject, topics });
}
