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
        <div style={{ marginTop: 16, padding: 12, background: "var(--bg-muted)", borderRadius: "var(--radius-sm)", fontSize: "0.875rem" }}>
          <p style={{ margin: "0 0 8px 0", fontWeight: 600 }}>Rapport d'importation :</p>
          <ul style={{ margin: 0, paddingLeft: 20, color: "var(--text-secondary)" }}>
            <li><span style={{ color: "var(--success)", fontWeight: 600 }}>{report.created}</span> créés</li>
            <li><span style={{ color: "var(--warning)", fontWeight: 600 }}>{report.skipped}</span> ignorés (doublons)</li>
            <li><span style={{ color: "var(--error)", fontWeight: 600 }}>{report.errors.length}</span> erreurs</li>
          </ul>
        </div>
      )}
    </div>
  );
}
