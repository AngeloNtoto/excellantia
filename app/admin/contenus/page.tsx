import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ContenusClient } from "./contenus-client";

export const metadata = { title: "Banque de questions et contenus | Admin" };

export default async function AdminContentPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/");

  // Récupération simultanée des données de contenu
  const [texts, questions, mathCount, frenchCount, englishCount, cultureCount] = await Promise.all([
    prisma.textContent.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { questions: true } },
      },
    }),
    prisma.question.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        textContent: {
          select: { id: true, title: true },
        },
      },
    }),
    prisma.question.count({ where: { subject: "MATH" } }),
    prisma.question.count({ where: { subject: "FRENCH" } }),
    prisma.question.count({ where: { subject: "ENGLISH" } }),
    prisma.question.count({ where: { subject: "GENERAL_CULTURE" } }),
  ]);

  const stats = {
    totalQuestions: questions.length,
    mathCount,
    frenchCount,
    englishCount,
    cultureCount,
    totalTexts: texts.length,
  };

  return (
    <main className="page max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="page-header mb-6">
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: 4 }}>
            Banque de Contenus & Questions
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Gérez vos questions, importez des banques JSON ou rédigez des textes de compréhension.
          </p>
        </div>
      </div>

      <ContenusClient questions={questions} texts={texts} stats={stats} />
    </main>
  );
}
