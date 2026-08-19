"use client";

import { useState, useTransition } from "react";
import { createQuestionAction } from "@/lib/actions/content";

type TextSummary = {
  id: string;
  title: string;
  language: string;
};

export function CreateQuestionForm({ texts }: { texts: TextSummary[] }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createQuestionAction(formData);
      if (res?.error) {
        setError(res.error);
        return;
      }

      setSuccess("Question ajoutée avec succès à la base de données !");
      e.currentTarget.reset();
    });
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {error && (
        <div style={{ color: "var(--error)", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: 12, fontSize: "0.875rem" }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ color: "var(--success)", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 12, padding: 12, fontSize: "0.875rem" }}>
          {success}
        </div>
      )}

      {/* Texte associé (OPTIONNEL) */}
      <div>
        <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: "0.875rem" }}>
          Texte associé <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(Optionnel pour questions autonomes)</span>
        </label>
        <select name="textContentId" className="input" defaultValue="">
          <option value="">-- Aucun texte (Question autonome : Maths, Culture G, Grammaire...) --</option>
          {texts.map((text) => (
            <option key={text.id} value={text.id}>
              📖 [{text.language}] {text.title}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: "0.875rem" }}>Matière *</label>
          <select name="subject" className="input" defaultValue="MATH" required>
            <option value="MATH">Mathématiques</option>
            <option value="FRENCH">Français</option>
            <option value="ENGLISH">Anglais</option>
            <option value="GENERAL_CULTURE">Culture générale</option>
          </select>
        </div>

        <div>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: "0.875rem" }}>Difficulté *</label>
          <select name="difficulty" className="input" defaultValue="MEDIUM" required>
            <option value="EASY">Facile</option>
            <option value="MEDIUM">Moyenne</option>
            <option value="HARD">Difficile</option>
          </select>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: "0.875rem" }}>Sujet / Chapitre</label>
          <input name="topic" type="text" className="input" placeholder="Ex: Analyse, Histoire RDC, Géométrie..." />
        </div>

        <div>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: "0.875rem" }}>Sous-branche / Notion</label>
          <input name="subtopic" type="text" className="input" placeholder="Ex: Logarithmes, Indépendance..." />
        </div>
      </div>

      {/* Énoncé */}
      <div>
        <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: "0.875rem" }}>Énoncé de la question *</label>
        <textarea name="statement" rows={3} className="input" placeholder="Saisir la question ici..." required style={{ resize: "vertical" }} />
      </div>

      {/* 4 Options */}
      <div>
        <label style={{ display: "block", fontWeight: 600, marginBottom: 8, fontSize: "0.875rem" }}>Options de réponse (Exactement 4) *</label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 4 }}>Option 1 (Index 0)</div>
            <input name="option1" type="text" className="input" placeholder="Première option" required />
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 4 }}>Option 2 (Index 1)</div>
            <input name="option2" type="text" className="input" placeholder="Deuxième option" required />
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 4 }}>Option 3 (Index 2)</div>
            <input name="option3" type="text" className="input" placeholder="Troisième option" required />
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 4 }}>Option 4 (Index 3)</div>
            <input name="option4" type="text" className="input" placeholder="Quatrième option" required />
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: "0.875rem" }}>Bonne réponse *</label>
          <select name="answerIndex" className="input" defaultValue="0" required>
            <option value="0">Option 1</option>
            <option value="1">Option 2</option>
            <option value="2">Option 3</option>
            <option value="3">Option 4</option>
          </select>
        </div>

        <div>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: "0.875rem" }}>Langue</label>
          <select name="language" className="input" defaultValue="FR">
            <option value="FR">Français</option>
            <option value="EN">Anglais</option>
          </select>
        </div>
      </div>

      {/* Explication générale */}
      <div>
        <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: "0.875rem" }}>
          Explication pédagogique <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(Affichée lors de la correction)</span>
        </label>
        <textarea
          name="explanation"
          rows={2}
          className="input"
          placeholder="Expliquez la méthode ou le fait historique justifiant la réponse..."
          style={{ resize: "vertical" }}
        />
      </div>

      {/* Toggle options avancées */}
      <div>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{
            background: "none",
            border: "none",
            color: "var(--accent, #6366f1)",
            cursor: "pointer",
            fontSize: "0.8125rem",
            fontWeight: 600,
            padding: 0,
          }}
        >
          {showAdvanced ? "▲ Masquer les options avancées" : "▼ Afficher les options avancées (mode, scope, explications par option)"}
        </button>
      </div>

      {showAdvanced && (
        <div style={{ background: "var(--bg-muted)", padding: 16, borderRadius: 12, border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 4, fontSize: "0.75rem" }}>Mode</label>
              <select name="mode" className="input" defaultValue="">
                <option value="">Tous les modes</option>
                <option value="TRAINING">Entraînement seul</option>
                <option value="SIMULATION">Simulation seule</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 4, fontSize: "0.75rem" }}>Scope Culture G</label>
              <select name="scope" className="input" defaultValue="">
                <option value="">Général</option>
                <option value="DRC">RDC National</option>
                <option value="INTERNATIONAL">International</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 4, fontSize: "0.75rem" }}>Source</label>
              <select name="source" className="input" defaultValue="USER_CREATED">
                <option value="USER_CREATED">Admin Manuel</option>
                <option value="ROOM_GENERATED">Génération auto</option>
                <option value="TRAINING_POOL">Pool d'entraînement</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 600, marginBottom: 6 }}>Explications individuelles par option (Optionnel) :</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <input name="optionExplanation1" type="text" className="input" placeholder="Justification Option 1" style={{ fontSize: "0.8rem" }} />
              <input name="optionExplanation2" type="text" className="input" placeholder="Justification Option 2" style={{ fontSize: "0.8rem" }} />
              <input name="optionExplanation3" type="text" className="input" placeholder="Justification Option 3" style={{ fontSize: "0.8rem" }} />
              <input name="optionExplanation4" type="text" className="input" placeholder="Justification Option 4" style={{ fontSize: "0.8rem" }} />
            </div>
          </div>
        </div>
      )}

      <button type="submit" className="btn btn-primary" disabled={isPending} style={{ marginTop: 8, padding: 12 }}>
        {isPending ? "Enregistrement..." : "Créer la question"}
      </button>
    </form>
  );
}
