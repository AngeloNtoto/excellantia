import { NextRequest, NextResponse } from "next/server";
import { getTopicsBySubject } from "@/lib/questions";
import type { Subject } from "@/lib/types";

// ─── GET /api/topics?subject=MATH ────────────────────────────────────────────
// Returns the unique list of topics (sous-branches) for the given subject.
export async function GET(req: NextRequest) {
  const subject = req.nextUrl.searchParams.get("subject") as Subject | null;

  // Validate the subject parameter
  const validSubjects: Subject[] = ["MATH", "FRENCH", "ENGLISH", "GENERAL_CULTURE"];
  if (!subject || !validSubjects.includes(subject)) {
    return NextResponse.json(
      { error: "Paramètre 'subject' invalide. Valeurs acceptées: MATH, FRENCH, ENGLISH, GENERAL_CULTURE" },
      { status: 400 }
    );
  }

  const topics = getTopicsBySubject(subject);
  return NextResponse.json({ subject, topics });
}
