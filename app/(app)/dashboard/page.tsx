import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { SUBJECT_LABELS } from "@/lib/types";
import { Trophy, TrendingUp, Target, ArrowRight, PlayCircle, BookOpen, Clock, Activity, CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";

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
    <main className="max-w-7xl mx-auto px-6 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* En-tête */}
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-2">
          Bonjour, {session.fullname.split(" ")[0]} <span className="inline-block hover:animate-bounce cursor-default">👋</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Votre espace de préparation Excellantia.</p>
      </div>

      {/* Stats globales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-start gap-4">
          <div className="p-3 bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 rounded-xl">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Tentatives</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{submitted.length}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-start gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Moyenne générale</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{avgPct !== null ? `${avgPct}%` : "—"}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-start gap-4 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 via-amber-500/0 to-amber-500/5 group-hover:to-amber-500/10 transition-colors" />
          <div className="p-3 bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 rounded-xl relative z-10">
            <Trophy className="w-6 h-6" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Meilleur score</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{bestPct !== null ? `${bestPct}%` : "—"}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* Moyennes par rubrique */}
        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6 sm:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3 mb-8">
            <BookOpen className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Moyennes par rubrique</h2>
          </div>
          
          <div className="space-y-6">
            {Object.entries(subjectTotals).map(([key, { sum, count }]) => {
              const avg = count > 0 ? Math.round((sum / count / 25) * 100) : 0;
              const config: Record<string, { color: string, bg: string, bar: string }> = {
                MATH: { color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-100 dark:bg-indigo-950/50", bar: "bg-indigo-500" },
                FRENCH: { color: "text-pink-600 dark:text-pink-400", bg: "bg-pink-100 dark:bg-pink-950/50", bar: "bg-pink-500" },
                ENGLISH: { color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-950/50", bar: "bg-amber-500" },
                GENERAL_CULTURE: { color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-950/50", bar: "bg-emerald-500" }
              };
              const style = config[key];

              return (
                <div key={key}>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {SUBJECT_LABELS[key as keyof typeof SUBJECT_LABELS]}
                    </span>
                    <span className={`text-sm font-bold ${style.color}`}>
                      {count > 0 ? `${avg}%` : "—"}
                    </span>
                  </div>
                  <div className={`h-2.5 w-full rounded-full overflow-hidden ${style.bg}`}>
                    <div 
                      className={`h-full rounded-full ${style.bar} transition-all duration-1000 ease-out`} 
                      style={{ width: `${avg}%` }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Salles en cours */}
        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6 sm:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Salles en cours</h2>
          </div>
          
          <div className="flex-1 flex flex-col justify-center">
            {rooms.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">Aucune salle publique en cours.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {rooms.map((room) => (
                  <a
                    key={room.id}
                    href={`/rooms/${room.id}`}
                    className="group flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl border border-gray-100 dark:border-white/5 transition-all duration-200"
                  >
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {room.title}
                      </p>
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        En cours
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white dark:bg-white/10 flex items-center justify-center shadow-sm text-indigo-500 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>

          <a
            href="/rooms"
            className="inline-flex items-center justify-center gap-2 mt-6 py-3 px-4 rounded-xl text-sm font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors w-full"
          >
            Voir toutes les salles
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Historique */}
      {attempts.length > 0 && (
        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-transparent">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-gray-400" />
              Historique récent
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Épreuve</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">%</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                {attempts.map((a) => {
                  const pct = a.percentage ?? 0;
                  const isSuccess = pct >= 50;
                  
                  return (
                    <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{a.room.title}</td>
                      <td className="px-6 py-4 font-mono font-medium text-gray-600 dark:text-gray-300">{a.score ?? "—"}/100</td>
                      <td className={`px-6 py-4 font-bold ${isSuccess ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                        {a.percentage !== null ? `${Math.round(pct)}%` : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          a.status === "SUBMITTED" 
                            ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400" 
                            : "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                        }`}>
                          {a.status === "SUBMITTED" ? "Soumis" : "Auto-soumis"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <a 
                          href={`/exam/${a.roomId}/correction/${a.id}`} 
                          className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                        >
                          Correction
                          <PlayCircle className="w-4 h-4" />
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
