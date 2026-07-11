import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ROOM_STATUS_LABELS } from "@/lib/types";
import Link from "next/link";
import { checkScheduledRooms } from "@/lib/actions/rooms";

export const metadata = { title: "Salles disponibles" };

export default async function RoomsPage() {
  const session = await getSession();
  if (!session) redirect("/");

  // Vérifier si des salles programmées doivent démarrer
  await checkScheduledRooms();

  const now = new Date();

  const rooms = await prisma.room.findMany({
    orderBy: { createdAt: "desc" },
  });

  const availableRooms = rooms.filter(
    (r) => r.status === "RUNNING" || r.status === "SCHEDULED" || r.status === "WAITING"
  );
  
  const pastRooms = rooms.filter((r) => r.status === "CLOSED");

  return (
    <main className="page">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 4 }}>Salles d'examen</h1>
        <p style={{ color: "var(--text-secondary)" }}>Rejoignez une session en cours ou à venir.</p>
      </div>

      <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: 16 }}>Salles disponibles</h2>
      
      {availableRooms.length === 0 ? (
        <div className="card" style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>
          Aucune salle disponible pour le moment.
        </div>
      ) : (
        <div style={{ display: "grid", gap: 16, marginBottom: 40 }}>
          {availableRooms.map((room) => {
            const isPrivate = room.visibility === "PRIVATE";
            const isRunning = room.status === "RUNNING";
            const isScheduled = room.status === "SCHEDULED";
            
            let timeInfo = "";
            if (isRunning && room.endsAt) {
              const remaining = Math.max(0, Math.floor((room.endsAt.getTime() - now.getTime()) / 60000));
              timeInfo = `Reste : ${remaining} min`;
            } else if (isScheduled && room.startsAt) {
              timeInfo = `Débute le ${room.startsAt.toLocaleDateString()} à ${room.startsAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            }

            return (
              <div key={room.id} className="card room-card-row">
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                    <h3 style={{ fontSize: "1.125rem", fontWeight: 600 }}>{room.title}</h3>
                    {isPrivate && <span className="badge badge-warning">Privée</span>}
                    <span className={`badge ${isRunning ? "badge-success" : isScheduled ? "badge-accent" : "badge-muted"}`}>
                      {ROOM_STATUS_LABELS[room.status as keyof typeof ROOM_STATUS_LABELS]}
                    </span>
                  </div>
                  <div className="room-card-meta">
                    <span>⏱ {room.durationMin} min</span>
                    {timeInfo && <span>⏳ {timeInfo}</span>}
                  </div>
                </div>
                
                <Link href={`/rooms/${room.id}`} className="btn btn-primary">
                  {isRunning ? "Entrer" : "Détails"}
                </Link>
              </div>
            );
          })}
        </div>
      )}

      <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: 16 }}>Anciennes salles</h2>
      {pastRooms.length === 0 ? (
        <div className="card" style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>
          Aucun historique de salle.
        </div>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {pastRooms.map((room) => (
            <div key={room.id} className="card room-card-row">
              <div>
                <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: 4 }}>{room.title}</h3>
                <span className="badge badge-muted">Terminée</span>
              </div>
              <Link href={`/rooms/${room.id}`} className="btn btn-ghost">
                Consulter
              </Link>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
