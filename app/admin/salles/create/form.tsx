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
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {error && <div style={{ color: "var(--error)", padding: 16, background: "var(--error-light)", borderRadius: "var(--radius-sm)" }}>{error}</div>}

      {/* Informations générales */}
      <section>
        <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: 16, borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>Informations générales</h2>
        <div style={{ display: "grid", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: 4 }}>Titre de l'épreuve</label>
            <input type="text" name="title" className="input" placeholder="Ex: Simulation nationale 2026" required />
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: 4 }}>Visibilité</label>
              <select name="visibility" className="input" onChange={(e) => setIsPrivate(e.target.value === "PRIVATE")} required>
                <option value="PUBLIC">Publique (Tous les candidats)</option>
                <option value="PRIVATE">Privée (Avec code d'accès)</option>
              </select>
            </div>
            {isPrivate && (
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: 4 }}>Code d'accès (Optionnel)</label>
                <input type="text" name="accessCode" className="input" placeholder="Laisser vide pour auto-générer" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Temps et Planification */}
      <section>
        <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: 16, borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>Temps & Planification</h2>
        <div style={{ display: "grid", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: 4 }}>Durée (minutes)</label>
              <input type="number" name="durationMin" className="input" defaultValue="100" min="10" required />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: 4 }}>Mode de temps</label>
              <select name="timeMode" className="input" required>
                <option value="ABSOLUTE">Absolu (Se termine à heure fixe pour tous)</option>
                <option value="RELATIVE">Relatif (Chronomètre individuel)</option>
              </select>
            </div>
          </div>
          
          <div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.875rem", fontWeight: 500 }}>
              <input type="checkbox" name="startNow" value="true" onChange={(e) => setIsScheduled(!e.target.checked)} defaultChecked />
              Démarrer immédiatement
            </label>
          </div>
          
          {isScheduled && (
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: 4 }}>Date et heure de début</label>
              <input type="datetime-local" name="scheduledAt" className="input" required={isScheduled} />
            </div>
          )}
        </div>
      </section>

      {/* Répartition des questions */}
      <section>
        <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: 16, borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>Répartition des questions (Total : 100)</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: 4 }}>Mathématiques</label>
            <input type="number" name="mathCount" className="input" defaultValue="25" min="0" max="100" required />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: 4 }}>Français</label>
            <input type="number" name="frenchCount" className="input" defaultValue="25" min="0" max="100" required />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: 4 }}>Anglais</label>
            <input type="number" name="englishCount" className="input" defaultValue="25" min="0" max="100" required />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: 4 }}>Culture Générale</label>
            <input type="number" name="cultureCount" className="input" defaultValue="25" min="0" max="100" required />
          </div>
        </div>
      </section>

      {/* Contraintes spécifiques */}
      <section>
        <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: 16, borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>Contraintes spécifiques</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: 4 }}>% Questions Faciles</label>
            <input type="number" name="easyPct" className="input" defaultValue="40" min="0" max="100" required />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: 4 }}>% Questions Moyennes</label>
            <input type="number" name="mediumPct" className="input" defaultValue="40" min="0" max="100" required />
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 4 }}>Le reste sera Difficile (Hard).</p>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: 4 }}>Nb Textes Français</label>
            <input type="number" name="frenchPassages" className="input" defaultValue="1" min="0" />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: 4 }}>Questions / Texte Français</label>
            <input type="number" name="frenchPassageQuestions" className="input" defaultValue="2" min="0" />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: 4 }}>Nb Textes Anglais</label>
            <input type="number" name="englishPassages" className="input" defaultValue="1" min="0" />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: 4 }}>Questions / Texte Anglais</label>
            <input type="number" name="englishPassageQuestions" className="input" defaultValue="2" min="0" />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: 4 }}>Questions Culture (RDC)</label>
            <input type="number" name="cultureDrc" className="input" defaultValue="15" min="0" />
          </div>
        </div>
      </section>

      <button type="submit" className="btn btn-primary" style={{ padding: 16, fontSize: "1.0625rem" }} disabled={isPending}>
        {isPending ? "Génération et Création..." : "Créer la salle"}
      </button>
    </form>
  );
}
