"use client";

import { useState, useTransition, useRef } from "react";
import { importCandidatesAction } from "@/lib/actions/candidates";

export function ImportCandidatesForm() {
  const [isPending, startTransition] = useTransition();
  const [report, setReport] = useState<{ created: number; skipped: number; errors: any[] } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setReport(null);
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        startTransition(async () => {
          const res = await importCandidatesAction(json);
          setReport(res);
          if (fileRef.current) fileRef.current.value = "";
        });
      } catch (err) {
        alert("Fichier JSON invalide.");
      }
    };
    
    reader.readAsText(file);
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <textarea
          placeholder="Collez votre JSON ici..."
          className="input"
          style={{ width: "100%", height: "120px", padding: "12px", fontFamily: "var(--font-mono)", fontSize: "0.875rem", resize: "vertical" }}
          onChange={(e) => {
            if (!e.target.value.trim()) return;
            try {
              const json = JSON.parse(e.target.value);
              startTransition(async () => {
                const res = await importCandidatesAction(json);
                setReport(res);
                e.target.value = ""; // Clear on success
              });
            } catch (err) {
              // Not a valid JSON yet, do nothing until they paste completely or click a button
            }
          }}
          onBlur={(e) => {
            if (!e.target.value.trim()) return;
            try {
              const json = JSON.parse(e.target.value);
              startTransition(async () => {
                const res = await importCandidatesAction(json);
                setReport(res);
                e.target.value = "";
              });
            } catch (err) {
              alert("Le JSON collé est invalide.");
            }
          }}
          disabled={isPending}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
        <div style={{ flex: 1, height: "1px", background: "var(--border-subtle)" }}></div>
        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>OU</span>
        <div style={{ flex: 1, height: "1px", background: "var(--border-subtle)" }}></div>
      </div>

      <input 
        type="file" 
        accept=".json" 
        onChange={handleFileChange} 
        ref={fileRef}
        style={{ display: "none" }} 
      />
      <button 
        className="btn btn-ghost" 
        style={{ width: "100%" }} 
        onClick={() => fileRef.current?.click()}
        disabled={isPending}
      >
        {isPending ? "Importation..." : "Importer un fichier JSON"}
      </button>

      {report && (
        <div style={{ 
          marginTop: 16, 
          padding: 16, 
          background: report.errors.length > 0 ? "rgba(239, 68, 68, 0.1)" : "rgba(34, 197, 94, 0.1)", 
          border: `1px solid ${report.errors.length > 0 ? "var(--error)" : "var(--success)"}`,
          borderRadius: "var(--radius-sm)", 
          fontSize: "0.875rem" 
        }}>
          <p style={{ margin: "0 0 12px 0", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px", color: report.errors.length > 0 ? "var(--error)" : "var(--success)" }}>
            {report.errors.length > 0 ? "⚠️ Importation terminée avec des erreurs" : "✅ Importation réussie !"}
          </p>
          <ul style={{ margin: 0, paddingLeft: 20, color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "4px" }}>
            <li><span style={{ color: "var(--success)", fontWeight: 700 }}>{report.created}</span> comptes créés</li>
            <li><span style={{ color: "var(--warning)", fontWeight: 700 }}>{report.skipped}</span> ignorés (doublons détectés)</li>
            {report.errors.length > 0 && (
              <li><span style={{ color: "var(--error)", fontWeight: 700 }}>{report.errors.length}</span> erreurs rencontrées</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
