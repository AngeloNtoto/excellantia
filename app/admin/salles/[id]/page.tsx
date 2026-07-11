import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ROOM_STATUS_LABELS } from "@/lib/types";
import { startRoomNowAction, closeRoomAction, cancelRoomAction } from "@/lib/actions/rooms";
import { buildWhatsAppMessage, buildRanking } from "@/lib/scoring";
import { redirect } from "next/navigation";

export default async function AdminRoomDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await getSession(); // Guarded by layout

  const room = await prisma.room.findUnique({
    where: { id },
    include: {
      createdBy: { select: { fullname: true } },
      attempts: {
        where: { status: { not: "IN_PROGRESS" } },
        include: { user: { select: { fullname: true, code: true } } },
        orderBy: [
          { percentage: "desc" },
          { timeUsedSec: "asc" },
          { user: { fullname: "asc" } }
        ]
      }
    }
  });

  if (!room) redirect("/admin/salles");

  const config = typeof room.config === 'string' ? JSON.parse(room.config) : room.config;
  const isRunning = room.status === "RUNNING";
  const isWaiting = room.status === "WAITING" || room.status === "SCHEDULED";
  const isClosed = room.status === "CLOSED";

  return (
    <main className="page">
      <div className="page-header page-header-start">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>{room.title}</h1>
            <span className={`badge ${isRunning ? "badge-success" : isWaiting ? "badge-accent" : "badge-muted"}`}>
              {ROOM_STATUS_LABELS[room.status as keyof typeof ROOM_STATUS_LABELS]}
            </span>
            {room.visibility === "PRIVATE" && <span className="badge badge-warning">Privée</span>}
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem" }}>Créé par {room.createdBy.fullname} le {room.createdAt.toLocaleDateString()}</p>
        </div>

        <div className="actions-row">
          {isWaiting && (
            <form action={async () => { "use server"; await startRoomNowAction(room.id); }}>
              <button type="submit" className="btn btn-primary">Démarrer maintenant</button>
            </form>
          )}
          {isRunning && (
            <form action={async () => { "use server"; await closeRoomAction(room.id); }}>
              <button type="submit" className="btn btn-danger">Fermer la salle</button>
            </form>
          )}
          {isWaiting && (
            <form action={async () => { "use server"; await cancelRoomAction(room.id); }}>
              <button type="submit" className="btn btn-ghost">Annuler</button>
            </form>
          )}
          {isClosed && room.attempts.length > 0 && (
            <a 
              href={`https://wa.me/?text=${encodeURIComponent(buildWhatsAppMessage(room.title, room.createdAt.toLocaleDateString(), room.durationMin, buildRanking(room.attempts.map((attempt: any) => ({ ...attempt, fullname: attempt.user.fullname, scoreBySubject: typeof attempt.scoreBySubject === 'string' ? attempt.scoreBySubject : JSON.stringify(attempt.scoreBySubject) })))))}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-success"
              style={{ background: "#25D366", color: "white", borderColor: "#25D366" }}
            >
              📱 Partager sur WhatsApp
            </a>
          )}
        </div>
      </div>

      <div className="admin-room-grid">
        {/* Informations & Configuration */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div className="card" style={{ padding: 24 }}>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: 16 }}>Détails</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: "0.9375rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Durée :</span>
                <span style={{ fontWeight: 500 }}>{room.durationMin} minutes</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Mode :</span>
                <span style={{ fontWeight: 500 }}>{room.timeMode === "ABSOLUTE" ? "Absolu" : "Relatif"}</span>
              </div>
              {room.accessCode && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "var(--warning-light)", borderRadius: "var(--radius-sm)", marginTop: 8 }}>
                  <span style={{ color: "var(--warning)", fontWeight: 500 }}>Code d&apos;accès :</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--warning)", letterSpacing: "0.1em" }}>{room.accessCode}</span>
                </div>
              )}
            </div>
          </div>

          <div className="card" style={{ padding: 24 }}>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: 16 }}>Configuration (JSON)</h2>
            <pre style={{ background: "var(--bg-muted)", padding: 16, borderRadius: "var(--radius-sm)", fontSize: "0.75rem", overflowX: "auto", margin: 0 }}>
              {JSON.stringify(config, null, 2)}
            </pre>
          </div>
        </div>

        {/* Classement */}
        <div className="card" style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-subtle)" }}>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 600, margin: 0 }}>Classement ({room.attempts.length} soumissions)</h2>
          </div>
          
          {room.attempts.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Aucun résultat pour le moment.</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Rang</th>
                    <th>Candidat</th>
                    <th>Score</th>
                    <th>%</th>
                    <th>Temps</th>
                  </tr>
                </thead>
                <tbody>
                  {room.attempts.map((attempt, index) => (
                    <tr key={attempt.id} style={index < 3 ? { background: index === 0 ? "rgba(251, 191, 36, 0.1)" : index === 1 ? "rgba(156, 163, 175, 0.1)" : "rgba(180, 83, 9, 0.1)" } : {}}>
                      <td style={{ fontWeight: 700, fontSize: "1rem", color: index === 0 ? "#f59e0b" : index === 1 ? "#9ca3af" : index === 2 ? "#b45309" : "var(--text-secondary)" }}>
                        #{index + 1}
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{attempt.user.fullname}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{attempt.user.code}</div>
                      </td>
                      <td>{attempt.score}</td>
                      <td style={{ fontWeight: 600, color: (attempt.percentage ?? 0) >= 50 ? "var(--success)" : "var(--error)" }}>
                        {attempt.percentage}%
                      </td>
                      <td style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                        {attempt.timeUsedSec ? `${Math.floor(attempt.timeUsedSec / 60)}m ${attempt.timeUsedSec % 60}s` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
