"use client";

import { motion } from "framer-motion";
import {
  Building2, Clock, Lock, Unlock, PlayCircle, ArrowRight,
  CheckCircle2, AlertCircle, ChevronRight, CalendarDays,
  Zap, Cog, Infinity as InfinityIcon, Eye, EyeOff, Box, Telescope,
  DoorOpen
} from "lucide-react";
import Link from "next/link";
import { ROOM_STATUS_LABELS } from "@/lib/types";

/* ── Types ────────────────────────────────────────────────────────────────── */
interface RoomData {
  id: string;
  title: string;
  visibility: string;
  status: string;
  timingRegime?: string;
  clockMode?: string;
  chronoMode?: string;
  durationMin: number;
  startsAt: Date | null;
  endsAt: Date | null;
}

interface RoomsClientProps {
  availableRooms: RoomData[];
  pastRooms: RoomData[];
}

/* ── Animation variants ───────────────────────────────────────────────────── */
const container: any = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const itemV: any = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } },
};

/* ── Badge Régime (Icônes Lucide pures, sans emoji ni dégradé) ───────────── */
function RegimeBadge({ regime }: { regime?: string }) {
  if (regime === "TESLA") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800">
        <Zap className="w-3 h-3" /> Tesla
      </span>
    );
  }
  if (regime === "NEWTON") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
        <Cog className="w-3 h-3" /> Newton
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
      <InfinityIcon className="w-3 h-3" /> Einstein
    </span>
  );
}

/* ── Badge Chrono (Icônes Lucide pures, sans emoji ni dégradé) ───────────── */
function ChronoBadge({ chrono }: { chrono?: string }) {
  if (chrono === "SCHRODINGER") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
        <Box className="w-3 h-3" /> Schrödinger
      </span>
    );
  }
  if (chrono === "HEISENBERG") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
        <EyeOff className="w-3 h-3" /> Heisenberg
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
      <Telescope className="w-3 h-3" /> Galilée
    </span>
  );
}

export function RoomsClient({ availableRooms, pastRooms }: RoomsClientProps) {
  const now = new Date();

  return (
    <motion.main
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8"
    >
      {/* ── EN-TÊTE PRO SANS DÉGRADÉ ────────────────────────────────────────── */}
      <motion.div variants={itemV} className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Salles d'examen
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Participez aux épreuves officielles programmées ou consultez vos archives.
          </p>
        </div>
      </motion.div>

      {/* ── SALLES DISPONIBLES ──────────────────────────────────────────────── */}
      <motion.section variants={itemV} className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Salles ouvertes
            </h2>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold">
            {availableRooms.length} disponible(s)
          </span>
        </div>

        {availableRooms.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2 shadow-sm">
            <Clock className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="font-bold text-sm text-slate-700 dark:text-slate-300">Aucune salle ouverte actuellement</p>
            <p className="text-xs text-slate-400">Les épreuves apparaissent dès que l'administrateur lance la session.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {availableRooms.map((room) => {
              const isPrivate = room.visibility === "PRIVATE";
              const calculatedEndAt = room.endsAt
                ? new Date(room.endsAt)
                : room.clockMode === "ABSOLUTE" && room.startsAt
                  ? new Date(new Date(room.startsAt).getTime() + room.durationMin * 60_000)
                  : null;
              const isExpired = !!calculatedEndAt && calculatedEndAt <= now;
              const isRunning = room.status === "RUNNING" && !isExpired;
              const isScheduled = room.status === "SCHEDULED" && !isExpired;

              let timeInfo = "";
              if (isRunning && calculatedEndAt) {
                const remaining = Math.max(0, Math.floor((calculatedEndAt.getTime() - now.getTime()) / 60000));
                timeInfo = `${remaining} min restantes`;
              } else if (isScheduled && room.startsAt) {
                timeInfo = `Débute le ${new Date(room.startsAt).toLocaleDateString("fr-FR")} à ${new Date(room.startsAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
              }

              return (
                <motion.div
                  variants={itemV}
                  key={room.id}
                  className={`bg-white dark:bg-slate-900 border rounded-2xl p-4 sm:p-5 shadow-sm transition-all ${
                    isRunning
                      ? "border-emerald-500/60 dark:border-emerald-500/40"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1 min-w-0">
                      {/* Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Statut */}
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          isRunning
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                            : isScheduled
                              ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        }`}>
                          {isRunning && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                          {isExpired ? "Terminée" : ROOM_STATUS_LABELS[room.status as keyof typeof ROOM_STATUS_LABELS] ?? room.status}
                        </span>

                        {/* Visibilité */}
                        {isPrivate ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            <Lock className="w-3 h-3" /> Privée
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                            <Unlock className="w-3 h-3" /> Publique
                          </span>
                        )}

                        {/* Régime & Chrono */}
                        <RegimeBadge regime={room.timingRegime} />
                        <ChronoBadge chrono={room.chronoMode} />
                      </div>

                      {/* Titre */}
                      <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                        {room.title}
                      </h3>

                      {/* Infos */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {room.durationMin} min
                        </span>
                        {timeInfo && (
                          <>
                            <span>•</span>
                            <span className={`font-semibold ${isRunning ? "text-emerald-600 dark:text-emerald-400" : "text-blue-600 dark:text-blue-400"}`}>
                              {timeInfo}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Action */}
                    <Link
                      href={`/rooms/${room.id}`}
                      className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all active:scale-95 shrink-0 ${
                        isRunning
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                          : isExpired
                            ? "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                            : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                      }`}
                    >
                      {isRunning ? "Entrer dans la salle" : isExpired ? "Consulter" : "Détails"}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.section>

      {/* ── HISTORIQUE ──────────────────────────────────────────────────────── */}
      {pastRooms.length > 0 && (
        <motion.section variants={itemV} className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Anciennes salles
            </h2>
            <span className="text-xs text-slate-400 font-semibold">{pastRooms.length} salle(s)</span>
          </div>

          <div className="space-y-2">
            {pastRooms.map((room) => (
              <div
                key={room.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
              >
                <div className="min-w-0">
                  <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                    {room.title}
                  </p>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">Session terminée</span>
                </div>
                <Link
                  href={`/rooms/${room.id}`}
                  className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shrink-0"
                  title="Voir les détails"
                >
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </motion.section>
      )}
    </motion.main>
  );
}
