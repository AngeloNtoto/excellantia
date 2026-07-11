import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ROOM_STATUS_LABELS } from "@/lib/types";
import { startAttemptAction } from "@/lib/actions/attempts";
import { AccessCodeForm } from "./access-form";

export default async function RoomDetailsPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) redirect("/");

  const room = await prisma.room.findUnique({ where: { id: params.id } });
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
            
             {room.status === "CLOSED" && !existingAttempt && (
              <div style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: "0.9375rem" }}>
                Salle terminée. Vous n'avez pas participé.
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
