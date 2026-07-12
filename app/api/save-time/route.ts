import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

// This endpoint is used by navigator.sendBeacon when the page unloads (pausable timer)
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const body = await req.json();
    const { attemptId, timeUsedSec } = body;

    if (!attemptId || typeof timeUsedSec !== "number") {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    const attempt = await prisma.attempt.findUnique({ where: { id: attemptId } });
    if (!attempt || attempt.userId !== session.id) {
      return NextResponse.json({ error: "Tentative introuvable" }, { status: 404 });
    }
    if (attempt.status !== "IN_PROGRESS") {
      return NextResponse.json({ error: "Tentative déjà soumise" }, { status: 400 });
    }

    await prisma.attempt.update({
      where: { id: attemptId },
      data: { timeUsedSec },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
