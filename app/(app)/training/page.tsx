"use client";

import { useState, useTransition } from "react";
import { startTrainingAction } from "@/lib/actions/training";

export default function TrainingPage() {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await startTrainingAction(fd);
      if (res?.error) alert(res.error);
    });
  }

  return (
    <main className="page page-sm">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 4 }}>Entraînement personnel</h1>
        <p style={{ color: "var(--text-secondary)" }}>Lancez une session sur mesure pour vous entraîner.</p>
      </div>

      <div className="card" style={{ padding: 32 }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: 8 }}>Matières à inclure</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              {["Mathématiques", "Français", "Anglais", "Culture Générale"].map((subj, i) => (
                <label key={subj} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.875rem" }}>
                  <input type="checkbox" name={`subject_${i}`} value="true" defaultChecked />
                  {subj}
                </label>
              ))}
            </div>
          </div>
          
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: 8 }}>Difficulté ciblée</label>
            <select name="difficulty" className="input" defaultValue="MIXED">
              <option value="EASY">Facile (70% faciles, 30% moyennes)</option>
              <option value="MIXED">Mixte (Standard)</option>
              <option value="HARD">Difficile (50% difficiles, 50% moyennes)</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: 8 }}>Durée (minutes)</label>
            <input type="number" name="duration" className="input" defaultValue="60" min="10" max="120" />
          </div>

          <button type="submit" className="btn btn-primary" style={{ padding: 14, fontSize: "1rem" }} disabled={isPending}>
            {isPending ? "Génération..." : "Démarrer l'entraînement"}
          </button>
        </form>
      </div>
    </main>
  );
}
