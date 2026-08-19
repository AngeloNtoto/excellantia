import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ROOM_STATUS_LABELS } from "@/lib/types";
import Link from "next/link";
import { checkRoomStatuses } from "@/lib/actions/rooms";
import { RoomsTable } from "./rooms-table";
import type { RoomRow } from "./rooms-table";
import { Building2, PlusCircle, Sparkles, Layers, Zap, Clock } from "lucide-react";

export const metadata = { title: "Gestion des Salles d'Évaluation | PreExcellantia" };

export default async function AdminRoomsPage() {
  await getSession(); // Protégé par le layout admin
  await checkRoomStatuses();

  // Récupérer les salles avec les infos enrichies
  const rooms = await prisma.room.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: { select: { fullname: true } },
      _count: {
        select: {
          attempts: true,
        },
      },
      attempts: {
        select: {
          status: true,
        },
      },
    },
  });

  // Mapper en RoomRow sérialisable
  const rows: RoomRow[] = rooms.map((room) => {
    const submittedAttempts = room.attempts.filter((a) =>
      ["SUBMITTED", "AUTO_SUBMITTED_TIME_EXPIRED", "AUTO_SUBMITTED_DISCONNECTED"].includes(a.status)
    ).length;

    const totalQuestions = Array.isArray(room.questionIds)
      ? room.questionIds.length
      : typeof room.questionIds === "string"
        ? (() => { try { return JSON.parse(room.questionIds as string).length; } catch { return 0; } })()
        : 0;

    return {
      id: room.id,
      title: room.title,
      status: room.status,
      statusLabel: ROOM_STATUS_LABELS[room.status as keyof typeof ROOM_STATUS_LABELS] ?? room.status,
      visibility: room.visibility as "PUBLIC" | "PRIVATE",
      accessCode: room.accessCode,
      durationMin: room.durationMin,
      timingRegime: room.timingRegime,
      clockMode: room.clockMode,
      chronoMode: room.chronoMode,
      startsAt: room.startsAt
        ? room.startsAt.toLocaleDateString("fr-FR") + " " +
          room.startsAt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
        : null,
      creatorName: room.createdBy?.fullname ?? "Inconnu",
      totalQuestions,
      submittedAttempts,
      totalAttempts: room._count.attempts,
    };
  });

  const runningCount = rooms.filter((r) => r.status === "RUNNING").length;
  const scheduledCount = rooms.filter((r) => r.status === "SCHEDULED").length;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* ─── EN-TÊTE PROFESSIONNEL ÉPURÉ ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Building2 className="w-3.5 h-3.5" />
              {rooms.length} Salle{rooms.length > 1 ? "s" : ""}
            </span>
            {runningCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                {runningCount} en direct
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Salles d'Évaluation
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl">
            Pilotez les sessions d'évaluation, programmez les dates de lancement et configurez les régimes temporels.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/admin/salles/create"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white transition-all shadow-md shadow-indigo-600/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Créer une salle</span>
          </Link>
        </div>
      </div>

      {/* ─── TABLEAU & VUES MOBILES ─── */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm">
        <RoomsTable rooms={rows} />
      </div>
    </main>
  );
}
