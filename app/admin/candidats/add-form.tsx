"use client";

import { useState, useTransition } from "react";
import { addCandidateAction } from "@/lib/actions/candidates";

export function AddCandidateForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    
    const fd = new FormData(e.currentTarget);
    const code = fd.get("code") as string;
    
    if (code.length !== 14 || !/^\d+$/.test(code)) {
      setError("Le code doit contenir exactement 14 chiffres.");
      return;
    }

    startTransition(async () => {
      const res = await addCandidateAction(fd);
      if (res?.error) {
        setError(res.error);
      } else {
        setSuccess(true);
        (e.target as HTMLFormElement).reset();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {error && <div style={{ color: "var(--error)", fontSize: "0.875rem", padding: "8px 12px", background: "var(--error-light)", borderRadius: "var(--radius-sm)" }}>{error}</div>}
      {success && <div style={{ color: "var(--success)", fontSize: "0.875rem", padding: "8px 12px", background: "var(--success-light)", borderRadius: "var(--radius-sm)" }}>Candidat ajouté avec succès.</div>}
      
      <div>
        <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 500, marginBottom: 4 }}>Nom complet</label>
        <input type="text" name="fullname" className="input" placeholder="Ex: KABONGO Jean Pierre" required />
      </div>
      <div>
        <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 500, marginBottom: 4 }}>Code d'accès (14 chiffres)</label>
        <input type="text" name="code" className="input" placeholder="Ex: 25072006123456" minLength={14} maxLength={14} required style={{ fontFamily: "var(--font-mono)" }} />
      </div>
      <button type="submit" className="btn btn-primary" disabled={isPending}>
        {isPending ? "Ajout..." : "Ajouter le candidat"}
      </button>
    </form>
  );
}
