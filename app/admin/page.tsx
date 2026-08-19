import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { checkRoomStatuses } from "@/lib/actions/rooms";
import {
  Users,
  Building2,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  PlayCircle,
  PlusCircle,
  BarChart3,
  Lock,
  Globe,
  BookOpen,
  Clock,
  TrendingUp,
  Award,
  Sparkles,
  Layers,
  Zap,
  Infinity as InfinityIcon,
  Eye,
  EyeOff,
  Activity,
  Calendar,
  ChevronRight,
  Database,
  Timer,
  FileText,
  AlertCircle,
} from "lucide-react";
import {
  SUBJECT_COLORS,
  SUBJECT_LABELS,
  TIMING_REGIMES,
  CHRONO_MODES,
  TimingRegime,
  ChronoMode,
  Subject,
} from "@/lib/types";

export const metadata = { title: "Console d'Administration | PreExcellantia" };

export default async function AdminDashboardPage() {
  const session = await getSession(); // Guarded by admin layout

  // Vérifier et mettre à jour les statuts des salles programmées et expirées
  await checkRoomStatuses();

  // ─── Requêtes de données simultanées pour un chargement instantané ───────────
  const [
    usersCount,
    newUsersThisWeek,
    roomsCount,
    activeRooms,
    scheduledRooms,
    closedRoomsCount,
    submittedAttemptsCount,
    allAttempts,
    questionsCount,
    passagesCount,
    mathCount,
    frenchCount,
    englishCount,
    cultureCount,
    recentAttempts,
    regimesStats,
    chronoStats,
  ] = await Promise.all([
    // Candidats inscrits
    prisma.user.count({ where: { role: "CANDIDATE" } }),
    prisma.user.count({
      where: {
        role: "CANDIDATE",
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
    // Salles créées
    prisma.room.count(),
    // Salles en cours d'exécution
    prisma.room.findMany({
      where: { status: "RUNNING" },
      orderBy: { startsAt: "desc" },
      take: 6,
      include: {
        createdBy: { select: { fullname: true } },
        _count: { select: { attempts: true } },
      },
    }),
    // Salles programmées
    prisma.room.findMany({
      where: { status: "SCHEDULED" },
      orderBy: { startsAt: "asc" },
      take: 4,
      include: {
        createdBy: { select: { fullname: true } },
        _count: { select: { attempts: true } },
      },
    }),
    // Salles terminées
    prisma.room.count({ where: { status: "CLOSED" } }),
    // Copies terminées / soumises
    prisma.attempt.count({
      where: { status: { in: ["SUBMITTED", "AUTO_SUBMITTED_TIME_EXPIRED", "AUTO_SUBMITTED_DISCONNECTED"] } },
    }),
    // Calcul de la moyenne globale
    prisma.attempt.findMany({
      where: {
        status: { in: ["SUBMITTED", "AUTO_SUBMITTED_TIME_EXPIRED", "AUTO_SUBMITTED_DISCONNECTED"] },
        percentage: { not: null },
      },
      select: { percentage: true, score: true, timeUsedSec: true },
    }),
    // Questions et Textes
    prisma.question.count(),
    prisma.textContent.count(),
    prisma.question.count({ where: { subject: "MATH" } }),
    prisma.question.count({ where: { subject: "FRENCH" } }),
    prisma.question.count({ where: { subject: "ENGLISH" } }),
    prisma.question.count({ where: { subject: "GENERAL_CULTURE" } }),
    // Dernières soumissions
    prisma.attempt.findMany({
      where: { status: { in: ["SUBMITTED", "AUTO_SUBMITTED_TIME_EXPIRED"] } },
      orderBy: { updatedAt: "desc" },
      take: 6,
      include: {
        user: { select: { id: true, fullname: true, code: true } },
        room: { select: { id: true, title: true, timingRegime: true, durationMin: true } },
      },
    }),
    // Répartition des régimes temporels
    prisma.room.groupBy({
      by: ["timingRegime"],
      _count: { _all: true },
    }),
    // Répartition des modes chrono
    prisma.room.groupBy({
      by: ["chronoMode"],
      _count: { _all: true },
    }),
  ]);

  // Calcul des métriques statistiques avancées
  const validPercentages = allAttempts
    .map((a) => a.percentage)
    .filter((p): p is number => p !== null && !isNaN(p));

  const averagePercentage =
    validPercentages.length > 0
      ? Math.round(validPercentages.reduce((a, b) => a + b, 0) / validPercentages.length)
      : 0;

  const highestScore =
    validPercentages.length > 0 ? Math.round(Math.max(...validPercentages)) : 0;

  const totalTimeUsedSec = allAttempts.reduce((acc, cur) => acc + (cur.timeUsedSec || 0), 0);
  const avgDurationMinutes =
    allAttempts.length > 0 ? Math.round(totalTimeUsedSec / allAttempts.length / 60) : 0;

  // Formatage des statistiques par matière
  const subjectsData: Array<{ subject: Subject; label: string; count: number; color: string; pct: number }> = [
    { subject: "MATH", label: "Mathématiques", count: mathCount, color: SUBJECT_COLORS.MATH, pct: questionsCount > 0 ? Math.round((mathCount / questionsCount) * 100) : 0 },
    { subject: "FRENCH", label: "Français", count: frenchCount, color: SUBJECT_COLORS.FRENCH, pct: questionsCount > 0 ? Math.round((frenchCount / questionsCount) * 100) : 0 },
    { subject: "ENGLISH", label: "Anglais", count: englishCount, color: SUBJECT_COLORS.ENGLISH, pct: questionsCount > 0 ? Math.round((englishCount / questionsCount) * 100) : 0 },
    { subject: "GENERAL_CULTURE", label: "Culture Générale", count: cultureCount, color: SUBJECT_COLORS.GENERAL_CULTURE, pct: questionsCount > 0 ? Math.round((cultureCount / questionsCount) * 100) : 0 },
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* ─── BANDEAU SUPÉRIEUR : ÉTAT DU SYSTÈME & ACTIONS DIRECTES ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl border border-indigo-500/20 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Système Opérationnel
            </span>
            <span className="text-xs text-indigo-200/60 font-mono">
              PostgreSQL • v2.0
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Tableau de Bord Exécutif
          </h1>
          <p className="text-sm text-indigo-200/80 max-w-2xl">
            Supervision en temps réel des épreuves, monitoring des candidats, gestion des régimes temporels et flux de correction.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <Link
            href="/admin/salles/create"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-indigo-500 hover:bg-indigo-600 text-white transition-all shadow-lg shadow-indigo-500/30 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            Nouvelle Salle
          </Link>
          <Link
            href="/admin/contenus"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all backdrop-blur-sm"
          >
            <Database className="w-4 h-4 text-indigo-300" />
            Banque ({questionsCount})
          </Link>
        </div>
      </div>

      {/* ─── 4 CARTES KPI PRINCIPALES ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1 : Candidats */}
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Candidats Inscrits
            </span>
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {usersCount}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+{newUsersThisWeek} ces 7 derniers jours</span>
            </div>
          </div>
        </div>

        {/* KPI 2 : Salles & Épreuves */}
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Salles & Concours
            </span>
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
              {roomsCount}
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                {activeRooms.length} en cours
              </span>
              <span>•</span>
              <span>{scheduledRooms.length} programmées</span>
            </div>
          </div>
        </div>

        {/* KPI 3 : Copies & Taux de Réussite */}
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Copies Soumises
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {submittedAttemptsCount}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
              <span>Moyenne : <strong className="text-slate-900 dark:text-white">{averagePercentage}%</strong></span>
              <span>•</span>
              <span>Max : <strong className="text-indigo-600 dark:text-indigo-400">{highestScore}%</strong></span>
            </div>
          </div>
        </div>

        {/* KPI 4 : Questions en Base */}
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Banque Pédagogique
            </span>
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-purple-600 dark:text-purple-400">
              {questionsCount}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
              <span>{passagesCount} textes de lecture</span>
              <span>•</span>
              <span>4 matières</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── SECTION 2 : SURVEILLANCE LIVE DES SALLES & RÉPARTITION PÉDAGOGIQUE ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* COLONNE GAUCHE (2/3) : SALLES EN COURS ET PROGRAMMÉES */}
        <div className="lg:col-span-2 space-y-6">
          {/* Panneau des Salles Actives */}
          <div className="bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Activity className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Surveillance Directe des Salles
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Salles actuellement ouvertes aux compositions
                  </p>
                </div>
              </div>

              <Link
                href="/admin/salles"
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                Toutes les salles
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {activeRooms.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700/60 p-6">
                <Building2 className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Aucune épreuve n'est en cours actuellement
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Les salles programmées s'ouvriront automatiquement à leur échéance.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeRooms.map((room) => {
                  const regime = TIMING_REGIMES[room.timingRegime as TimingRegime] || TIMING_REGIMES.EINSTEIN;
                  const chrono = CHRONO_MODES[room.chronoMode as ChronoMode] || CHRONO_MODES.GALILEE;

                  return (
                    <div
                      key={room.id}
                      className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex flex-col justify-between gap-3 hover:border-indigo-300 dark:hover:border-indigo-500/30 transition-all"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                            En direct
                          </span>
                          <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                            {room.durationMin} min
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                          {room.title}
                        </h3>

                        {/* Badges Régime et Mode Chrono */}
                        <div className="flex items-center gap-2 mt-2">
                          <span
                            style={{
                              background: regime.bgLight,
                              borderColor: regime.borderLight,
                              color: regime.color,
                            }}
                            className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border"
                          >
                            {room.timingRegime === "TESLA" && <Zap className="w-3 h-3" />}
                            {room.timingRegime === "NEWTON" && <Layers className="w-3 h-3" />}
                            {room.timingRegime === "EINSTEIN" && <InfinityIcon className="w-3 h-3" />}
                            {regime.badge}
                          </span>

                          <span
                            style={{
                              background: chrono.bgLight,
                              borderColor: chrono.borderLight,
                              color: chrono.color,
                            }}
                            className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border"
                          >
                            {room.chronoMode === "GALILEE" && <Eye className="w-3 h-3" />}
                            {room.chronoMode === "HEISENBERG" && <Eye className="w-3 h-3" />}
                            {room.chronoMode === "SCHRODINGER" && <EyeOff className="w-3 h-3" />}
                            {chrono.badge}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-200/60 dark:border-slate-700/40 text-xs">
                        <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-indigo-500" />
                          <strong>{room._count.attempts}</strong> candidats
                        </span>

                        <Link
                          href={`/admin/salles/${room.id}`}
                          className="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 inline-flex items-center gap-1"
                        >
                          Superviser
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Salles Programmées */}
          {scheduledRooms.length > 0 && (
            <div className="bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Prochaines Salles Programmées ({scheduledRooms.length})
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Départ automatique synchronisé
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {scheduledRooms.map((room) => (
                  <div
                    key={room.id}
                    className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-slate-900 dark:text-white text-sm">
                        {room.title}
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 flex items-center gap-3">
                        <span>
                          Début :{" "}
                          <strong>
                            {room.startsAt
                              ? room.startsAt.toLocaleDateString("fr-FR") +
                                " à " +
                                room.startsAt.toLocaleTimeString("fr-FR", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "Non défini"}
                          </strong>
                        </span>
                        <span>•</span>
                        <span>Durée : {room.durationMin} min</span>
                      </div>
                    </div>

                    <Link
                      href={`/admin/salles/${room.id}`}
                      className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold border border-slate-200 dark:border-slate-600 hover:bg-slate-100"
                    >
                      Détails
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* COLONNE DROITE (1/3) : RÉPARTITION MATIÈRES & ACCÈS RAPIDES */}
        <div className="space-y-6">
          {/* Répartition de la Banque de Questions */}
          <div className="bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-500" />
                Banque par Matière
              </h3>
              <Link
                href="/admin/contenus"
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Gérer
              </Link>
            </div>

            <div className="space-y-4">
              {subjectsData.map((item) => (
                <div key={item.subject} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700 dark:text-slate-300">{item.label}</span>
                    <span className="font-mono text-slate-500">
                      {item.count} questions ({item.pct}%)
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${item.pct}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
              <span>Textes de compréhension</span>
              <strong className="text-slate-800 dark:text-slate-200 font-mono text-sm">
                {passagesCount}
              </strong>
            </div>
          </div>

          {/* Raccourcis et Actions Prioritaires */}
          <div className="bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-base mb-4">
              Modules d'Administration
            </h3>

            <Link
              href="/admin/salles"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 border border-slate-100 dark:border-slate-800 group transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white">
                    Gestion des Salles
                  </div>
                  <div className="text-[11px] text-slate-500">Création, statuts et codes</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              href="/admin/contenus"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 border border-slate-100 dark:border-slate-800 group transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white">
                    Questions &amp; Passages
                  </div>
                  <div className="text-[11px] text-slate-500">Éditeur et import JSON</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              href="/admin/candidats"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 border border-slate-100 dark:border-slate-800 group transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white">
                    Registre des Candidats
                  </div>
                  <div className="text-[11px] text-slate-500">Comptes et performances</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* ─── SECTION 3 : DERNIÈRES COPIES RENDUES (FLUX DE RÉSULTATS) ─── */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Dernières Soumissions &amp; Évaluations
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Flux continu des copies corrigées automatiquement
            </p>
          </div>
        </div>

        {recentAttempts.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs font-medium">
            Aucune tentative enregistrée pour le moment.
          </div>
        ) : (
          <>
            {/* ─── VUE MOBILE (Cartes tactiles riches < 640px) ─── */}
            <div className="grid grid-cols-1 gap-3 sm:hidden">
              {recentAttempts.map((att) => {
                const pct = att.percentage ?? 0;
                const isAdmissible = pct >= 50;
                const isLaureat = pct >= 80;

                return (
                  <div
                    key={att.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-sm text-slate-900 dark:text-white">
                          {att.user.fullname}
                        </div>
                        <div className="text-xs text-slate-400 font-mono">Code: {att.user.code}</div>
                      </div>

                      {isLaureat ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300 border border-purple-200 dark:border-purple-500/20">
                          🌟 Lauréat
                        </span>
                      ) : isAdmissible ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20">
                          ✓ Admissible
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          Non retenu
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1">
                      <span className="text-slate-400">Salle :</span> {att.room.title}
                    </div>

                    <div className="flex items-center justify-between pt-2.5 border-t border-slate-200/60 dark:border-slate-700/40 text-xs">
                      <div className="flex items-center gap-3 font-mono">
                        <span className="font-extrabold text-slate-900 dark:text-white">
                          {att.score ?? 0} pts ({pct}%)
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500">
                          {Math.floor((att.timeUsedSec || 0) / 60)}m {((att.timeUsedSec || 0) % 60)}s
                        </span>
                      </div>

                      <Link
                        href={`/exam/${att.room.id}/correction/${att.id}`}
                        className="px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-xs hover:bg-indigo-100"
                      >
                        Revue
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ─── VUE DESKTOP / TABLETTE (Tableau complet >= 640px) ─── */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="pb-3 pl-2">Candidat</th>
                    <th className="pb-3">Salle / Concours</th>
                    <th className="pb-3">Score &amp; %</th>
                    <th className="pb-3">Temps Utilisé</th>
                    <th className="pb-3">Mention</th>
                    <th className="pb-3 pr-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {recentAttempts.map((att) => {
                    const pct = att.percentage ?? 0;
                    const isAdmissible = pct >= 50;
                    const isLaureat = pct >= 80;

                    return (
                      <tr key={att.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 pl-2">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {att.user.fullname}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">Code: {att.user.code}</div>
                        </td>

                        <td className="py-3.5">
                          <div className="font-medium text-slate-800 dark:text-slate-200 line-clamp-1">
                            {att.room.title}
                          </div>
                          <div className="text-[10px] font-bold text-indigo-500 mt-0.5">
                            {att.room.timingRegime}
                          </div>
                        </td>

                        <td className="py-3.5 font-mono">
                          <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                            {att.score ?? 0} pts
                          </div>
                          <div className="text-[11px] text-slate-500">{pct}% de réussite</div>
                        </td>

                        <td className="py-3.5 font-mono text-slate-600 dark:text-slate-300">
                          {Math.floor((att.timeUsedSec || 0) / 60)} min {((att.timeUsedSec || 0) % 60)}s
                        </td>

                        <td className="py-3.5">
                          {isLaureat ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300 border border-purple-200 dark:border-purple-500/20">
                              🌟 Lauréat
                            </span>
                          ) : isAdmissible ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20">
                              ✓ Admissible
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                              Non retenu
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 pr-2 text-right">
                          <Link
                            href={`/exam/${att.room.id}/correction/${att.id}`}
                            className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                          >
                            Revue
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
