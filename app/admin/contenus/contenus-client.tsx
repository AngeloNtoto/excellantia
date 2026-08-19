"use client";

import { useState } from "react";
import { QuestionsTable } from "./questions-table";
import { TextsTable } from "./texts-table";
import { CreateQuestionForm } from "./create-question-form";
import { CreateTextContentForm } from "./create-text-form";
import { ImportJsonForm } from "./import-json-form";
import { HelpCircle, BookOpen, PlusCircle, UploadCloud, Layers, FileCode, CheckCircle2 } from "lucide-react";

type Props = {
  questions: any[];
  texts: any[];
  stats: {
    totalQuestions: number;
    mathCount: number;
    frenchCount: number;
    englishCount: number;
    cultureCount: number;
    totalTexts: number;
  };
};

type TabItem = {
  id: "questions" | "texts" | "import" | "create_q" | "create_t";
  label: string;
  icon: any;
  highlight?: boolean;
};

export function ContenusClient({ questions, texts, stats }: Props) {
  const [activeTab, setActiveTab] = useState<"questions" | "texts" | "import" | "create_q" | "create_t">("questions");

  const tabs: TabItem[] = [
    { id: "questions", label: `Banque de questions (${stats.totalQuestions})`, icon: Layers },
    { id: "import", label: "Importer du JSON (Fichier / Collage)", icon: UploadCloud, highlight: true },
    { id: "create_q", label: "+ Créer une question", icon: PlusCircle },
    { id: "texts", label: `Textes de lecture (${stats.totalTexts})`, icon: BookOpen },
    { id: "create_t", label: "+ Créer un texte", icon: FileCode },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* STATS OVERVIEW CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 14 }}>
        <div className="card" style={{ padding: "14px 18px", borderLeft: "4px solid #6366f1" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>TOTAL QUESTIONS</div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-primary)" }}>{stats.totalQuestions}</div>
        </div>

        <div className="card" style={{ padding: "14px 18px", borderLeft: "4px solid #3b82f6" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>MATHÉMATIQUES</div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#3b82f6" }}>{stats.mathCount}</div>
        </div>

        <div className="card" style={{ padding: "14px 18px", borderLeft: "4px solid #10b981" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>FRANÇAIS</div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#10b981" }}>{stats.frenchCount}</div>
        </div>

        <div className="card" style={{ padding: "14px 18px", borderLeft: "4px solid #f59e0b" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>ANGLAIS</div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#f59e0b" }}>{stats.englishCount}</div>
        </div>

        <div className="card" style={{ padding: "14px 18px", borderLeft: "4px solid #ec4899" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>CULTURE G.</div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#ec4899" }}>{stats.cultureCount}</div>
        </div>

        <div className="card" style={{ padding: "14px 18px", borderLeft: "4px solid #8b5cf6" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>TEXTES ENREGISTRÉS</div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#8b5cf6" }}>{stats.totalTexts}</div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div style={{ display: "flex", gap: 8, borderBottom: "1px solid var(--border)", paddingBottom: 8, overflowX: "auto" }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 16px",
                borderRadius: 12,
                fontSize: "0.875rem",
                fontWeight: isActive ? 700 : 500,
                border: "none",
                cursor: "pointer",
                background: isActive ? "var(--accent, #6366f1)" : (tab.highlight ? "rgba(99, 102, 241, 0.08)" : "transparent"),
                color: isActive ? "#fff" : (tab.highlight ? "var(--accent)" : "var(--text-secondary)"),
                transition: "all 0.15s ease",
                whiteSpace: "nowrap",
              }}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ACTIVE TAB CONTENT */}
      <div>
        {activeTab === "questions" && (
          <div className="card" style={{ padding: 24 }}>
            <div style={{ marginBottom: 16 }}>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700, margin: 0 }}>Banque de questions en base de données</h2>
              <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                Recherchez, filtrez et gérez les questions utilisées pour la génération des salles d'examen et d'entraînement.
              </p>
            </div>
            <QuestionsTable questions={questions} />
          </div>
        )}

        {activeTab === "import" && (
          <div className="card" style={{ padding: 24 }}>
            <div style={{ marginBottom: 16 }}>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700, margin: 0 }}>Importation de questions et textes JSON</h2>
              <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                Chargez vos fichiers existants ou collez du JSON directement pour alimenter instantanément la base PostgreSQL.
              </p>
            </div>
            <ImportJsonForm />
          </div>
        )}

        {activeTab === "create_q" && (
          <div className="card" style={{ padding: 24, maxWidth: 840, margin: "0 auto", width: "100%" }}>
            <div style={{ marginBottom: 16 }}>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700, margin: 0 }}>Ajouter une nouvelle question</h2>
              <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                Créez une question autonome (Maths, Culture G, Grammaire...) ou associez-la à un texte existant.
              </p>
            </div>
            <CreateQuestionForm texts={texts} />
          </div>
        )}

        {activeTab === "texts" && (
          <div className="card" style={{ padding: 24 }}>
            <div style={{ marginBottom: 16 }}>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700, margin: 0 }}>Textes de compréhension de lecture</h2>
              <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                Textes et passages affichés aux candidats avant les séries de questions de compréhension.
              </p>
            </div>
            <TextsTable texts={texts} />
          </div>
        )}

        {activeTab === "create_t" && (
          <div className="card" style={{ padding: 24, maxWidth: 720, margin: "0 auto", width: "100%" }}>
            <div style={{ marginBottom: 16 }}>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700, margin: 0 }}>Ajouter un texte de lecture</h2>
              <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                Enregistrez un passage en français ou en anglais pour y rattacher ensuite des questions de compréhension.
              </p>
            </div>
            <CreateTextContentForm />
          </div>
        )}
      </div>
    </div>
  );
}
