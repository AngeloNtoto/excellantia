"use client";

import { useState, useTransition } from "react";
import { createRoomAction } from "@/lib/actions/rooms";

export function CreateRoomForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const res = await createRoomAction(fd);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {error && (
        <div style={{ padding: 16, borderRadius: 14, background: "rgba(239, 68, 68, 0.1)", color: "var(--error)", border: "1px solid rgba(239, 68, 68, 0.2)", fontWeight: 600 }}>
          {error}
        </div>
      )}

      <section style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 20, padding: 24, boxShadow: "0 8px 24px rgba(15, 23, 42, 0.04)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 700, margin: 0 }}>Informations générales</h2>
            <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: "0.875rem" }}>Nommer la salle et définir son accès.</p>
          </div>
        </div>
        <div style={{ display: "grid", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: 6 }}>Titre de l'épreuve</label>
            <input type="text" name="title" className="input" placeholder="Ex: Simulation nationale 2026" required />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: 6 }}>Visibilité</label>
              <select name="visibility" className="input" onChange={(e) => setIsPrivate(e.target.value === "PRIVATE")} required>
                <option value="PUBLIC">Publique (Tous les candidats)</option>
                <option value="PRIVATE">Privée (Avec code d'accès)</option>
              </select>
            </div>
            {isPrivate && (
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: 6 }}>Code d'accès (optionnel)</label>
                <input type="text" name="accessCode" className="input" placeholder="Laisser vide pour auto-générer" />
              </div>
            )}
          </div>
        </div>
      </section>

      <section style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 20, padding: 24, boxShadow: "0 8px 24px rgba(15, 23, 42, 0.04)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 700, margin: 0 }}>Temps & Planification</h2>
            <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: "0.875rem" }}>Définir la durée et le démarrage de la salle.</p>
          </div>
        </div>
        <div style={{ display: "grid", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: 6 }}>Durée (minutes)</label>
              <input type="number" name="durationMin" className="input" defaultValue="100" min="10" required />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: 6 }}>Mode de temps</label>
              <select name="timeMode" className="input" defaultValue="ABSOLUTE" required>
                <option value="ABSOLUTE">Absolu (fin à heure fixe)</option>
                <option value="RELATIVE">Relatif (chronomètre individuel)</option>
              </select>
            </div>
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)", background: "var(--bg-muted)", border: "1px solid var(--border)", borderRadius: 14, padding: "12px 14px", width: "fit-content" }}>
            <input type="checkbox" name="startNow" value="true" onChange={(e) => setIsScheduled(!e.target.checked)} defaultChecked />
            Démarrer immédiatement
          </label>

          {isScheduled && (
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: 6 }}>Date et heure de début</label>
              <input type="datetime-local" name="scheduledAt" className="input" required={isScheduled} />
            </div>
          )}
        </div>
      </section>

      <section style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 20, padding: 24, boxShadow: "0 8px 24px rgba(15, 23, 42, 0.04)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 700, margin: 0 }}>Répartition des questions</h2>
            <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: "0.875rem" }}>Total : 100 questions</p>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: 6 }}>Mathématiques</label>
            <input type="number" name="mathCount" className="input" defaultValue="25" min="0" max="100" required />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: 6 }}>Français</label>
            <input type="number" name="frenchCount" className="input" defaultValue="25" min="0" max="100" required />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: 6 }}>Anglais</label>
            <input type="number" name="englishCount" className="input" defaultValue="25" min="0" max="100" required />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: 6 }}>Culture Générale</label>
            <input type="number" name="cultureCount" className="input" defaultValue="25" min="0" max="100" required />
          </div>
        </div>
      </section>

      <section style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 20, padding: 24, boxShadow: "0 8px 24px rgba(15, 23, 42, 0.04)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 700, margin: 0 }}>Contraintes spécifiques</h2>
            <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: "0.875rem" }}>Ajuster la difficulté et les passages.</p>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: 6 }}>% Questions Faciles</label>
            <input type="number" name="easyPct" className="input" defaultValue="40" min="0" max="100" required />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: 6 }}>% Questions Moyennes</label>
            <input type="number" name="mediumPct" className="input" defaultValue="40" min="0" max="100" required />
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 4 }}>Le reste sera difficile.</p>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: 6 }}>Nb Textes Français</label>
            <input type="number" name="frenchPassages" className="input" defaultValue="1" min="0" />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: 6 }}>Questions / Texte Français</label>
            <input type="number" name="frenchPassageQuestions" className="input" defaultValue="2" min="0" />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: 6 }}>Nb Textes Anglais</label>
            <input type="number" name="englishPassages" className="input" defaultValue="1" min="0" />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: 6 }}>Questions / Texte Anglais</label>
            <input type="number" name="englishPassageQuestions" className="input" defaultValue="2" min="0" />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: 6 }}>Questions Culture (RDC)</label>
            <input type="number" name="cultureDrc" className="input" defaultValue="15" min="0" />
          </div>
        </div>
      </section>

      <button type="submit" className="btn btn-primary" style={{ padding: 16, fontSize: "1.0625rem", borderRadius: 14 }} disabled={isPending}>
        {isPending ? "Génération et création..." : "Créer la salle"}
      </button>
    </form>
  );
}
