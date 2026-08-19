"use client";

import { useState, useTransition } from "react";
import { createTextContentAction } from "@/lib/actions/content";

export function CreateTextContentForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createTextContentAction(formData);
      if (res?.error) {
        setError(res.error);
        return;
      }

      setSuccess("Texte ajouté avec succès.");
      e.currentTarget.reset();
    });
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {error && <div style={{ color: "var(--error)", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: 12 }}>{error}</div>}
      {success && <div style={{ color: "var(--success)", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 12, padding: 12 }}>{success}</div>}

      <div>
        <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Titre</label>
        <input name="title" type="text" className="input" required />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Langue</label>
          <select name="language" className="input" defaultValue="FR">
            <option value="FR">Français</option>
            <option value="EN">Anglais</option>
          </select>
        </div>

        <div>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Source</label>
          <input name="source" type="text" className="input" placeholder="Ex: Ministère, site interne" />
        </div>
      </div>

      <div>
        <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Contenu du texte</label>
        <textarea name="content" rows={8} className="input" required style={{ resize: "vertical" }} />
      </div>

      <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
        <input name="isActive" type="checkbox" defaultChecked />
        <span>Actif</span>
      </label>

      <button type="submit" className="btn btn-primary" disabled={isPending}>
        {isPending ? "Ajout..." : "Ajouter le texte"}
      </button>
    </form>
  );
}
