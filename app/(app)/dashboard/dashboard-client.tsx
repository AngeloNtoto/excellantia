"use client";

import { motion } from "framer-motion";
import { Trophy, TrendingUp, Target, ArrowRight, PlayCircle, BookOpen, Clock, Activity, Star, Sparkles, BookA, Globe, Calculator, GraduationCap, CheckCircle2 } from "lucide-react";

// Charte graphique blanc-bleu (Blue/Indigo scale)
const SUBJECT_CONFIG: Record<string, { label: string, icon: any }> = {
  MATH: { label: "Mathématiques", icon: Calculator },
  FRENCH: { label: "Français", icon: BookA },
  ENGLISH: { label: "Anglais", icon: Globe },
  GENERAL_CULTURE: { label: "Culture Générale", icon: GraduationCap },
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

const containerVariants: any = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export function DashboardClient({ firstname, stats, subjectTotals, rooms, attempts }: DashboardClientProps) {
  const isExcellent = stats.avgPct !== null && stats.avgPct >= 70;

  return (
    <motion.main 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto px-4 sm:px-6 py-8"
    >
      {/* HERO BANNER - Soft Blue Theme */}
      <motion.div variants={itemVariants} className="relative rounded-3xl overflow-hidden bg-blue-600 dark:bg-blue-900/30 dark:border dark:border-blue-800/30 p-8 sm:p-10 mb-8 shadow-lg">
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-white/10 dark:bg-blue-500/10 rounded-full blur-[100px] pointer-events-none translate-x-1/3 -translate-y-1/3" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 dark:opacity-20 mix-blend-overlay pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 dark:bg-blue-500/20 border border-white/30 dark:border-blue-500/30 text-white dark:text-blue-200 text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-blue-100 dark:text-blue-300" />
              Espace Candidat
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-4">
              Bonjour, {firstname} <motion.span 
                className="inline-block origin-bottom-right"
                animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 5 }}
              >👋</motion.span>
            </h1>
            <p className="text-blue-100 dark:text-blue-200/80 text-lg max-w-xl leading-relaxed">
              {isExcellent 
                ? "Excellent travail jusqu'à présent. Continuez sur cette lancée pour atteindre vos objectifs !"
                : "C'est le moment idéal pour lancer une nouvelle session d'entraînement et améliorer vos scores."}
            </p>
          </div>
          
          <div className="hidden lg:flex items-center justify-center w-28 h-28 rounded-3xl bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 backdrop-blur-xl rotate-3 hover:rotate-6 transition-transform duration-500">
            <GraduationCap className="w-14 h-14 text-white drop-shadow-md" />
          </div>
        </div>
      </motion.div>

      {/* STATS GLOBALES */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <motion.div variants={itemVariants} whileHover={{ y: -4 }} className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl p-6 shadow-sm dark:shadow-none flex items-start gap-4 transition-all duration-300">
          <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Tentatives</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">{stats.attemptsCount}</span>
              <span className="text-sm font-medium text-gray-400">sessions</span>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} whileHover={{ y: -4 }} className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl p-6 shadow-sm dark:shadow-none flex items-start gap-4 transition-all duration-300">
          <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Moyenne</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">{stats.avgPct !== null ? stats.avgPct : "—"}</span>
              {stats.avgPct !== null && <span className="text-lg font-bold text-blue-500">%</span>}
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} whileHover={{ y: -4 }} className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl p-6 shadow-sm dark:shadow-none flex items-start gap-4 transition-all duration-300">
          <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
            <Star className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Meilleur score</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">{stats.bestPct !== null ? stats.bestPct : "—"}</span>
              {stats.bestPct !== null && <span className="text-lg font-bold text-blue-500">%</span>}
            </div>
          </div>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* PERFORMANCES */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-none">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Activity className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Performances détaillées</h2>
          </div>
          
          <div className="space-y-6">
            {Object.entries(subjectTotals).map(([key, { sum, count }]) => {
              const avg = count > 0 ? Math.round((sum / count / 25) * 100) : 0;
              const config = SUBJECT_CONFIG[key] || SUBJECT_CONFIG.MATH;
              const Icon = config.icon;

              return (
                <div key={key}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200 font-semibold text-sm">
                      <Icon className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                      {config.label || key}
                    </div>
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      {count > 0 ? `${avg}%` : "—"}
                    </span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-blue-50 dark:bg-black/40 overflow-hidden ring-1 ring-inset ring-gray-100 dark:ring-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: `${avg}%` }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
                      className="h-full rounded-full bg-blue-500 relative" 
                    >
                      <div className="absolute inset-0 bg-white/20 w-full h-full" style={{ backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.1) 75%, transparent 75%, transparent)' }} />
                    </motion.div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* SALLES EN COURS */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-none flex flex-col relative">
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Clock className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Salles actives</h2>
          </div>
          
          <div className="relative z-10 flex-1 flex flex-col justify-center">
            {rooms.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center py-8 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5"
              >
                <div className="w-12 h-12 bg-white dark:bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-3 border border-gray-100 dark:border-white/5">
                  <Activity className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">Aucune épreuve en cours pour l'instant.</p>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {rooms.map((room, i) => (
                  <motion.a
                    key={room.id}
                    href={`/rooms/${room.id}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="group block p-4 bg-gray-50 dark:bg-white/5 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-2xl border border-gray-100 dark:border-white/5 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                        Ouverte
                      </span>
                      <div className="w-8 h-8 rounded-full bg-white dark:bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 shadow-sm dark:shadow-none transition-colors">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors line-clamp-1">
                      {room.title}
                    </p>
                  </motion.a>
                ))}
              </div>
            )}
          </div>

          <a
            href="/rooms"
            className="flex items-center justify-center gap-2 mt-6 py-3.5 px-4 rounded-xl text-sm font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all duration-300 w-full"
          >
            Rejoindre une salle
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>

      {/* HISTORIQUE */}
      {attempts.length > 0 && (
        <motion.div variants={itemVariants} className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-3xl shadow-sm dark:shadow-none overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-white/10 flex items-center justify-between bg-gray-50/50 dark:bg-transparent">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <BookOpen className="w-4 h-4" />
              </div>
              Dernières sessions
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/5">
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Épreuve</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Score final</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Performance</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">État</th>
                  <th className="px-6 py-4"></th>
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
                      className="hover:bg-blue-50/50 dark:hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="px-6 py-5">
                        <div className="font-semibold text-gray-900 dark:text-white">{a.room.title}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="inline-flex items-baseline gap-1 font-mono text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-black/30 px-2.5 py-1 rounded-md border border-gray-200 dark:border-white/5">
                          <span>{a.score ?? "—"}</span>
                          <span className="text-xs text-gray-400">/100</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className={`text-base font-bold ${isSuccess ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}`}>
                          {a.percentage !== null ? `${Math.round(pct)}%` : "—"}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                          a.status === "SUBMITTED" 
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400" 
                            : "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400"
                        }`}>
                          {a.status === "SUBMITTED" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                          {a.status === "SUBMITTED" ? "Validé" : "Auto-soumis"}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <a 
                          href={`/exam/${a.roomId}/correction/${a.id}`} 
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 px-3 py-1.5 rounded-lg transition-all"
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
