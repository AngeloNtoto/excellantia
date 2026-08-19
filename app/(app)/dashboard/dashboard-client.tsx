"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Trophy, TrendingUp, Target, ArrowRight, PlayCircle, BookOpen,
  Clock, Activity, Star, BookA, Globe, Calculator,
  GraduationCap, CheckCircle2, ChevronRight, BarChart3,
  Layers, Award, CheckCircle
} from "lucide-react";

/* ── Charte matières ──────────────────────────────────────────────────────── */
const SUBJECT_CONFIG: Record<string, {
  label: string;
  icon: any;
  color: string;
  bg: string;
  bar: string;
}> = {
  MATH: {
    label: "Mathématiques",
    icon: Calculator,
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-50 dark:bg-indigo-500/10",
    bar: "bg-indigo-600 dark:bg-indigo-500",
  },
  FRENCH: {
    label: "Français",
    icon: BookA,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-500/10",
    bar: "bg-blue-600 dark:bg-blue-500",
  },
  ENGLISH: {
    label: "Anglais",
    icon: Globe,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-500/10",
    bar: "bg-amber-600 dark:bg-amber-500",
  },
  GENERAL_CULTURE: {
    label: "Culture Générale",
    icon: GraduationCap,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    bar: "bg-emerald-600 dark:bg-emerald-500",
  },
};

/* ── Animation variants ───────────────────────────────────────────────────── */
const container: any = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item: any = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } },
};

/* ── Props ────────────────────────────────────────────────────────────────── */
interface DashboardClientProps {
  firstname: string;
  stats: { attemptsCount: number; avgPct: number | null; bestPct: number | null };
  subjectTotals: Record<string, { sum: number; count: number }>;
  rooms: any[];
  attempts: any[];
}

/* ── Composant badge de score ─────────────────────────────────────────────── */
function ScoreBadge({ pct }: { pct: number | null }) {
  if (pct === null) return <span className="text-2xl font-bold text-slate-400">—</span>;
  const color = pct >= 70 ? "text-emerald-600 dark:text-emerald-400" : pct >= 50 ? "text-indigo-600 dark:text-indigo-400" : "text-rose-600 dark:text-rose-400";
  return (
    <div className="flex items-baseline gap-0.5">
      <span className={`text-2xl font-bold ${color}`}>{pct}</span>
      <span className={`text-sm font-semibold ${color}`}>%</span>
    </div>
  );
}

