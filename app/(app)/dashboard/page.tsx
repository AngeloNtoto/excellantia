import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { DashboardClient } from "./dashboard-client";

export const metadata: Metadata = { title: "Mon tableau de bord" };

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/");
  if (session.role === "ADMIN") redirect("/admin");

  // Historique des tentatives
  const attempts = await prisma.attempt.findMany({
    where: { userId: session.id, status: { not: "IN_PROGRESS" } },
    include: { room: { select: { title: true, durationMin: true } } },
    orderBy: { submittedAt: "desc" },
    take: 10,
  });

  // Stats globales
  const submitted = attempts.filter((a) => a.score !== null);
  const avgPct = submitted.length
    ? Math.round(submitted.reduce((s, a) => s + (a.percentage ?? 0), 0) / submitted.length)
    : null;
  const bestPct = submitted.length ? Math.max(...submitted.map((a) => a.percentage ?? 0)) : null;

  // Moyennes par rubrique
  const subjectTotals: Record<string, { sum: number; count: number }> = {
    MATH: { sum: 0, count: 0 },
    FRENCH: { sum: 0, count: 0 },
    ENGLISH: { sum: 0, count: 0 },
    GENERAL_CULTURE: { sum: 0, count: 0 },
  };

  for (const attempt of submitted) {
    if (attempt.scoreBySubject) {
      const s = attempt.scoreBySubject as Record<string, number>;
      for (const key of Object.keys(subjectTotals)) {
        if (s[key] !== undefined) {
          subjectTotals[key].sum += s[key];
          subjectTotals[key].count++;
        }
      }
    }
  }

  // Salles disponibles
  const rooms = await prisma.room.findMany({
    where: { status: "RUNNING", visibility: "PUBLIC" },
    orderBy: { startsAt: "asc" },
    take: 3,
  });

  return (
    <DashboardClient 
      firstname={session.fullname.split(" ")[0]}
      stats={{
        attemptsCount: submitted.length,
        avgPct,
        bestPct
      }}
      subjectTotals={subjectTotals}
      rooms={rooms}
      attempts={attempts}
    />
  );
}
