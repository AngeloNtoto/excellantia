"use client";

import { useState, useTransition } from "react";
import { importContentBundleAction } from "@/lib/actions/content";
import { Upload, FileCode, CheckCircle2, AlertCircle, Sparkles, FileText, Loader2, Info } from "lucide-react";

export function ImportJsonForm() {
  const [isPending, startTransition] = useTransition();
  const [jsonText, setJsonText] = useState("");
  const [importMode, setImportMode] = useState<"SIMULATION" | "TRAINING">("TRAINING");
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

  // Exemple type de JSON pour faciliter la vie de l'administrateur
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
          // optionExplanations est 100% optionnel
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
          optionExplanations: [
            "1958 : Congrès d'Accra",
            "1960 : Proclamation officielle à Léopoldville (Kinshasa)",
            "1965 : Prise de pouvoir de Mobutu",
            "1971 : Changement de nom en Zaïre",
          ],
        },
      ];
      handleTextChange(JSON.stringify(exampleQuestions, null, 2));
    } else {
      const exampleTexts = [
        {
          title: "Extrait : L'arbre à palabres",
          language: "FR",
          mode: "UNIVERSAL", // "UNIVERSAL" (ou omit), "TRAINING", "SIMULATION"
          source: "Littérature africaine",
          content: "Sous le grand baobab au centre du village, les anciens se réunissaient chaque soir pour écouter et arbitrer les différends...",
          questions: [
            {
              statement: "Où se réunissaient les anciens du village ?",
              options: ["Au bord du fleuve", "Sous le baobab", "Dans la case du chef", "Sur la colline"],
              answerIndex: 1,
              difficulty: "EASY",
              mode: "TRAINING", // Question réservée aux entraînements
              explanation: "Le texte précise explicitement 'Sous le grand baobab au centre du village'.",
            },
            {
              statement: "Quelle était la fonction principale de cette assemblée du soir ?",
              options: ["Célébrer les récoltes", "Arbitrer les différends", "Enseigner la chasse", "Organiser la guerre"],
              answerIndex: 1,
              difficulty: "MEDIUM",
              mode: "SIMULATION", // Question réservée aux simulations d'examen
              explanation: "Le texte mentionne 'écouter et arbitrer les différends'.",
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
        const res = await importContentBundleAction(parsed, importMode);
        setResult(res);
      });
    } catch (e: any) {
      setParseError("JSON invalide : " + e.message);
    }
  }

  return (
    <div className="space-y-5">
      {/* En-tête & Boutons d'exemples */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            Importateur universel JSON
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Uploadez un fichier <code className="text-indigo-600 dark:text-indigo-400 font-mono">.json</code> ou collez votre structure directement.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => loadExample("questions")}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-200/60 dark:border-indigo-500/20 transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Exemple QCM</span>
          </button>
          <button
            type="button"
            onClick={() => loadExample("texts")}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-500/10 hover:bg-purple-100 dark:hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 text-xs font-semibold border border-purple-200/60 dark:border-purple-500/20 transition-all active:scale-95"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Exemple Texte + QCM</span>
          </button>
        </div>
      </div>

      {/* Note d'information format */}
      <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300">
        <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-900 dark:text-white">Note sur les explications :</span> Les champs <code className="font-mono text-indigo-600 dark:text-indigo-400">explanation</code> et <code className="font-mono text-indigo-600 dark:text-indigo-400">optionExplanations</code> (explication pour chaque option) sont <strong className="underline">optionnels</strong>.
        </div>
      </div>

      {/* Zone de Drag & Drop */}
      <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-2xl p-5 text-center bg-slate-50/50 dark:bg-slate-800/20 transition-all cursor-pointer group">
        <input
          type="file"
          accept=".json,application/json"
          onChange={handleFileUpload}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
            <Upload className="w-5 h-5" />
          </div>
          <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
            {fileName ? `Fichier chargé : ${fileName}` : "Cliquez ou glissez un fichier .json ici"}
          </div>
          <div className="text-[11px] text-slate-400">
            Compatible avec mathématiques, français, anglais, culture générale et textes
          </div>
        </div>
      </div>

      {/* Le mode choisi s'applique à toutes les questions du fichier importé. */}
      <div className="space-y-1.5">
        <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
          Destination des questions
        </span>
        <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setImportMode("SIMULATION")}
            aria-pressed={importMode === "SIMULATION"}
            className={`rounded-xl px-3 py-2 text-xs sm:text-sm font-bold transition-all ${
              importMode === "SIMULATION"
                ? "bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
          >
            Simulation / salon
          </button>
          <button
            type="button"
            onClick={() => setImportMode("TRAINING")}
            aria-pressed={importMode === "TRAINING"}
            className={`rounded-xl px-3 py-2 text-xs sm:text-sm font-bold transition-all ${
              importMode === "TRAINING"
                ? "bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
          >
            Entraînement
          </button>
        </div>
      </div>

      {/* Zone de Texte JSON avec placeholder explicatif */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <FileCode className="w-4 h-4 text-indigo-500" />
            Ou collez votre code JSON :
          </label>
          {previewInfo && (
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              ✓ {previewInfo.count} {previewInfo.type}
            </span>
          )}
        </div>

        <textarea
          rows={9}
          value={jsonText}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder={`[
  {
    "subject": "MATH",
    "topic": "Analyse",
    "difficulty": "EASY",
    "mode": "TRAINING", // ou "SIMULATION" (optionnel, hérite du bouton par défaut)
    "statement": "Quelle est la dérivée de f(x) = x² ?",
    "options": ["2x", "x", "x²", "2"],
    "answerIndex": 0,
    "explanation": "(x²)' = 2x (Optionnel)",
    "optionExplanations": [
      "2x est la dérivée correcte",
      "x est incorrect",
      "x² est la fonction initiale",
      "2 est une constante"
    ]
  }
]`}
          className="w-full p-3 text-xs sm:text-sm font-mono rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-y"
        />

        {parseError && (
          <div className="flex items-center gap-1.5 text-xs text-red-500 font-semibold p-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{parseError}</span>
          </div>
        )}
      </div>

      {/* Bouton d'action */}
      <button
        type="button"
        onClick={handleImport}
        disabled={isPending || !jsonText.trim() || !!parseError}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/20 transition-all active:scale-[0.99]"
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Traitement et validation de la base...</span>
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            <span>Importer les contenus dans la banque</span>
          </>
        )}
      </button>

      {/* Rapport d'importation */}
      {result && (
        <div
          className={`p-4 rounded-2xl border text-xs sm:text-sm space-y-2 ${
            result.errors.length > 0
              ? "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-300"
              : "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300"
          }`}
        >
          <div className="flex items-center gap-2 font-bold">
            {result.errors.length > 0 ? (
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            )}
            <span>
              {result.createdQuestions} question{result.createdQuestions > 1 ? "s" : ""} et {result.createdTexts} texte{result.createdTexts > 1 ? "s" : ""} importé{result.createdQuestions + result.createdTexts > 1 ? "s" : ""} avec succès !
            </span>
          </div>

          {result.errors.length > 0 && (
            <ul className="list-disc list-inside space-y-1 text-xs text-red-600 dark:text-red-400">
              {result.errors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
