import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ContenusClient } from "./contenus-client";
import { BookOpen, Database, FileText } from "lucide-react";

export const metadata = { title: "Banque Pédagogique & Contenus | PreExcellantia" };

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
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* ─── EN-TÊTE PROFESSIONNEL & RESPONSIVE ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl border border-indigo-500/20 shadow-lg relative overflow-hidden">
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Database className="w-3.5 h-3.5" />
              {questions.length} Questions en Base
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <FileText className="w-3 h-3" />
              {texts.length} Textes
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Banque Pédagogique &amp; Contenus
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200/80 max-w-xl">
            Rédigez de nouvelles questions QCM, importez des pools au format JSON et créez des textes de compréhension.
          </p>
        </div>
      </div>

      <ContenusClient questions={questions} texts={texts} stats={stats} />
    </main>
  );
}
