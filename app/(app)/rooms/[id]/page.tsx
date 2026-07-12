import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ROOM_STATUS_LABELS } from "@/lib/types";
import { startAttemptAction } from "@/lib/actions/attempts";
import { buildWhatsAppMessage, buildWhatsAppUrl, buildRanking } from "@/lib/scoring";
import { AccessCodeForm } from "./access-form";

export default async function RoomDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/");

  const room = await prisma.room.findUnique({ where: { id } });
  if (!room) redirect("/rooms");

  // Si c'est une salle privée, vérifier l'accès
  let hasAccess = room.visibility === "PUBLIC" || session.role === "ADMIN";
  if (!hasAccess) {
    const access = await prisma.roomAccess.findUnique({
      where: { roomId_userId: { roomId: room.id, userId: session.id } }
    });
    hasAccess = !!access;
  }

  // Vérifier si l'utilisateur a déjà une tentative
  const existingAttempt = await prisma.attempt.findFirst({
    where: { userId: session.id, roomId: room.id },
    orderBy: { createdAt: 'desc' }
  });

  let ranking: any[] = [];
  if (room.status === "CLOSED" && hasAccess) {
    const attempts = await prisma.attempt.findMany({
      where: { roomId: room.id, status: { not: "IN_PROGRESS" } },
      include: { user: { select: { fullname: true, code: true } } },
    });
    ranking = buildRanking(attempts.map(a => ({ ...a, fullname: a.user.fullname })));
  }

  return (
    <main className="page page-sm">
      <div className="card" style={{ padding: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 8 }}>{room.title}</h1>
            <div style={{ display: "flex", gap: 8 }}>
              <span className="badge badge-muted">{ROOM_STATUS_LABELS[room.status as keyof typeof ROOM_STATUS_LABELS]}</span>
              {room.visibility === "PRIVATE" && <span className="badge badge-warning">Privée</span>}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gap: 12, marginBottom: 32, fontSize: "0.9375rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--text-secondary)" }}>Durée :</span>
            <span style={{ fontWeight: 500 }}>{room.durationMin} minutes</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--text-secondary)" }}>Mode de temps :</span>
            <span style={{ fontWeight: 500 }}>{room.timeMode === "ABSOLUTE" ? "Absolu (Même heure de fin pour tous)" : "Relatif (Individuel)"}</span>
          </div>
          {room.startsAt && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-secondary)" }}>Début :</span>
              <span style={{ fontWeight: 500 }}>
                {room.startsAt.toLocaleDateString()} à {room.startsAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}
        </div>

        {/* Accès et Actions */}
        {!hasAccess ? (
          <div style={{ background: "var(--bg-muted)", padding: 20, borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: 4 }}>Accès restreint</h3>
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>Cette salle nécessite un code d'accès.</p>
            <AccessCodeForm roomId={room.id} />
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {room.status === "RUNNING" && !existingAttempt && (
              <form action={async () => {
                "use server";
                const res = await startAttemptAction(room.id);
                if (res.ok) redirect(`/exam/${res.attemptId}`);
              }}>
                <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: 14, fontSize: "1rem" }}>
                  Commencer l'épreuve
                </button>
              </form>
            )}

            {existingAttempt && existingAttempt.status === "IN_PROGRESS" && (
              <a href={`/exam/${existingAttempt.id}`} className="btn btn-primary" style={{ width: "100%", padding: 14, fontSize: "1rem", textAlign: "center" }}>
                Reprendre l'épreuve
              </a>
            )}

            {existingAttempt && existingAttempt.status !== "IN_PROGRESS" && (
              <a href={`/exam/${room.id}/correction/${existingAttempt.id}`} className="btn btn-ghost" style={{ width: "100%", padding: 14, fontSize: "1rem", textAlign: "center" }}>
                Voir ma correction
              </a>
            )}

            {room.status === "SCHEDULED" && (
              <div style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: "0.9375rem" }}>
                La salle n'a pas encore commencé.
              </div>
            )}
            
            {room.status === "CLOSED" && !existingAttempt && ranking.length === 0 && (
              <div style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: "0.9375rem" }}>
                Salle terminée. Vous n'avez pas participé.
              </div>
            )}

            {/* CLASSEMENT & PARTAGE */}
            {room.status === "CLOSED" && ranking.length > 0 && (
              <div style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid var(--border-subtle)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h2 style={{ fontSize: "1.125rem", fontWeight: 600 }}>Classement final</h2>
                  <a 
                    href={buildWhatsAppUrl(buildWhatsAppMessage(room.title, room.createdAt.toLocaleDateString(), room.durationMin, ranking))}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-success"
                    style={{ background: "#25D366", color: "white", borderColor: "#25D366", padding: "6px 12px", fontSize: "0.875rem", display: "flex", alignItems: "center", gap: 6 }}
                  >
                    📱 Partager
                  </a>
                </div>
                
                <div style={{ overflowX: "auto", background: "var(--bg-muted)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
                  <table style={{ width: "100%", fontSize: "0.875rem", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th style={{ padding: "12px", borderBottom: "1px solid var(--border-subtle)", textAlign: "left", color: "var(--text-secondary)", fontWeight: 600 }}>Rang</th>
                        <th style={{ padding: "12px", borderBottom: "1px solid var(--border-subtle)", textAlign: "left", color: "var(--text-secondary)", fontWeight: 600 }}>Candidat</th>
                        <th style={{ padding: "12px", borderBottom: "1px solid var(--border-subtle)", textAlign: "right", color: "var(--text-secondary)", fontWeight: 600 }}>Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ranking.slice(0, 50).map((entry) => (
                        <tr key={entry.userId} style={{ borderBottom: "1px solid var(--border-subtle)", background: entry.userId === session.id ? "var(--accent-light)" : "transparent" }}>
                          <td style={{ padding: "12px", fontWeight: entry.rank <= 3 ? 700 : 500, color: entry.rank === 1 ? "#f59e0b" : entry.rank === 2 ? "#9ca3af" : entry.rank === 3 ? "#b45309" : "inherit" }}>
                            #{entry.rank}
                          </td>
                          <td style={{ padding: "12px", fontWeight: entry.userId === session.id ? 700 : 500 }}>
                            {entry.fullname} {entry.userId === session.id && <span style={{ color: "var(--accent)", fontSize: "0.75rem", marginLeft: 4 }}>(Vous)</span>}
                          </td>
                          <td style={{ padding: "12px", textAlign: "right", fontWeight: 700, color: entry.percentage >= 50 ? "var(--success)" : "var(--error)" }}>
                            {entry.percentage}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {ranking.length === 0 && (
                    <div style={{ padding: 20, textAlign: "center", color: "var(--text-muted)" }}>Aucun participant.</div>
                  )}
                  {ranking.length > 50 && (
                    <div style={{ padding: "12px", textAlign: "center", color: "var(--text-secondary)", fontSize: "0.8125rem", borderTop: "1px solid var(--border-subtle)" }}>
                      Seuls les 50 premiers sont affichés.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
