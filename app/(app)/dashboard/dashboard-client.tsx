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
      className="max-w-7xl mx-auto px-4 sm:px-6 py-10"
    >
      {/* HERO BANNER - Premium Mesh Gradient */}
      <motion.div variants={itemVariants} className="relative rounded-3xl overflow-hidden bg-slate-900 border border-white/10 p-8 sm:p-12 mb-12 shadow-2xl">
        {/* Dynamic Background Gradients */}
        <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-blue-500/20 rounded-full blur-[100px] pointer-events-none -translate-x-1/3 translate-y-1/3" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-blue-200 text-xs font-bold uppercase tracking-[0.2em] mb-8 backdrop-blur-md shadow-inner">
              <Sparkles className="w-4 h-4 text-blue-400" />
              Espace Candidat
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
              Bonjour, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">{firstname}</span> 
              <motion.span 
                className="inline-block origin-bottom-right ml-2"
                animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 5 }}
              >👋</motion.span>
            </h1>
            <p className="text-blue-100/80 text-lg md:text-xl max-w-2xl leading-relaxed font-medium">
              {isExcellent 
                ? "Excellent travail ! Vos résultats témoignent d'une préparation assidue. Continuez sur cette lancée."
                : "C'est le moment idéal pour lancer une nouvelle session d'entraînement et améliorer vos scores."}
            </p>
          </div>
          
          <div className="hidden lg:flex items-center justify-center w-32 h-32 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl rotate-3 hover:rotate-6 hover:scale-105 transition-all duration-500 shadow-2xl">
            <GraduationCap className="w-16 h-16 text-blue-300 drop-shadow-lg" />
          </div>
        </div>
      </motion.div>

      {/* STATS GLOBALES */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
        <motion.div variants={itemVariants} whileHover={{ y: -6, scale: 1.02 }} className="group relative bg-white dark:bg-[#0B1120] border border-gray-100 dark:border-white/10 rounded-[2rem] p-6 sm:p-8 shadow-sm hover:shadow-xl dark:shadow-none transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 flex items-start gap-5">
            <div className="p-4 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl ring-1 ring-blue-500/20 shadow-inner">
              <Target className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Tentatives</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">{stats.attemptsCount}</span>
                <span className="text-sm font-semibold text-gray-400">sessions</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} whileHover={{ y: -6, scale: 1.02 }} className="group relative bg-white dark:bg-[#0B1120] border border-gray-100 dark:border-white/10 rounded-[2rem] p-6 sm:p-8 shadow-sm hover:shadow-xl dark:shadow-none transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 flex items-start gap-5">
            <div className="p-4 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl ring-1 ring-indigo-500/20 shadow-inner">
              <TrendingUp className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Moyenne</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">{stats.avgPct !== null ? stats.avgPct : "—"}</span>
                {stats.avgPct !== null && <span className="text-xl font-bold text-indigo-500">%</span>}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} whileHover={{ y: -6, scale: 1.02 }} className="group relative bg-white dark:bg-[#0B1120] border border-gray-100 dark:border-white/10 rounded-[2rem] p-6 sm:p-8 shadow-sm hover:shadow-xl dark:shadow-none transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 flex items-start gap-5">
            <div className="p-4 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl ring-1 ring-amber-500/20 shadow-inner">
              <Star className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Meilleur</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">{stats.bestPct !== null ? stats.bestPct : "—"}</span>
                {stats.bestPct !== null && <span className="text-xl font-bold text-amber-500">%</span>}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* PERFORMANCES */}
        <motion.div variants={itemVariants} className="group bg-white dark:bg-[#0B1120] border border-gray-100 dark:border-white/10 rounded-[2rem] p-6 sm:p-8 shadow-sm hover:shadow-xl dark:shadow-none transition-all duration-300">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/20 shadow-inner">
              <Activity className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">Performances détaillées</h2>
          </div>
          
          <div className="space-y-7">
            {Object.entries(subjectTotals).map(([key, { sum, count }]) => {
              const avg = count > 0 ? Math.round((sum / count / 25) * 100) : 0;
              const config = SUBJECT_CONFIG[key] || SUBJECT_CONFIG.MATH;
              const Icon = config.icon;

              return (
                <div key={key} className="relative">
                  <div className="flex justify-between items-end mb-3">
                    <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200 font-bold text-sm tracking-wide">
                      <Icon className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                      {config.label || key}
                    </div>
                    <span className="text-base font-black text-blue-600 dark:text-blue-400">
                      {count > 0 ? `${avg}%` : "—"}
                    </span>
                  </div>
                  <div className="h-4 w-full rounded-full bg-slate-100 dark:bg-slate-800/50 overflow-hidden ring-1 ring-inset ring-slate-200 dark:ring-white/5 shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: `${avg}%` }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 1.5, ease: [0.34, 1.56, 0.64, 1], delay: 0.2 }}
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-400 relative shadow-[0_0_15px_rgba(59,130,246,0.5)]" 
                    >
                      <div className="absolute inset-0 bg-white/20 w-full h-full" style={{ backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)', backgroundSize: '1rem 1rem' }} />
                    </motion.div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* SALLES EN COURS */}
        <motion.div variants={itemVariants} className="group bg-white dark:bg-[#0B1120] border border-gray-100 dark:border-white/10 rounded-[2rem] p-6 sm:p-8 shadow-sm hover:shadow-xl dark:shadow-none flex flex-col relative transition-all duration-300">
          <div className="flex items-center gap-4 mb-8 relative z-10">
            <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-500/20 shadow-inner">
              <Clock className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">Salles actives</h2>
          </div>
          
          <div className="relative z-10 flex-1 flex flex-col justify-center">
            {rooms.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center py-12 bg-slate-50 dark:bg-white/[0.02] rounded-3xl border border-slate-100 dark:border-white/5"
              >
                <div className="w-16 h-16 bg-white dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-white/5 shadow-sm">
                  <Activity className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Aucune épreuve en cours pour l'instant.</p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {rooms.map((room, i) => (
                  <motion.a
                    key={room.id}
                    href={`/rooms/${room.id}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1, type: "spring", stiffness: 300, damping: 24 }}
                    className="group/item block p-5 bg-slate-50 dark:bg-white/[0.03] hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-2xl border border-slate-100 dark:border-white/5 hover:border-blue-200 dark:hover:border-blue-500/30 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        Ouverte
                      </span>
                      <div className="w-10 h-10 rounded-full bg-white dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover/item:bg-blue-600 group-hover/item:text-white dark:group-hover/item:bg-blue-500 shadow-sm transition-all duration-300">
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                    <p className="font-extrabold text-lg text-slate-900 dark:text-white group-hover/item:text-blue-700 dark:group-hover/item:text-blue-300 transition-colors line-clamp-1">
                      {room.title}
                    </p>
                  </motion.a>
                ))}
              </div>
            )}
          </div>

          <a
            href="/rooms"
            className="flex items-center justify-center gap-3 mt-8 py-4 px-6 rounded-2xl text-sm font-bold text-white bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 hover:scale-[1.02] transition-all duration-300 w-full shadow-lg shadow-slate-900/20 dark:shadow-blue-500/20"
          >
            Rejoindre une salle
            <ArrowRight className="w-5 h-5" />
          </a>
        </motion.div>
      </div>

      {/* HISTORIQUE */}
      {attempts.length > 0 && (
        <motion.div variants={itemVariants} className="group bg-white dark:bg-[#0B1120] border border-gray-100 dark:border-white/10 rounded-[2rem] shadow-sm hover:shadow-xl dark:shadow-none overflow-hidden transition-all duration-300">
          <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-white/10 flex items-center justify-between bg-slate-50/50 dark:bg-transparent">
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-4 tracking-tight">
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20 shadow-inner">
                <BookOpen className="w-6 h-6" />
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
