import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { SUBJECT_LABELS } from "@/lib/types";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mon tableau de bord" };

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/");
  if (session.role === "ADMIN") redirect("/admin");

  // Historique des tentatives
  const attempts = await prisma.attempt.findMany({
    where: { userId: session.id, status: { not: "IN_PROGRESS" } },
    include: { room: { select: { title: true, durationMin: true } } },
    orderBy: { submittedAt: "desc" },
    take: 10,
  });

  // Stats globales
  const submitted = attempts.filter((a) => a.score !== null);
  const avgPct = submitted.length
    ? Math.round(submitted.reduce((s, a) => s + (a.percentage ?? 0), 0) / submitted.length)
    : null;
  const bestPct = submitted.length ? Math.max(...submitted.map((a) => a.percentage ?? 0)) : null;

  // Moyennes par rubrique
  const subjectTotals: Record<string, { sum: number; count: number }> = {
    MATH: { sum: 0, count: 0 },
    FRENCH: { sum: 0, count: 0 },
    ENGLISH: { sum: 0, count: 0 },
    GENERAL_CULTURE: { sum: 0, count: 0 },
  };

  for (const attempt of submitted) {
    if (attempt.scoreBySubject) {
      const s = attempt.scoreBySubject as Record<string, number>;
      for (const key of Object.keys(subjectTotals)) {
        if (s[key] !== undefined) {
          subjectTotals[key].sum += s[key];
          subjectTotals[key].count++;
        }
      }
    }
  }

  // Salles disponibles
  const rooms = await prisma.room.findMany({
    where: { status: "RUNNING", visibility: "PUBLIC" },
    orderBy: { startsAt: "asc" },
    take: 3,
  });

  return (
    <main className="page">
      {/* En-tête */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
          Bonjour, {session.fullname.split(" ")[0]} 👋
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>Votre espace de préparation Excellantia.</p>
      </div>

      {/* Stats globales */}
      <div className="stats-grid" style={{ marginBottom: 32 }}>
        {[
          { label: "Tentatives", value: submitted.length.toString(), color: "var(--accent)" },
          { label: "Moyenne générale", value: avgPct !== null ? `${avgPct}%` : "—", color: "var(--success)" },
          { label: "Meilleur score", value: bestPct !== null ? `${bestPct}%` : "—", color: "var(--warning)" },
        ].map((stat) => (
          <div key={stat.label} className="card" style={{ padding: "20px 24px" }}>
            <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginBottom: 8 }}>{stat.label}</p>
            <p style={{ fontSize: "1.75rem", fontWeight: 700, color: stat.color, margin: 0 }}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Moyennes par rubrique */}
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: 20 }}>Moyennes par rubrique</h2>
          {Object.entries(subjectTotals).map(([key, { sum, count }]) => {
            const avg = count > 0 ? Math.round((sum / count / 25) * 100) : 0;
            const colorMap: Record<string, string> = {
              MATH: "var(--math)", FRENCH: "var(--french)", ENGLISH: "var(--english)", GENERAL_CULTURE: "var(--culture)"
            };
            return (
              <div key={key} style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                    {SUBJECT_LABELS[key as keyof typeof SUBJECT_LABELS]}
                  </span>
                  <span style={{ fontSize: "0.875rem", fontWeight: 600, color: colorMap[key] }}>
                    {count > 0 ? `${avg}%` : "—"}
                  </span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${avg}%`, background: colorMap[key] }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Salles disponibles */}
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: 20 }}>Salles en cours</h2>
          {rooms.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>Aucune salle en cours.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {rooms.map((room) => (
                <a
                  key={room.id}
                  href={`/rooms/${room.id}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 16px",
                    background: "var(--bg-muted)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-subtle)",
                    transition: "all 0.15s",
                  }}
                >
                  <div>
                    <p style={{ fontWeight: 500, fontSize: "0.9375rem", marginBottom: 2 }}>{room.title}</p>
                    <span className="badge badge-success" style={{ fontSize: "0.7rem" }}>En cours</span>
                  </div>
                  <span style={{ color: "var(--accent)", fontWeight: 600, fontSize: "0.875rem" }}>Entrer →</span>
                </a>
              ))}
            </div>
          )}
          <a
            href="/rooms"
            style={{
              display: "block",
              marginTop: 16,
              textAlign: "center",
              fontSize: "0.875rem",
              color: "var(--accent)",
              fontWeight: 500,
            }}
          >
            Voir toutes les salles →
          </a>
        </div>
      </div>

      {/* Historique */}
      {attempts.length > 0 && (
        <div className="card" style={{ marginTop: 24, overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-subtle)" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 600 }}>Historique récent</h2>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Épreuve</th>
                <th>Score</th>
                <th>%</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {attempts.map((a) => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 500 }}>{a.room.title}</td>
                  <td style={{ fontFamily: "var(--font-mono)" }}>{a.score ?? "—"}/100</td>
                  <td style={{ fontWeight: 600, color: (a.percentage ?? 0) >= 50 ? "var(--success)" : "var(--error)" }}>
                    {a.percentage !== null ? `${Math.round(a.percentage)}%` : "—"}
                  </td>
                  <td>
                    <span className={`badge ${a.status === "SUBMITTED" ? "badge-success" : "badge-warning"}`}>
                      {a.status === "SUBMITTED" ? "Soumis" : "Auto-soumis"}
                    </span>
                  </td>
                  <td>
                    <a href={`/exam/${a.roomId}/correction/${a.id}`} style={{ color: "var(--accent)", fontSize: "0.875rem" }}>
                      Correction →
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
