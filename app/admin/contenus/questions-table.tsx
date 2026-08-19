"use client";

import { useState, useTransition } from "react";
import { deleteQuestionAction, deleteManyQuestionsAction } from "@/lib/actions/content";
import { Trash2, Search, Check, BookOpen, Target, CheckCircle2, ArrowUpDown } from "lucide-react";

type QuestionItem = {
  id: string;
  subject: string;
  topic: string | null;
  subtopic: string | null;
  difficulty: string;
  language: string;
  statement: string;
  options: any;
  answerIndex: number;
  explanation: string | null;
  type: string;
  mode: string | null;
  scope: string | null;
  timesAppeared?: number;
  timesAnswered?: number;
  textContent?: { id: string; title: string } | null;
};

const SUBJECT_LABELS: Record<string, string> = {
  MATH: "Mathématiques",
  FRENCH: "Français",
  ENGLISH: "Anglais",
  GENERAL_CULTURE: "Culture Générale",
};

const DIFFICULTY_LABELS: Record<string, { label: string; badge: string }> = {
  EASY: { label: "Facile", badge: "badge-success" },
  MEDIUM: { label: "Moyenne", badge: "badge-warning" },
  HARD: { label: "Difficile", badge: "badge-error" },
};

export function QuestionsTable({ questions }: { questions: QuestionItem[] }) {
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("ALL");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("ALL");
  const [selectedTextOnly, setSelectedTextOnly] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"RECENT" | "MOST_APPEARED" | "MOST_ANSWERED" | "LEAST_APPEARED">("RECENT");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filtrage local en temps réel
  const filtered = questions.filter((q) => {
    if (selectedSubject !== "ALL" && q.subject !== selectedSubject) return false;
    if (selectedDifficulty !== "ALL" && q.difficulty !== selectedDifficulty) return false;
    if (selectedTextOnly === "WITH_TEXT" && !q.textContent) return false;
    if (selectedTextOnly === "WITHOUT_TEXT" && q.textContent) return false;

    if (search.trim()) {
      const s = search.toLowerCase();
      const matchStatement = q.statement.toLowerCase().includes(s);
      const matchTopic = q.topic?.toLowerCase().includes(s);
      const matchSubtopic = q.subtopic?.toLowerCase().includes(s);
      const matchText = q.textContent?.title.toLowerCase().includes(s);
      return matchStatement || matchTopic || matchSubtopic || matchText;
    }
    return true;
  });

  // Tri
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "MOST_APPEARED") {
      return (b.timesAppeared ?? 0) - (a.timesAppeared ?? 0);
    }
    if (sortBy === "MOST_ANSWERED") {
      return (b.timesAnswered ?? 0) - (a.timesAnswered ?? 0);
    }
    if (sortBy === "LEAST_APPEARED") {
      return (a.timesAppeared ?? 0) - (b.timesAppeared ?? 0);
    }
    return 0; // Par défaut (Plus récentes selon l'ordre de la requête DB)
  });

  function handleDelete(id: string) {
    if (!confirm("Voulez-vous vraiment supprimer cette question ?")) return;
    startTransition(async () => {
      await deleteQuestionAction(id);
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    });
  }

  function handleDeleteBatch() {
    if (selectedIds.length === 0) return;
    if (!confirm(`Supprimer définitivement ${selectedIds.length} question(s) sélectionnée(s) ?`)) return;
    startTransition(async () => {
      await deleteManyQuestionsAction(selectedIds);
      setSelectedIds([]);
    });
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  function toggleSelectAll() {
    if (selectedIds.length === sorted.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(sorted.map((q) => q.id));
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Search & Filter Bar */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 8, flex: 1, minWidth: 260, position: "relative" }}>
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par mot-clé, énoncé, chapitre..."
            className="input"
            style={{ paddingLeft: 34, fontSize: "0.875rem" }}
          />
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="input"
            style={{ fontSize: "0.8125rem", padding: "6px 12px", width: "auto" }}
          >
            <option value="ALL">Toutes matières</option>
            <option value="MATH">Mathématiques</option>
            <option value="FRENCH">Français</option>
            <option value="ENGLISH">Anglais</option>
            <option value="GENERAL_CULTURE">Culture Générale</option>
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="input"
            style={{ fontSize: "0.8125rem", padding: "6px 12px", width: "auto" }}
          >
            <option value="ALL">Toutes difficultés</option>
            <option value="EASY">Facile</option>
            <option value="MEDIUM">Moyenne</option>
            <option value="HARD">Difficile</option>
          </select>

          <select
            value={selectedTextOnly}
            onChange={(e) => setSelectedTextOnly(e.target.value)}
            className="input"
            style={{ fontSize: "0.8125rem", padding: "6px 12px", width: "auto" }}
          >
            <option value="ALL">Tous types</option>
            <option value="WITHOUT_TEXT">Questions autonomes</option>
            <option value="WITH_TEXT">Liées à un texte</option>
          </select>

          {/* Tri par usage / apparitions */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="input"
            style={{ fontSize: "0.8125rem", padding: "6px 12px", width: "auto", fontWeight: 600, color: "var(--accent)" }}
          >
            <option value="RECENT">⏱️ Plus récentes</option>
            <option value="MOST_APPEARED">🎯 Plus souvent appelées</option>
            <option value="MOST_ANSWERED">✍️ Plus souvent répondues</option>
            <option value="LEAST_APPEARED">⏳ Jamais / Moins appelées</option>
          </select>
        </div>
      </div>

      {/* Batch actions bar */}
      {selectedIds.length > 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "8px 16px",
            background: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            borderRadius: 12,
            fontSize: "0.875rem",
          }}
        >
          <span>
            <strong>{selectedIds.length}</strong> question(s) sélectionnée(s)
          </span>
          <button
            type="button"
            onClick={handleDeleteBatch}
            disabled={isPending}
            className="btn btn-danger"
            style={{ padding: "6px 14px", fontSize: "0.8125rem", display: "flex", alignItems: "center", gap: 6 }}
          >
            <Trash2 className="w-4 h-4" />
            Supprimer la sélection
          </button>
        </div>
      )}

      {/* Questions list / table */}
      <div style={{ border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden", background: "var(--bg-card)" }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-muted)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input
              type="checkbox"
              checked={sorted.length > 0 && selectedIds.length === sorted.length}
              onChange={toggleSelectAll}
              style={{ cursor: "pointer" }}
            />
            <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>
              {sorted.length} question(s) trouvée(s)
            </span>
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Total base : {questions.length}
          </span>
        </div>

        {sorted.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
            Aucune question ne correspond à vos filtres.
          </div>
        ) : (
          <div style={{ maxHeight: 650, overflowY: "auto" }}>
            {sorted.map((q) => {
              const options = Array.isArray(q.options) ? q.options : [];
              const isSelected = selectedIds.includes(q.id);
              const appeared = q.timesAppeared ?? 0;
              const answered = q.timesAnswered ?? 0;

              return (
                <div
                  key={q.id}
                  style={{
                    padding: "14px 16px",
                    borderBottom: "1px solid var(--border)",
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                    background: isSelected ? "rgba(99, 102, 241, 0.04)" : "transparent",
                    transition: "background 0.15s ease",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(q.id)}
                    style={{ marginTop: 4, cursor: "pointer" }}
                  />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 4 }}>
                      <span
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: 6,
                          background: "var(--accent, #6366f1)",
                          color: "#fff",
                        }}
                      >
                        {SUBJECT_LABELS[q.subject] || q.subject}
                      </span>

                      <span
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          padding: "2px 8px",
                          borderRadius: 6,
                          background: "var(--bg-muted)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        {DIFFICULTY_LABELS[q.difficulty]?.label || q.difficulty}
                      </span>

                      {/* STATS BADGES : APPELÉE & RÉPONDUE */}
                      <span
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          padding: "2px 8px",
                          borderRadius: 6,
                          background: appeared > 0 ? "rgba(99, 102, 241, 0.1)" : "var(--bg-muted)",
                          border: `1px solid ${appeared > 0 ? "rgba(99, 102, 241, 0.25)" : "var(--border)"}`,
                          color: appeared > 0 ? "var(--accent, #6366f1)" : "var(--text-muted)",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                        title="Nombre de fois que cette question a été tirée dans une salle ou un entraînement"
                      >
                        🎯 <strong>{appeared}</strong> {appeared > 1 ? "appels" : "appel"}
                      </span>

                      <span
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          padding: "2px 8px",
                          borderRadius: 6,
                          background: answered > 0 ? "rgba(16, 185, 129, 0.1)" : "var(--bg-muted)",
                          border: `1px solid ${answered > 0 ? "rgba(16, 185, 129, 0.25)" : "var(--border)"}`,
                          color: answered > 0 ? "var(--success, #10b981)" : "var(--text-muted)",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                        title="Nombre de fois où un candidat a soumis une réponse à cette question"
                      >
                        ✍️ <strong>{answered}</strong> {answered > 1 ? "réponses" : "réponse"}
                      </span>

                      {q.topic && (
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          📁 {q.topic} {q.subtopic ? `> ${q.subtopic}` : ""}
                        </span>
                      )}

                      {q.textContent && (
                        <span style={{ fontSize: "0.72rem", color: "var(--accent)", display: "flex", alignItems: "center", gap: 4 }}>
                          <BookOpen className="w-3 h-3" />
                          {q.textContent.title}
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-primary)", margin: "4px 0" }}>
                      {q.statement}
                    </div>

                    {/* Preview options */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 6, marginTop: 8 }}>
                      {options.map((opt: string, optIdx: number) => {
                        const isCorrect = optIdx === q.answerIndex;
                        return (
                          <div
                            key={optIdx}
                            style={{
                              fontSize: "0.78rem",
                              padding: "4px 8px",
                              borderRadius: 6,
                              background: isCorrect ? "rgba(34, 197, 94, 0.12)" : "var(--bg-muted)",
                              border: `1px solid ${isCorrect ? "rgba(34, 197, 94, 0.3)" : "var(--border)"}`,
                              color: isCorrect ? "var(--success)" : "var(--text-secondary)",
                              fontWeight: isCorrect ? 600 : 400,
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <span>{String.fromCharCode(65 + optIdx)}.</span>
                            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{opt}</span>
                            {isCorrect && <Check className="w-3.5 h-3.5 shrink-0 ml-auto" />}
                          </div>
                        );
                      })}
                    </div>

                    {q.explanation && (
                      <div style={{ marginTop: 6, fontSize: "0.75rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                        💡 {q.explanation}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(q.id)}
                    disabled={isPending}
                    className="btn btn-ghost"
                    title="Supprimer la question"
                    style={{ color: "var(--error)", padding: 6 }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