export function DashboardClient({ firstname, stats, subjectTotals, rooms, attempts }: DashboardClientProps) {
  const isExcellent = stats.avgPct !== null && stats.avgPct >= 70;
  const hasActivity = stats.attemptsCount > 0;

  return (
    <motion.main
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6"
    >
      {/* ── HERO BANNER PRO & SOBRE (SANS DÉGRADÉ NI EMOJI) ───────────────── */}
      <motion.div
        variants={item}
        className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <GraduationCap className="w-3.5 h-3.5" />
              Espace Candidat
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Bonjour, {firstname}
            </h1>

            <p className="text-slate-600 dark:text-slate-400 text-sm max-w-xl leading-relaxed">
              {hasActivity
                ? isExcellent
                  ? "Vos performances globales sont excellentes. Maintenez ce niveau d'entraînement pour réussir vos épreuves."
                  : "Consultez vos statistiques par matière et complétez des sessions pour continuer votre progression."
                : "Bienvenue sur votre espace de préparation. Démarrez un entraînement ou rejoignez une salle pour commencer."}
            </p>

            {/* Actions rapides */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <Link
                href="/training"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm transition-all shadow-sm active:scale-95"
              >
                <PlayCircle className="w-4 h-4" />
                Nouvel entraînement
              </Link>
              <Link
                href="/rooms"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm transition-all active:scale-95"
              >
                <Target className="w-4 h-4" />
                Salles disponibles
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Statut rapide */}
          <div className="hidden md:flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 shrink-0">
            <div className="p-3 rounded-lg bg-indigo-600 text-white">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Statut de préparation</div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {hasActivity ? `${stats.attemptsCount} session(s) effectuée(s)` : "Prêt pour la 1ère session"}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── KPI CARDS ────────────────────────────────────────────────────────── */}
      <motion.div variants={container} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Sessions terminées",
            value: stats.attemptsCount,
            suffix: "",
            icon: Target,
            color: "text-indigo-600 dark:text-indigo-400",
            bg: "bg-indigo-50 dark:bg-indigo-500/10",
            border: "border-l-indigo-600",
          },
          {
            label: "Moyenne générale",
            value: stats.avgPct,
            suffix: "%",
            icon: TrendingUp,
            color: stats.avgPct !== null && stats.avgPct >= 70 ? "text-emerald-600 dark:text-emerald-400" : "text-indigo-600 dark:text-indigo-400",
            bg: "bg-indigo-50 dark:bg-indigo-500/10",
            border: "border-l-indigo-600",
          },
          {
            label: "Meilleur résultat",
            value: stats.bestPct,
            suffix: "%",
            icon: Trophy,
            color: "text-amber-600 dark:text-amber-400",
            bg: "bg-amber-50 dark:bg-amber-500/10",
            border: "border-l-amber-500",
          },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.label}
              variants={item}
              className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-l-4 ${kpi.border} rounded-xl p-4 sm:p-5 shadow-sm`}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{kpi.label}</p>
                <div className={`p-1.5 rounded-lg ${kpi.bg} ${kpi.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <ScoreBadge pct={kpi.value as number | null} />
            </motion.div>
          );
        })}
      </motion.div>

      {/* ── PERFORMANCES + SALLES ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Performances par matière */}
        <motion.div
          variants={item}
          className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Performances par matière</h2>
                <p className="text-xs text-slate-500">Moyenne des scores obtenus</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {Object.entries(subjectTotals).map(([key, { sum, count }]) => {
              const avg = count > 0 ? Math.round((sum / count / 25) * 100) : 0;
              const cfg = SUBJECT_CONFIG[key] ?? SUBJECT_CONFIG.MATH;
              const Icon = cfg.icon;
              return (
                <div key={key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                      <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                      {cfg.label}
                    </div>
                    <div className="flex items-center gap-2 font-semibold">
                      <span className="text-slate-400 text-[11px]">
                        {count > 0 ? `${count} session${count > 1 ? "s" : ""}` : "Aucune épreuve"}
                      </span>
                      <span className={`font-bold ${count > 0 ? "text-slate-900 dark:text-white" : "text-slate-400"}`}>
                        {count > 0 ? `${avg}%` : "—"}
                      </span>
                    </div>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${avg}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className={`h-full rounded-full ${cfg.bar}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {!hasActivity && (
            <div className="mt-5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/40 text-center text-xs text-slate-500">
              Aucune session enregistrée. Vos statistiques s'afficheront après votre premier examen.
            </div>
          )}
        </motion.div>

        {/* Salles actives */}
        <motion.div
          variants={item}
          className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Salles ouvertes</h2>
                <p className="text-xs text-slate-500">Épreuves officielles en cours</p>
              </div>
            </div>

            <div className="space-y-2.5">
              {rooms.length === 0 ? (
                <div className="py-8 px-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 text-center">
                  <Clock className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Aucune salle ouverte en ce moment</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Revenez à l'horaire de l'épreuve.</p>
                </div>
              ) : (
                rooms.map((room) => (
                  <Link
                    key={room.id}
                    href={`/rooms/${room.id}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/40 transition-all group"
                  >
                    <div className="min-w-0 flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                        {room.title}
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors shrink-0 ml-2" />
                  </Link>
                ))
              )}
            </div>
          </div>

          <Link
            href="/rooms"
            className="mt-4 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all"
          >
            Accéder à toutes les salles
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>
      </div>

      {/* ── HISTORIQUE DES SESSIONS ──────────────────────────────────────────── */}
      {attempts.length > 0 && (
        <motion.div
          variants={item}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Historique récent</h2>
                <p className="text-xs text-slate-500">{attempts.length} session{attempts.length > 1 ? "s" : ""}</p>
              </div>
            </div>
          </div>

          {/* Vue mobile : cartes */}
          <div className="sm:hidden divide-y divide-slate-100 dark:divide-slate-800">
            {attempts.map((a) => {
              const pct = a.percentage ?? 0;
              const isSuccess = pct >= 50;
              return (
                <div key={a.id} className="p-3.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-slate-900 dark:text-white truncate">{a.room.title}</p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                      <span>Score: <strong className={isSuccess ? "text-emerald-600" : "text-rose-600"}>{Math.round(pct)}%</strong></span>
                      <span>•</span>
                      <span>{a.status === "SUBMITTED" ? "Validé" : "Auto"}</span>
                    </div>
                  </div>
                  <Link
                    href={`/exam/${a.roomId}/correction/${a.id}`}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold shrink-0"
                  >
                    Détails
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Vue desktop : tableau */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="px-5 py-3">Épreuve</th>
                  <th className="px-5 py-3">Points</th>
                  <th className="px-5 py-3">Score</th>
                  <th className="px-5 py-3">Statut</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {attempts.map((a) => {
                  const pct = a.percentage ?? 0;
                  const isSuccess = pct >= 50;
                  return (
                    <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                        {a.room.title}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-slate-600 dark:text-slate-300">
                        {a.score ?? "—"}/100
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`font-bold ${isSuccess ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                          {a.percentage !== null ? `${Math.round(pct)}%` : "—"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          a.status === "SUBMITTED"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        }`}>
                          {a.status === "SUBMITTED" ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {a.status === "SUBMITTED" ? "Validé" : "Auto-soumis"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          href={`/exam/${a.roomId}/correction/${a.id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          Consulter
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
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
