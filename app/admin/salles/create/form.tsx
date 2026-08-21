"use client";

import { useState, useTransition } from "react";
import { createRoomAction } from "@/lib/actions/rooms";

type Subject = "MATH" | "FRENCH" | "ENGLISH" | "GENERAL_CULTURE";
const SUBJECT_LABELS: Record<Subject, string> = {
  MATH: "Mathématiques",
  FRENCH: "Français",
  ENGLISH: "Anglais",
  GENERAL_CULTURE: "Culture générale",
};
const DEFAULT_SUBJECT_ORDER: Subject[] = ["FRENCH", "ENGLISH", "MATH", "GENERAL_CULTURE"];

// ─── Main form component ──────────────────────────────────────────────────────
export function CreateRoomForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);
  const [timingRegime, setTimingRegime] = useState<"EINSTEIN" | "NEWTON" | "TESLA">("EINSTEIN");
  const [clockMode, setClockMode] = useState<"ABSOLUTE" | "RELATIVE">("ABSOLUTE");
  const [durationMin, setDurationMin] = useState(100);
  const [questionCounts, setQuestionCounts] = useState({ math: 25, french: 25, english: 25, culture: 25 });
  const [subjectOrder, setSubjectOrder] = useState<Subject[]>(DEFAULT_SUBJECT_ORDER);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createRoomAction(fd);
      if (res?.error) setError(res.error);
    });
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid var(--border)",
    background: "var(--bg-muted)",
    color: "var(--text-primary)",
    fontSize: "0.9rem",
    outline: "none",
  };

  const sectionStyle: React.CSSProperties = {
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: 20,
    padding: 24,
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.04)",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.875rem",
    fontWeight: 600,
    marginBottom: 6,
  };

  const totalQuestions = Object.values(questionCounts).reduce((total, count) => total + count, 0);
  const displayedDuration = timingRegime === "TESLA" ? totalQuestions : durationMin;

  function handleTimingRegimeChange(regime: "EINSTEIN" | "NEWTON" | "TESLA") {
    setTimingRegime(regime);
    if (regime === "NEWTON") setClockMode("ABSOLUTE");
    if (regime === "TESLA") setClockMode("RELATIVE");
  }

  function moveSubject(subject: Subject, direction: -1 | 1) {
    setSubjectOrder((current) => {
      const index = current.indexOf(subject);
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <header
        style={{
          padding: "22px 24px",
          borderRadius: 20,
          color: "#fff",
          background: "#4f46e5",
          boxShadow: "0 16px 34px rgba(49, 46, 129, 0.2)",
        }}
      >
        <div style={{ fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.75 }}>
          Configuration de salle
        </div>
        <h1 style={{ margin: "6px 0 4px", fontSize: "1.45rem", fontWeight: 800 }}>Construire une épreuve cohérente</h1>
        <p style={{ margin: 0, color: "rgba(255,255,255,0.78)", fontSize: "0.875rem" }}>
          Réglez le contexte, le rythme et la composition. Les questions seront sélectionnées automatiquement dans le stock disponible.
        </p>
        <div style={{ display: "inline-flex", marginTop: 16, padding: "7px 11px", borderRadius: 10, background: "rgba(255,255,255,0.14)", fontSize: "0.8rem", fontWeight: 700 }}>
          {totalQuestions} questions configurées
        </div>
      </header>
      {/* Error banner */}
      {error && (
        <div
          style={{
            padding: 16,
            borderRadius: 14,
            background: "rgba(239, 68, 68, 0.1)",
            color: "var(--error)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            fontWeight: 600,
          }}
        >
          {error}
        </div>
      )}

      {/* ── SECTION 1 : Informations générales ── */}
      <section style={{ ...sectionStyle, borderTop: "3px solid #6366f1" }}>
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 700, margin: 0 }}>Informations générales</h2>
          <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: "0.875rem" }}>
            Nommer la salle et définir son accès.
          </p>
        </div>
        <div style={{ display: "grid", gap: 16 }}>
          <div>
            <label style={labelStyle}>Titre de l'épreuve</label>
            <input type="text" name="title" style={inputStyle} placeholder="Ex: Simulation nationale 2026" required />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16 }}>
            <div>
              <label style={labelStyle}>Visibilité</label>
              <select
                name="visibility"
                style={inputStyle}
                onChange={(e) => setIsPrivate(e.target.value === "PRIVATE")}
                required
              >
                <option value="PUBLIC">Publique (Tous les candidats)</option>
                <option value="PRIVATE">Privée (Avec code d'accès)</option>
              </select>
            </div>
            {isPrivate && (
              <div>
                <label style={labelStyle}>Code d'accès (optionnel)</label>
                <input type="text" name="accessCode" style={inputStyle} placeholder="Laisser vide pour auto-générer" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── SECTION 2 : Temps & Planification ── */}
      <section style={{ ...sectionStyle, borderTop: "3px solid #06b6d4" }}>
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 700, margin: 0 }}>Temps &amp; Planification</h2>
          <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: "0.875rem" }}>
            Définir la durée et le démarrage de la salle.
          </p>
        </div>
        <div style={{ display: "grid", gap: 16 }}>
          <div>
            <label style={labelStyle}>Mode de la salle</label>
            <select name="mode" style={inputStyle} defaultValue="SIMULATION" required>
              <option value="SIMULATION">Simulation / salon</option>
              <option value="TRAINING">Entraînement</option>
            </select>
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "0.875rem", fontWeight: 600 }}>
            <input type="checkbox" name="includeTrainingQuestions" value="true" />
            Inclure des questions d&apos;entraînement
          </label>

          {/* SÉLECTEUR DE RÉGIME TEMPOREL */}
          <div>
            <label style={labelStyle}>Régime Temporel de l'Épreuve</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 8 }}>
              {/* Einstein */}
              <label
                style={{
                  border: "1.5px solid var(--border)",
                  borderRadius: 14,
                  padding: "14px 16px",
                  cursor: "pointer",
                  background: "var(--bg-muted)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input type="radio" name="timingRegime" value="EINSTEIN" checked={timingRegime === "EINSTEIN"} onChange={() => handleTimingRegimeChange("EINSTEIN")} />
                    <strong style={{ fontSize: "0.9rem", color: "var(--text-primary)" }}>Einstein</strong>
                  </div>
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: "rgba(99, 102, 241, 0.15)", color: "#6366f1" }}>
                    Continuum
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
                  Temps global fluide. Toutes les questions sont accessibles en continu.
                </p>
              </label>

              {/* Newton */}
              <label
                style={{
                  border: "1.5px solid var(--border)",
                  borderRadius: 14,
                  padding: "14px 16px",
                  cursor: "pointer",
                  background: "var(--bg-muted)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input type="radio" name="timingRegime" value="NEWTON" checked={timingRegime === "NEWTON"} onChange={() => handleTimingRegimeChange("NEWTON")} />
                    <strong style={{ fontSize: "0.9rem", color: "var(--text-primary)" }}>Newton</strong>
                  </div>
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: "rgba(245, 158, 11, 0.15)", color: "#f59e0b" }}>
                    Mécanique
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
                  Une phase par domaine, avec 1 minute par question disponible pour toute la phase. Horloge absolue obligatoire.
                </p>
              </label>

              {/* Tesla */}
              <label
                style={{
                  border: "1.5px solid var(--border)",
                  borderRadius: 14,
                  padding: "14px 16px",
                  cursor: "pointer",
                  background: "var(--bg-muted)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input type="radio" name="timingRegime" value="TESLA" checked={timingRegime === "TESLA"} onChange={() => handleTimingRegimeChange("TESLA")} />
                    <strong style={{ fontSize: "0.9rem", color: "var(--text-primary)" }}>Tesla</strong>
                  </div>
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: "rgba(6, 182, 212, 0.15)", color: "#06b6d4" }}>
                    Éclair
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
                  1 question = 1 minute. Le total de minutes suit automatiquement le nombre de questions, en horloge relative.
                </p>
              </label>
            </div>
          </div>

          {/* SÉLECTEUR DU MODE D'AFFICHAGE DU CHRONOMÈTRE */}
          <div>
            <label style={labelStyle}>Mode d'Affichage du Chronomètre</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 8 }}>
              {/* Galilée */}
              <label
                style={{
                  border: "1.5px solid var(--border)",
                  borderRadius: 14,
                  padding: "14px 16px",
                  cursor: "pointer",
                  background: "var(--bg-muted)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input type="radio" name="chronoMode" value="GALILEE" defaultChecked />
                    <strong style={{ fontSize: "0.9rem", color: "var(--text-primary)" }}>Galilée</strong>
                  </div>
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: "rgba(99, 102, 241, 0.15)", color: "#6366f1" }}>
                    Continu
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
                  Chronomètre visible en permanence de la 1ère à la dernière seconde.
                </p>
              </label>

              {/* Heisenberg */}
              <label
                style={{
                  border: "1.5px solid var(--border)",
                  borderRadius: 14,
                  padding: "14px 16px",
                  cursor: "pointer",
                  background: "var(--bg-muted)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input type="radio" name="chronoMode" value="HEISENBERG" />
                    <strong style={{ fontSize: "0.9rem", color: "var(--text-primary)" }}>Heisenberg</strong>
                  </div>
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: "rgba(245, 158, 11, 0.15)", color: "#f59e0b" }}>
                    Incertitude
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
                  Visible par fenêtres (100-95%, 75-70%, 55-50%, 25-20%) et sous 60s.
                </p>
              </label>

              {/* Schrödinger */}
              <label
                style={{
                  border: "1.5px solid var(--border)",
                  borderRadius: 14,
                  padding: "14px 16px",
                  cursor: "pointer",
                  background: "var(--bg-muted)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input type="radio" name="chronoMode" value="SCHRODINGER" />
                    <strong style={{ fontSize: "0.9rem", color: "var(--text-primary)" }}>Schrödinger</strong>
                  </div>
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: "rgba(139, 92, 246, 0.15)", color: "#8b5cf6" }}>
                    Boîte Noire
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
                  Chrono masqué, 2 ouvertures de boîte (5s) et révélation sous 60s.
                </p>
              </label>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16 }}>
            <div>
              <label style={labelStyle}>Durée globale (minutes)</label>
              <input type="number" name="durationMin" style={inputStyle} value={displayedDuration} onChange={(e) => setDurationMin(Number(e.target.value) || 1)} min="1" required disabled={timingRegime === "TESLA"} />
              {timingRegime === "TESLA" && <p style={{ margin: "5px 0 0", color: "#0891b2", fontSize: "0.72rem", fontWeight: 700 }}>Tesla : {totalQuestions} questions = {totalQuestions} minutes.</p>}
            </div>
            <div>
              <label style={labelStyle}>Mode d'horloge</label>
              <select name="clockMode" style={inputStyle} value={clockMode} onChange={(e) => setClockMode(e.target.value as "ABSOLUTE" | "RELATIVE")} disabled={timingRegime === "TESLA"} required>
                <option value="ABSOLUTE">Absolu (heure fixe pour tous)</option>
                <option value="RELATIVE">Relatif (chronomètre individuel)</option>
              </select>
              {timingRegime === "TESLA" && <input type="hidden" name="clockMode" value={clockMode} />}
              <p style={{ margin: "5px 0 0", color: "var(--text-muted)", fontSize: "0.72rem" }}>
                {timingRegime === "TESLA"
                  ? "Tesla impose l'horloge relative."
                  : timingRegime === "NEWTON"
                    ? "Newton relatif donne 10 secondes de repos entre les matières; le temps non utilisé est perdu."
                    : "Choisissez l'horloge adaptée à votre épreuve."}
              </p>
            </div>
          </div>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "var(--text-primary)",
              background: "var(--bg-muted)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: "12px 14px",
              width: "fit-content",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              name="startNow"
              value="true"
              onChange={(e) => setIsScheduled(!e.target.checked)}
              defaultChecked
            />
            Démarrer immédiatement
          </label>

          {isScheduled && (
            <div>
              <label style={labelStyle}>Date et heure de début</label>
              <input type="datetime-local" name="scheduledAt" style={inputStyle} required={isScheduled} />
            </div>
          )}
        </div>
      </section>

      {/* ── SECTION 3 : Répartition des questions ── */}
      <section style={{ ...sectionStyle, borderTop: "3px solid #10b981" }}>
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 700, margin: 0 }}>Répartition des questions</h2>
          <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: "0.875rem" }}>
            Définissez le nombre de questions par matière.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16 }}>
          <div>
            <label style={labelStyle}>Mathématiques</label>
            <input type="number" name="mathCount" style={inputStyle} value={questionCounts.math} onChange={(e) => setQuestionCounts((current) => ({ ...current, math: Number(e.target.value) || 0 }))} min="0" max="100" required />
          </div>
          <div>
            <label style={labelStyle}>Français</label>
            <input type="number" name="frenchCount" style={inputStyle} value={questionCounts.french} onChange={(e) => setQuestionCounts((current) => ({ ...current, french: Number(e.target.value) || 0 }))} min="0" max="100" required />
          </div>
          <div>
            <label style={labelStyle}>Anglais</label>
            <input type="number" name="englishCount" style={inputStyle} value={questionCounts.english} onChange={(e) => setQuestionCounts((current) => ({ ...current, english: Number(e.target.value) || 0 }))} min="0" max="100" required />
          </div>
          <div>
            <label style={labelStyle}>Culture Générale</label>
            <input type="number" name="cultureCount" style={inputStyle} value={questionCounts.culture} onChange={(e) => setQuestionCounts((current) => ({ ...current, culture: Number(e.target.value) || 0 }))} min="0" max="100" required />
          </div>
        </div>
      </section>

      <section style={{ ...sectionStyle, borderTop: "3px solid #8b5cf6" }}>
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 700, margin: 0 }}>Ordre des domaines</h2>
          <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: "0.875rem" }}>
            Cet ordre sera utilisé par Newton. Par défaut : Français, Anglais, Mathématiques, Culture générale.
          </p>
        </div>
        <input type="hidden" name="subjectOrder" value={JSON.stringify(subjectOrder)} />
        <div style={{ display: "grid", gap: 8 }}>
          {subjectOrder.map((subject, index) => (
            <div key={subject} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", border: "1px solid var(--border)", borderRadius: 12, background: "var(--bg-muted)" }}>
              <span style={{ width: 24, height: 24, display: "grid", placeItems: "center", borderRadius: 8, background: "#8b5cf6", color: "#fff", fontSize: "0.75rem", fontWeight: 800 }}>{index + 1}</span>
              <strong style={{ flex: 1, fontSize: "0.875rem" }}>{SUBJECT_LABELS[subject]}</strong>
              <button type="button" onClick={() => moveSubject(subject, -1)} disabled={index === 0} className="btn btn-ghost" style={{ padding: "5px 9px" }} title="Monter ce domaine">↑</button>
              <button type="button" onClick={() => moveSubject(subject, 1)} disabled={index === subjectOrder.length - 1} className="btn btn-ghost" style={{ padding: "5px 9px" }} title="Descendre ce domaine">↓</button>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION 4 : Contraintes de difficulté ── */}
      <section style={{ ...sectionStyle, borderTop: "3px solid #f59e0b" }}>
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 700, margin: 0 }}>Difficulté</h2>
          <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: "0.875rem" }}>
            Proportion de questions par niveau. Le reste sera difficile.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16 }}>
          <div>
            <label style={labelStyle}>% Questions Faciles</label>
            <input type="number" name="easyPct" style={inputStyle} defaultValue="40" min="0" max="100" required />
          </div>
          <div>
            <label style={labelStyle}>% Questions Moyennes</label>
            <input type="number" name="mediumPct" style={inputStyle} defaultValue="40" min="0" max="100" required />
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 4 }}>Le reste sera difficile.</p>
          </div>
        </div>
      </section>

      {/* ── Submit ── */}
      <button
        type="submit"
        className="btn btn-primary"
        style={{ padding: 16, fontSize: "1.0625rem", borderRadius: 14 }}
        disabled={isPending}
      >
        {isPending ? "Génération et création..." : "Créer la salle"}
      </button>
    </form>
  );
}
