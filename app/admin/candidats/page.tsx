import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AddCandidateForm } from "./add-form";
import { ImportCandidatesForm } from "./import-form";

export const metadata = { title: "Gestion des candidats" };

export default async function AdminCandidatesPage({ searchParams }: { searchParams: { q?: string } }) {
  await getSession(); // Guarded by layout

  const query = searchParams.q ?? "";
  
  const candidates = await prisma.user.findMany({
    where: {
      role: "CANDIDATE",
      ...(query ? { fullname: { contains: query } } : {})
    },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { attempts: true } } }
  });

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 4 }}>Candidats</h1>
          <p style={{ color: "var(--text-secondary)" }}>Gérez les comptes des participants à l'examen.</p>
        </div>
      </div>

      <div className="admin-candidates-grid">
        <div className="card" style={{ overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 600, margin: 0 }}>Liste des candidats ({candidates.length})</h2>
            <form action="/admin/candidats" method="GET" style={{ display: "flex", gap: 8 }}>
              <input 
                type="text" 
                name="q" 
                defaultValue={query} 
                placeholder="Rechercher un nom..." 
                className="input" 
                style={{ padding: "6px 12px", fontSize: "0.875rem", width: 200 }} 
              />
              <button type="submit" className="btn btn-ghost" style={{ padding: "6px 12px" }}>Chercher</button>
            </form>
          </div>
          
          {candidates.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Aucun candidat trouvé.</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Nom complet</th>
                    <th>Code d'accès</th>
                    <th>Tentatives</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map(c => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 500 }}>{c.fullname}</td>
                      <td style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem", color: "var(--text-secondary)", letterSpacing: "0.05em" }}>{c.code}</td>
                      <td>{c._count.attempts}</td>
                      <td>
                        <span className={`badge ${c.isActive ? "badge-success" : "badge-error"}`}>
                          {c.isActive ? "Actif" : "Désactivé"}
                        </span>
                      </td>
                      <td>
                        <form action={async () => {
                          "use server";
                          const { toggleCandidateAction } = await import("@/lib/actions/candidates");
                          await toggleCandidateAction(c.id);
                        }}>
                          <button type="submit" className="btn btn-ghost" style={{ padding: "4px 8px", fontSize: "0.75rem" }}>
                            {c.isActive ? "Désactiver" : "Activer"}
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: 16 }}>Ajouter manuellement</h3>
            <AddCandidateForm />
          </div>
          
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: 8 }}>Import JSON</h3>
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: 16 }}>Importez une liste de candidats depuis un fichier JSON structuré.</p>
            
            <div style={{ background: "var(--bg-muted)", padding: 12, borderRadius: "var(--radius-sm)", marginBottom: 16, fontSize: "0.75rem", fontFamily: "var(--font-mono)" }}>
              <span style={{ color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Exemple de format attendu :</span>
              <pre style={{ margin: 0, color: "var(--text-primary)" }}>
{`[
  {
    "fullname": "KABONGO Jean",
    "code": "25072006123456"
  },
  {
    "fullname": "MUKENDI Grace",
    "code": "25072006987654"
  }
]`}
              </pre>
            </div>

            <ImportCandidatesForm />
          </div>
        </div>
      </div>
    </main>
  );
}
