"use client";

import { useState, useTransition } from "react";
import { importContentBundleAction } from "@/lib/actions/content";
import { Upload, FileCode, CheckCircle2, AlertCircle, Sparkles, Copy, FileText } from "lucide-react";

export function ImportJsonForm() {
  const [isPending, startTransition] = useTransition();
  const [jsonText, setJsonText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [previewInfo, setPreviewInfo] = useState<{ count: number; type: string } | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    ok: boolean;
    createdQuestions: number;
    createdTexts: number;
    errors: string[];
  } | null>(null);

  // Analyse et prévisualise le JSON saisi
  function handleTextChange(value: string) {
    setJsonText(value);
    setResult(null);
    setParseError(null);

    if (!value.trim()) {
      setPreviewInfo(null);
      return;
    }

    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        const isQuestions = parsed.some((p) => p && (p.statement || p.options));
        const isTexts = parsed.some((p) => p && p.title && p.content);
        setPreviewInfo({
          count: parsed.length,
          type: isQuestions ? "Questions directes" : isTexts ? "Textes / Passages" : "Éléments mixtes",
        });
      } else if (parsed && typeof parsed === "object") {
        const qCount = Array.isArray(parsed.questions) ? parsed.questions.length : 0;
        const tCount = Array.isArray(parsed.texts) ? parsed.texts.length : 0;
        setPreviewInfo({
          count: qCount + tCount || 1,
          type: "Objet conteneur",
        });
      }
    } catch (e: any) {
      setPreviewInfo(null);
      setParseError("JSON invalide : " + e.message);
    }
  }

  // Gestion du fichier uploadé
  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      handleTextChange(content);
    };
    reader.readAsText(file);
  }

  // Exemple type de JSON pour faciliter la vie de l'utilisateur
  function loadExample(type: "questions" | "texts") {
    if (type === "questions") {
      const exampleQuestions = [
        {
          subject: "MATH",
          topic: "Algèbre",
          subtopic: "Équations",
          difficulty: "EASY",
          statement: "Quelle est la solution de l'équation 2x + 4 = 10 ?",
          options: ["x = 2", "x = 3", "x = 4", "x = 5"],
          answerIndex: 1,
          explanation: "2x = 10 - 4 = 6 => x = 3.",
        },
        {
          subject: "GENERAL_CULTURE",
          topic: "Histoire RDC",
          difficulty: "MEDIUM",
          scope: "DRC",
          statement: "En quelle année la RDC a-t-elle accédé à l'indépendance ?",
          options: ["1958", "1960", "1965", "1971"],
          answerIndex: 1,
          explanation: "L'indépendance a été proclamée le 30 juin 1960.",
        },
      ];
      handleTextChange(JSON.stringify(exampleQuestions, null, 2));
    } else {
      const exampleTexts = [
        {
          title: "Extrait : L'arbre à palabres",
          language: "FR",
          source: "Littérature africaine",
          content: "Sous le grand baobab au centre du village, les anciens se réunissaient chaque soir pour écouter et arbitrer les différends...",
          questions: [
            {
              statement: "Où se réunissaient les anciens du village ?",
              options: ["Au bord du fleuve", "Sous le baobab", "Dans la case du chef", "Sur la colline"],
              answerIndex: 1,
              difficulty: "EASY",
              explanation: "Le texte précise explicitement 'Sous le grand baobab au centre du village'.",
            },
          ],
        },
      ];
      handleTextChange(JSON.stringify(exampleTexts, null, 2));
    }
  }

  // Soumission de l'import
  function handleImport() {
    if (!jsonText.trim()) return;

    try {
      const parsed = JSON.parse(jsonText);
      startTransition(async () => {
        const res = await importContentBundleAction(parsed);
        setResult(res);
      });
    } catch (e: any) {
      setParseError("JSON invalide : " + e.message);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header & Quick actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0 }}>Importateur universel JSON</h3>
          <p style={{ margin: "2px 0 0", fontSize: "0.8125rem", color: "var(--text-muted)" }}>
            Uploadez un fichier <code style={{ color: "var(--accent)" }}>.json</code> ou collez directement votre tableau de questions/textes.
          </p>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={() => loadExample("questions")}
            className="btn btn-ghost"
            style={{ fontSize: "0.75rem", padding: "6px 10px" }}
          >
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            Exemple Questions
          </button>
          <button
            type="button"
            onClick={() => loadExample("texts")}
            className="btn btn-ghost"
            style={{ fontSize: "0.75rem", padding: "6px 10px" }}
          >
            <FileText className="w-3.5 h-3.5 mr-1" />
            Exemple Texte + QCM
          </button>
        </div>
      </div>

      {/* Upload Zone */}
      <div
        style={{
          border: "2px dashed var(--border)",
          borderRadius: 16,
          padding: 20,
          textAlign: "center",
          background: "var(--bg-muted)",
          cursor: "pointer",
          position: "relative",
        }}
      >
        <input
          type="file"
          accept=".json,application/json"
          onChange={handleFileUpload}
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0,
            cursor: "pointer",
            width: "100%",
            height: "100%",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(99, 102, 241, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)" }}>
            <Upload className="w-5 h-5" />
          </div>
          <div style={{ fontSize: "0.875rem", fontWeight: 600 }}>
            {fileName ? `Fichier chargé : ${fileName}` : "Cliquez ou glissez un fichier .json ici"}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Prend en charge maths.json, francais.json, anglais.json, culture-generale.json...
          </div>
        </div>
      </div>

      {/* Paste Textarea */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, alignItems: "center" }}>
          <label style={{ fontWeight: 600, fontSize: "0.875rem", display: "flex", alignItems: "center", gap: 6 }}>
            <FileCode className="w-4 h-4 text-indigo-500" />
            Ou collez votre code JSON ci-dessous :
          </label>
          {previewInfo && (
            <span style={{ fontSize: "0.75rem", color: "var(--success)", fontWeight: 600, background: "rgba(34,197,94,0.1)", padding: "2px 8px", borderRadius: 10 }}>
              ✓ Détecté : {previewInfo.count} {previewInfo.type}
            </span>
          )}
        </div>

        <textarea
          rows={10}
          value={jsonText}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder={`[\n  {\n    "subject": "MATH",\n    "topic": "Analyse",\n    "difficulty": "EASY",\n    "statement": "2 + 2 = ?",\n    "options": ["3", "4", "5", "6"],\n    "answerIndex": 1,\n    "explanation": "2 + 2 font 4."\n  }\n]`}
          className="input"
          style={{
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "0.8125rem",
            lineHeight: 1.5,
            resize: "vertical",
            background: "var(--bg-card)",
          }}
        />

        {parseError && (
          <div style={{ color: "var(--error)", fontSize: "0.8125rem", marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
            <AlertCircle className="w-4 h-4 shrink-0" />
            {parseError}
          </div>
        )}
      </div>

      {/* Result feedback */}
      {result && (
        <div
          style={{
            padding: 16,
            borderRadius: 14,
            background: result.createdQuestions > 0 || result.createdTexts > 0 ? "rgba(34, 197, 94, 0.08)" : "rgba(239, 68, 68, 0.08)",
            border: `1px solid ${result.createdQuestions > 0 || result.createdTexts > 0 ? "rgba(34, 197, 94, 0.25)" : "rgba(239, 68, 68, 0.25)"}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: "0.95rem", color: result.createdQuestions > 0 || result.createdTexts > 0 ? "var(--success)" : "var(--error)" }}>
            {result.createdQuestions > 0 || result.createdTexts > 0 ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            Rapport d'importation :
          </div>

          <div style={{ margin: "8px 0", fontSize: "0.875rem", display: "flex", gap: 16, flexWrap: "wrap" }}>
            <span><strong>{result.createdQuestions}</strong> question(s) enregistrée(s)</span>
            <span><strong>{result.createdTexts}</strong> texte(s) enregistré(s)</span>
            {result.errors.length > 0 && <span style={{ color: "var(--error)" }}><strong>{result.errors.length}</strong> erreur(s)</span>}
          </div>

          {result.errors.length > 0 && (
            <div style={{ marginTop: 8, maxHeight: 150, overflowY: "auto", fontSize: "0.75rem", color: "var(--text-secondary)", background: "var(--bg-muted)", padding: 8, borderRadius: 8 }}>
              {result.errors.map((err, idx) => (
                <div key={idx} style={{ color: "var(--error)", marginBottom: 2 }}>• {err}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Import Button */}
      <button
        type="button"
        onClick={handleImport}
        disabled={isPending || !jsonText.trim() || !!parseError}
        className="btn btn-primary"
        style={{ padding: 14, fontSize: "0.95rem", fontWeight: 700 }}
      >
        {isPending ? "Importation en cours..." : "Lancer l'importation en base de données"}
      </button>
    </div>
  );
}
