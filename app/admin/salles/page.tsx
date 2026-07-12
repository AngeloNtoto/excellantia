import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ROOM_STATUS_LABELS } from "@/lib/types";
import Link from "next/link";
import { checkRoomStatuses } from "@/lib/actions/rooms";

export const metadata = { title: "Gestion des salles" };

export default async function AdminRoomsPage() {
  await getSession(); // Guarded by layout
  await checkRoomStatuses();

  const rooms = await prisma.room.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { attempts: true } },
      createdBy: { select: { fullname: true } }
    }
  });

  return (
    <main className="page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 4 }}>Salles d'examen</h1>
          <p style={{ color: "var(--text-secondary)" }}>Créez de nouvelles épreuves et gérez les sessions existantes.</p>
        </div>
        <Link href="/admin/salles/create" className="btn btn-primary">
          + Créer une salle
        </Link>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        {rooms.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Aucune salle créée pour le moment.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Titre</th>
                  <th>Statut</th>
                  <th>Visibilité</th>
                  <th>Durée</th>
                  <th>Début</th>
                  <th>Participations</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map(room => (
                  <tr key={room.id}>
                    <td style={{ fontWeight: 500 }}>{room.title}</td>
                    <td>
                      <span className={`badge ${room.status === "RUNNING" ? "badge-success" : room.status === "SCHEDULED" ? "badge-accent" : "badge-muted"}`}>
                        {ROOM_STATUS_LABELS[room.status as keyof typeof ROOM_STATUS_LABELS]}
                      </span>
                    </td>
                    <td>
                      {room.visibility === "PRIVATE" ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--warning)", fontSize: "0.875rem", fontWeight: 500 }}>
                          🔒 Privée <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>({room.accessCode})</span>
                        </span>
                      ) : (
                        <span style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>🌍 Publique</span>
                      )}
                    </td>
                    <td>{room.durationMin} min ({room.timeMode === "ABSOLUTE" ? "Abs" : "Rel"})</td>
                    <td style={{ color: "var(--text-secondary)" }}>
                      {room.startsAt ? room.startsAt.toLocaleDateString() + " " + room.startsAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                    </td>
                    <td>{room._count.attempts}</td>
                    <td>
                      <div style={{ display: "flex", gap: 8 }}>
                        <Link href={`/admin/salles/${room.id}`} className="btn btn-ghost" style={{ padding: "4px 8px", fontSize: "0.75rem" }}>Gérer</Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
