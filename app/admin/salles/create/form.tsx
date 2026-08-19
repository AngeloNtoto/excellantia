"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import { createRoomAction } from "@/lib/actions/rooms";

// ─── Subject config ───────────────────────────────────────────────────────────
type Subject = "MATH" | "FRENCH" | "ENGLISH" | "GENERAL_CULTURE";

const SUBJECT_LABELS: Record<Subject, string> = {
  MATH: "Mathématiques",
  FRENCH: "Français",
  ENGLISH: "Anglais",
  GENERAL_CULTURE: "Culture Générale",
};

// ─── TopicPicker component (per subject) ─────────────────────────────────────
function TopicPicker({
  subject,
  selectedTopics,
  onChange,
}: {
  subject: Subject;
  selectedTopics: string[];
  onChange: (topics: string[]) => void;
}) {
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch topics for this subject from the API
    setLoading(true);
    fetch(`/api/topics?subject=${subject}`)
      .then((r) => r.json())
      .then((data) => {
        setAvailableTopics(data.topics ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [subject]);

  const toggleTopic = useCallback(
    (topic: string) => {
      onChange(
        selectedTopics.includes(topic)
          ? selectedTopics.filter((t) => t !== topic)
          : [...selectedTopics, topic]
      );
    },
    [selectedTopics, onChange]
  );

  const selectAll = () => onChange([...availableTopics]);
  const clearAll = () => onChange([]);

  if (loading) return <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Chargement des sous-branches…</p>;
  if (availableTopics.length === 0) return <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Aucune sous-branche disponible.</p>;

  return (
    <div style={{ marginTop: 8 }}>
      {/* Select all / clear all controls */}
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <button
          type="button"
          onClick={selectAll}
          style={{
            fontSize: "0.75rem",
            padding: "4px 10px",
            borderRadius: 8,
            border: "1px solid var(--border)",
            background: "var(--bg-muted)",
            color: "var(--text-primary)",
            cursor: "pointer",
          }}
        >
          Tout sélectionner
        </button>
        <button
          type="button"
          onClick={clearAll}
          style={{
            fontSize: "0.75rem",
            padding: "4px 10px",
            borderRadius: 8,
            border: "1px solid var(--border)",
            background: "var(--bg-muted)",
            color: "var(--text-muted)",
            cursor: "pointer",
          }}
        >
          Effacer
        </button>
        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", alignSelf: "center" }}>
          {selectedTopics.length === 0
            ? "Toutes les sous-branches (par défaut)"
            : `${selectedTopics.length} / ${availableTopics.length} sélectionnée(s)`}
        </span>
      </div>

      {/* Topic chips grid */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {availableTopics.map((topic) => {
          const active = selectedTopics.includes(topic);
          return (
            <button
              key={topic}
              type="button"
              onClick={() => toggleTopic(topic)}
              style={{
                padding: "5px 12px",
                borderRadius: 20,
                border: `1.5px solid ${active ? "var(--accent)" : "var(--border)"}`,
                background: active ? "var(--accent)" : "var(--bg-muted)",
                color: active ? "#fff" : "var(--text-primary)",
                fontSize: "0.78rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {topic}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main form component ──────────────────────────────────────────────────────
export function CreateRoomForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);

  // Track selected topics per subject (empty = all topics allowed)
  const [selectedTopics, setSelectedTopics] = useState<Record<Subject, string[]>>({
    MATH: [],
    FRENCH: [],
    ENGLISH: [],
    GENERAL_CULTURE: [],
  });

  const updateTopics = useCallback((subject: Subject, topics: string[]) => {
    setSelectedTopics((prev) => ({ ...prev, [subject]: topics }));
  }, []);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    // Serialize selectedTopics as JSON string
    fd.set("selectedTopics", JSON.stringify(selectedTopics));

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

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
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
      <section style={sectionStyle}>
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
      <section style={sectionStyle}>
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
                    <input type="radio" name="timingRegime" value="EINSTEIN" defaultChecked />
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
                    <input type="radio" name="timingRegime" value="NEWTON" />
                    <strong style={{ fontSize: "0.9rem", color: "var(--text-primary)" }}>Newton</strong>
                  </div>
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: "rgba(245, 158, 11, 0.15)", color: "#f59e0b" }}>
                    Mécanique
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
                  Temps segmenté par matière. Écran de repos pour les finisseurs précoces.
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
                    <input type="radio" name="timingRegime" value="TESLA" />
                    <strong style={{ fontSize: "0.9rem", color: "var(--text-primary)" }}>Tesla</strong>
                  </div>
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: "rgba(6, 182, 212, 0.15)", color: "#06b6d4" }}>
                    Éclair
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
                  1 min = 1 question. Passage auto, sans retour en arrière possible.
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
              <input type="number" name="durationMin" style={inputStyle} defaultValue="100" min="1" required />
            </div>
            <div>
              <label style={labelStyle}>Mode d'horloge</label>
              <select name="clockMode" style={inputStyle} defaultValue="ABSOLUTE" required>
                <option value="ABSOLUTE">Absolu (heure fixe pour tous)</option>
                <option value="RELATIVE">Relatif (chronomètre individuel)</option>
              </select>
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
      <section style={sectionStyle}>
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 700, margin: 0 }}>Répartition des questions</h2>
          <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: "0.875rem" }}>
            Définissez le nombre de questions par matière.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16 }}>
          <div>
            <label style={labelStyle}>Mathématiques</label>
            <input type="number" name="mathCount" style={inputStyle} defaultValue="25" min="0" max="100" required />
          </div>
          <div>
            <label style={labelStyle}>Français</label>
            <input type="number" name="frenchCount" style={inputStyle} defaultValue="25" min="0" max="100" required />
          </div>
          <div>
            <label style={labelStyle}>Anglais</label>
            <input type="number" name="englishCount" style={inputStyle} defaultValue="25" min="0" max="100" required />
          </div>
          <div>
            <label style={labelStyle}>Culture Générale</label>
            <input type="number" name="cultureCount" style={inputStyle} defaultValue="25" min="0" max="100" required />
          </div>
        </div>
      </section>

      {/* ── SECTION 4 : Sous-branches (Topics) ── */}
      <section style={sectionStyle}>
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 700, margin: 0 }}>Sous-branches</h2>
          <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: "0.875rem" }}>
            Sélectionnez les chapitres à inclure par matière. Par défaut, tous les chapitres sont inclus.
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {(["MATH", "FRENCH", "ENGLISH", "GENERAL_CULTURE"] as Subject[]).map((subject) => (
            <div
              key={subject}
              style={{
                padding: 16,
                borderRadius: 14,
                border: "1px solid var(--border)",
                background: "var(--bg-muted)",
              }}
            >
              <h3 style={{ fontSize: "0.95rem", fontWeight: 700, margin: "0 0 4px" }}>
                {SUBJECT_LABELS[subject]}
              </h3>
              <TopicPicker
                subject={subject}
                selectedTopics={selectedTopics[subject]}
                onChange={(topics) => updateTopics(subject, topics)}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION 5 : Contraintes de difficulté ── */}
      <section style={sectionStyle}>
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
          <div>
            <label style={labelStyle}>Questions Culture (RDC)</label>
            <input type="number" name="cultureDrc" style={inputStyle} defaultValue="15" min="0" />
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
