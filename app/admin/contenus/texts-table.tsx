"use client";

import { useState, useTransition } from "react";
import { deleteTextContentAction } from "@/lib/actions/content";
import { Trash2, BookOpen, Layers, Eye, Globe } from "lucide-react";

type TextItem = {
  id: string;
  title: string;
  language: string;
  content: string;
  source: string | null;
  isActive: boolean;
  _count: { questions: number };
};

export function TextsTable({ texts }: { texts: TextItem[] }) {
  const [isPending, startTransition] = useTransition();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function handleDelete(id: string, title: string) {
    if (!confirm(`Supprimer le texte "${title}" ? Les questions associées deviendront autonomes.`)) return;
    startTransition(async () => {
      await deleteTextContentAction(id);
    });
  }

  if (texts.length === 0) {
    return (
      <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)", background: "var(--bg-muted)", borderRadius: 14 }}>
        Aucun texte de lecture enregistré en base pour le moment.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {texts.map((text) => {
        const isExpanded = expandedId === text.id;

        return (
          <div
            key={text.id}
            style={{
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: 16,
              background: "var(--bg-card)",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 6,
                      background: text.language === "FR" ? "#3b82f6" : "#10b981",
                      color: "#fff",
                    }}
                  >
                    {text.language}
                  </span>
                  <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}>{text.title}</h4>
                  {text.source && (
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      Source : {text.source}
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    fontSize: "0.75rem",
                    padding: "3px 8px",
                    borderRadius: 12,
                    background: "var(--bg-muted)",
                    border: "1px solid var(--border)",
                    color: "var(--text-secondary)",
                    fontWeight: 600,
                  }}
                >
                  {text._count.questions} question(s)
                </span>

                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : text.id)}
                  className="btn btn-ghost"
                  style={{ padding: "4px 8px", fontSize: "0.8rem" }}
                >
                  {isExpanded ? "Fermer" : "Lire"}
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(text.id, text.title)}
                  disabled={isPending}
                  className="btn btn-ghost"
                  style={{ color: "var(--error)", padding: "4px 8px" }}
                  title="Supprimer le texte"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              {isExpanded ? text.content : `${text.content.slice(0, 140)}${text.content.length > 140 ? "..." : ""}`}
            </p>
          </div>
        );
      })}
    </div>
  );
}
