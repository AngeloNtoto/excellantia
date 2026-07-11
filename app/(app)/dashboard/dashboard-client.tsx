"use client";

import { motion } from "framer-motion";
import { Trophy, TrendingUp, Target, ArrowRight, PlayCircle, BookOpen, Clock, Activity, CheckCircle2 } from "lucide-react";

const SUBJECT_LABELS: Record<string, string> = {
  MATH: "Mathématiques",
  FRENCH: "Français",
  ENGLISH: "Anglais",
  GENERAL_CULTURE: "Culture Générale",
};

interface DashboardClientProps {
  firstname: string;
  stats: {
    attemptsCount: number;
    avgPct: number | null;
    bestPct: number | null;
  };
  subjectTotals: Record<string, { sum: number; count: number }>;
  rooms: any[];
  attempts: any[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export function DashboardClient({ firstname, stats, subjectTotals, rooms, attempts }: DashboardClientProps) {
  return (
    <motion.main 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto px-4 sm:px-6 py-8"
    >
      {/* En-tête */}
      <motion.div variants={itemVariants} className="mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-2">
          Bonjour, {firstname} <motion.span 
            className="inline-block origin-bottom-right"
            animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 5 }}
          >👋</motion.span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Votre espace de préparation Excellantia.</p>
      </motion.div>

      {/* Stats globales */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-10">
        <motion.div whileHover={{ y: -4 }} className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-none flex items-start gap-4 transition-all duration-300">
          <div className="p-3 bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 rounded-xl">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Tentatives</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.attemptsCount}</p>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -4 }} className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-none flex items-start gap-4 transition-all duration-300">
          <div className="p-3 bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Moyenne</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.avgPct !== null ? `${stats.avgPct}%` : "—"}</p>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -4 }} className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-none flex items-start gap-4 relative overflow-hidden group transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 via-amber-500/0 to-amber-500/5 group-hover:to-amber-500/10 transition-colors duration-500" />
          <div className="p-3 bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 rounded-xl relative z-10">
            <Trophy className="w-6 h-6" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Meilleur score</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.bestPct !== null ? `${stats.bestPct}%` : "—"}</p>
          </div>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* Moyennes par rubrique */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-none">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500">
              <BookOpen className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Performances</h2>
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
                      {SUBJECT_LABELS[key] || key}
                    </span>
                    <span className={`text-sm font-bold ${style.color}`}>
                      {count > 0 ? `${avg}%` : "—"}
                    </span>
                  </div>
                  <div className={`h-2.5 w-full rounded-full overflow-hidden ${style.bg}`}>
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: `${avg}%` }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                      className={`h-full rounded-full ${style.bar} shadow-sm`} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Salles en cours */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-none flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500">
              <Activity className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Salles en cours</h2>
          </div>
          
          <div className="flex-1 flex flex-col justify-center">
            {rooms.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center py-8"
              >
                <div className="w-14 h-14 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100 dark:border-white/10">
                  <Clock className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">Aucune salle publique en cours.</p>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {rooms.map((room, i) => (
                  <motion.a
                    key={room.id}
                    href={`/rooms/${room.id}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="group flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-2xl border border-gray-100 dark:border-white/5 transition-all duration-300"
                  >
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white mb-1.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {room.title}
                      </p>
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        En cours
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/10 flex items-center justify-center shadow-sm text-indigo-500 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </motion.a>
                ))}
              </div>
            )}
          </div>

          <a
            href="/rooms"
            className="inline-flex items-center justify-center gap-2 mt-6 py-3.5 px-4 rounded-xl text-sm font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all duration-300 w-full"
          >
            Voir toutes les salles
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>

      {/* Historique */}
      {attempts.length > 0 && (
        <motion.div variants={itemVariants} className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-none overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/5">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-200 dark:bg-white/10">
                <CheckCircle2 className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </div>
              Historique récent
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/10">
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Épreuve</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">%</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {attempts.map((a) => {
                  const pct = a.percentage ?? 0;
                  const isSuccess = pct >= 50;
                  
                  return (
                    <motion.tr 
                      key={a.id} 
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="px-6 py-4.5 font-semibold text-gray-900 dark:text-white">{a.room.title}</td>
                      <td className="px-6 py-4.5 font-mono font-medium text-gray-600 dark:text-gray-300">{a.score ?? "—"}/100</td>
                      <td className={`px-6 py-4.5 font-bold ${isSuccess ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                        {a.percentage !== null ? `${Math.round(pct)}%` : "—"}
                      </td>
                      <td className="px-6 py-4.5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                          a.status === "SUBMITTED" 
                            ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400" 
                            : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                        }`}>
                          {a.status === "SUBMITTED" ? "Soumis" : "Auto"}
                        </span>
                      </td>
                      <td className="px-6 py-4.5 text-right">
                        <a 
                          href={`/exam/${a.roomId}/correction/${a.id}`} 
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 px-3 py-1.5 rounded-lg transition-all"
                        >
                          Détails
                          <PlayCircle className="w-4 h-4" />
                        </a>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </motion.main>
  );
}
