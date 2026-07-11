import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { checkScheduledRooms } from "@/lib/actions/rooms";

export const metadata = { title: "Admin Dashboard" };

export default async function AdminDashboardPage() {
  await getSession(); // Guarded by layout
  
  await checkScheduledRooms();

  const [usersCount, roomsCount, attemptsCount, activeRooms] = await Promise.all([
    prisma.user.count({ where: { role: "CANDIDATE" } }),
    prisma.room.count(),
    prisma.attempt.count({ where: { status: "SUBMITTED" } }),
    prisma.room.findMany({ 
      where: { status: "RUNNING" },
      orderBy: { startsAt: "desc" },
      include: { _count: { select: { attempts: true } } }
    })
  ]);

  return (
    <main className="page">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 4 }}>Administration</h1>
        <p style={{ color: "var(--text-secondary)" }}>Gérez les salles, les candidats et analysez les résultats.</p>
      </div>

      <div className="stats-grid" style={{ marginBottom: 40 }}>
        <div className="card" style={{ padding: 24 }}>
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: 8 }}>Candidats inscrits</p>
          <p style={{ fontSize: "2rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{usersCount}</p>
        </div>
        <div className="card" style={{ padding: 24 }}>
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: 8 }}>Salles créées</p>
          <p style={{ fontSize: "2rem", fontWeight: 700, color: "var(--accent)", margin: 0 }}>{roomsCount}</p>
        </div>
        <div className="card" style={{ padding: 24 }}>
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: 8 }}>Copies soumises</p>
          <p style={{ fontSize: "2rem", fontWeight: 700, color: "var(--success)", margin: 0 }}>{attemptsCount}</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 600 }}>Salles en cours</h2>
            <Link href="/admin/salles" className="btn btn-ghost" style={{ padding: "6px 12px" }}>Gérer</Link>
          </div>
          
          {activeRooms.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "0.9375rem" }}>Aucune salle n'est actuellement en cours.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {activeRooms.map(room => (
                <div key={room.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "var(--bg-muted)", borderRadius: "var(--radius-sm)" }}>
                  <div>
                    <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, marginBottom: 4 }}>{room.title}</h3>
                    <div style={{ display: "flex", gap: 12, fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
                      <span>{room.visibility === "PRIVATE" ? "🔒 Privée" : "🌍 Publique"}</span>
                      <span>👥 {room._count.attempts} tentatives</span>
                    </div>
                  </div>
                  <Link href={`/admin/salles/${room.id}`} className="btn btn-ghost" style={{ fontSize: "0.75rem", padding: "6px 10px" }}>Voir</Link>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: 20 }}>Actions rapides</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Link href="/admin/salles?action=create" className="btn btn-primary" style={{ width: "100%", justifyContent: "flex-start" }}>
              + Créer une salle
            </Link>
            <Link href="/admin/candidats" className="btn btn-ghost" style={{ width: "100%", justifyContent: "flex-start" }}>
              👥 Gérer les candidats
            </Link>
            <Link href="/admin/salles?filter=closed" className="btn btn-ghost" style={{ width: "100%", justifyContent: "flex-start" }}>
              📊 Voir les classements
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
