import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ROOM_STATUS_LABELS } from "@/lib/types";
import { startAttemptAction } from "@/lib/actions/attempts";
import { buildWhatsAppMessage, buildWhatsAppUrl, buildRanking } from "@/lib/scoring";
import { Trophy } from "lucide-react";
import { AccessCodeForm } from "./access-form";

export default async function RoomDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/");

  const room = await prisma.room.findUnique({ where: { id } });
  if (!room) redirect("/rooms");

  // Vérifier si l'utilisateur a déjà une tentative
  const existingAttempt = await prisma.attempt.findFirst({
    where: { userId: session.id, roomId: room.id },
    orderBy: { createdAt: 'desc' }
  });

  // Si c'est une salle privée, vérifier l'accès
  let hasAccess = room.visibility === "PUBLIC" || session.role === "ADMIN" || room.createdById === session.id;
  if (!hasAccess) {
    const access = await prisma.roomAccess.findUnique({
      where: { roomId_userId: { roomId: room.id, userId: session.id } }
    });
    hasAccess = !!access || !!existingAttempt;
  }

  let ranking: any[] = [];
  const totalQuestions = Array.isArray(room.questionIds)
    ? room.questionIds.length
    : typeof room.questionIds === "string"
      ? (() => {
          try { return JSON.parse(room.questionIds).length; } catch { return 0; }
        })()
      : 0;

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
              <div style={{ marginTop: 32 }}>
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center", 
                  marginBottom: 20,
                  paddingBottom: 16,
                  borderBottom: "2px solid var(--border-subtle)"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ 
                      width: 40, height: 40, borderRadius: 12, 
                      background: "var(--accent-light)", 
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "var(--accent)", border: "1px solid rgba(59, 130, 246, 0.2)"
                    }}>
                      <Trophy size={20} strokeWidth={2.5} />
                    </div>
                    <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>Classement final</h2>
                  </div>
                </div>
                
                <div style={{ background: "var(--bg-card)", borderRadius: "16px", border: "1px solid var(--border-subtle)", boxShadow: "0 4px 20px rgba(0,0,0,0.04)", overflow: "hidden" }}>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", fontSize: "0.9375rem", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ background: "var(--bg-muted)" }}>
                          <th style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", textAlign: "center", color: "var(--text-secondary)", fontWeight: 700, textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.05em", width: "80px" }}>Rang</th>
                          <th style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", textAlign: "left", color: "var(--text-secondary)", fontWeight: 700, textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.05em" }}>Candidat</th>
                          <th style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", textAlign: "right", color: "var(--text-secondary)", fontWeight: 700, textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.05em" }}>Performance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ranking.slice(0, 50).map((entry) => {
                          const isTop3 = entry.rank <= 3;
                          const rankColor = entry.rank === 1 ? "#f59e0b" : entry.rank === 2 ? "#9ca3af" : entry.rank === 3 ? "#b45309" : "var(--text-secondary)";
                          const rankBg = entry.rank === 1 ? "rgba(245, 158, 11, 0.15)" : entry.rank === 2 ? "rgba(156, 163, 175, 0.15)" : entry.rank === 3 ? "rgba(180, 83, 9, 0.15)" : "var(--bg-muted)";
                          
                          return (
                            <tr key={entry.userId} style={{ 
                              borderBottom: "1px solid var(--border-subtle)", 
                              background: entry.userId === session.id ? "var(--accent-light)" : "transparent",
                              transition: "background 0.2s"
                            }}>
                              <td style={{ padding: "16px 20px", textAlign: "center" }}>
                                <div style={{ 
                                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                                  width: 32, height: 32, borderRadius: "50%",
                                  background: rankBg, color: rankColor,
                                  fontWeight: 800, fontSize: "0.875rem"
                                }}>
                                  {entry.rank}
                                </div>
                              </td>
                              <td style={{ padding: "16px 20px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                  <div style={{ fontWeight: isTop3 || entry.userId === session.id ? 700 : 500, color: "var(--text-primary)", fontSize: "1rem" }}>
                                    {entry.fullname}
                                  </div>
                                  {entry.userId === session.id && (
                                    <span style={{ 
                                      background: "var(--accent)", color: "white", padding: "2px 8px", 
                                      borderRadius: 100, fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em"
                                    }}>Vous</span>
                                  )}
                                </div>
                              </td>
                              <td style={{ padding: "16px 20px", textAlign: "right" }}>
                                <div style={{ 
                                  display: "inline-flex", alignItems: "center", gap: 6,
                                  fontWeight: 800, fontSize: "1.125rem",
                                  color: entry.percentage >= 50 ? "var(--success)" : "var(--error)" 
                                }}>
                                  {entry.percentage}%
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {ranking.length === 0 && (
                    <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", fontSize: "0.9375rem" }}>Aucun participant n'a terminé l'épreuve.</div>
                  )}
                  {ranking.length > 50 && (
                    <div style={{ padding: "16px", textAlign: "center", color: "var(--text-secondary)", fontSize: "0.8125rem", background: "var(--bg-muted)", fontWeight: 500 }}>
                      Seuls les 50 premiers candidats sont affichés.
                    </div>
                  )}
                </div>
                
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
                  <a
                    href={buildWhatsAppUrl(buildWhatsAppMessage(room.title, room.createdAt.toLocaleDateString(), room.durationMin, ranking, totalQuestions))}
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      background: "linear-gradient(135deg, #25D366, #1da851)", 
                      color: "white", 
                      padding: "12px 24px", 
                      borderRadius: "100px",
                      fontSize: "1rem", 
                      fontWeight: 700,
                      display: "flex", 
                      alignItems: "center", 
                      gap: 10,
                      textDecoration: "none",
                      boxShadow: "0 8px 16px rgba(37, 211, 102, 0.2)"
                    }}
                  >
                    <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                    Partager sur WhatsApp
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
