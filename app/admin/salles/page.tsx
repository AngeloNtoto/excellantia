import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ROOM_STATUS_LABELS } from "@/lib/types";
import Link from "next/link";
import { checkRoomStatuses } from "@/lib/actions/rooms";
import { RoomsTable } from "./rooms-table";
import type { RoomRow } from "./rooms-table";

export const metadata = { title: "Gestion des salles" };

export default async function AdminRoomsPage() {
  await getSession(); // Protégé par le layout admin
  await checkRoomStatuses();

  // Récupérer les salles avec les infos enrichies :
  // - créateur, total tentatives, tentatives soumises
  const rooms = await prisma.room.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: { select: { fullname: true } },
      _count: {
        select: {
          // Total des participants (toutes tentatives confondues)
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

  // Mapper en RoomRow sérialisable (pas de Date brutes dans un client component)
  const rows: RoomRow[] = rooms.map((room) => {
    // Compter les tentatives soumises (terminées)
    const submittedAttempts = room.attempts.filter((a) =>
      ["SUBMITTED", "AUTO_SUBMITTED_TIME_EXPIRED", "AUTO_SUBMITTED_DISCONNECTED"].includes(a.status)
    ).length;

    // Nombre de questions dans la salle
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
      schrodingerMode: room.schrodingerMode,
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

  return (
    <main className="page">
      {/* ── En-tête ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 4 }}>Salles d'examen</h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Créez de nouvelles épreuves et gérez les sessions existantes.
            {rooms.length > 0 && (
              <span style={{ marginLeft: 8, fontWeight: 600, color: "var(--text-primary)" }}>
                ({rooms.length} salle{rooms.length > 1 ? "s" : ""})
              </span>
            )}
          </p>
        </div>
        <Link href="/admin/salles/create" className="btn btn-primary">
          + Créer une salle
        </Link>
      </div>

      {/* ── Tableau interactif ── */}
      <div className="card" style={{ overflow: "hidden", padding: 0 }}>
        <RoomsTable rooms={rows} />
      </div>
    </main>
  );
}
