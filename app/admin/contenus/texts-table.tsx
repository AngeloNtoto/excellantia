"use client";

import { useState, useTransition } from "react";
import { deleteTextContentAction, createQuestionAction, importQuestionsForTextAction } from "@/lib/actions/content";
import {
  Trash2,
  BookOpen,
  PlusCircle,
  FileCode,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Layers,
} from "lucide-react";

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
  const [readingId, setReadingId] = useState<string | null>(null);
  const [addingQuestionForId, setAddingQuestionForId] = useState<string | null>(null);
  const [questionMode, setQuestionMode] = useState<"form" | "json">("form");
  const [jsonText, setJsonText] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  function handleDelete(id: string, title: string) {
    if (!confirm(`Supprimer le texte "${title}" ? Les questions associées deviendront autonomes.`)) return;
    startTransition(async () => {
      await deleteTextContentAction(id);
    });
  }

  // Ajout unitaire via formulaire
  function handleCreateQuestionForText(e: React.FormEvent<HTMLFormElement>, textId: string, language: string) {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("textContentId", textId);
    formData.set("subject", language === "EN" ? "ENGLISH" : "FRENCH");
    formData.set("type", "PASSAGE_BASED");

    startTransition(async () => {
      const res = await createQuestionAction(formData);
      if (res?.error) {
        setFormError(res.error);
        return;
      }

      setFormSuccess("Question liée au texte ajoutée avec succès !");
      form.reset();
    });
  }

  // Import JSON en lot pour ce texte
  function handleImportJsonForText(textId: string) {
    if (!jsonText.trim()) return;
    setFormError("");
    setFormSuccess("");

    try {
      const parsed = JSON.parse(jsonText);
      startTransition(async () => {
        const res = await importQuestionsForTextAction(textId, parsed);
        if (!res.ok && res.errors.length > 0) {
          setFormError(res.errors.join(" | "));
        } else {
          setFormSuccess(`${res.createdQuestions} question(s) liée(s) avec succès à ce texte !`);
          setJsonText("");
        }
      });
    } catch (e: any) {
      setFormError("JSON invalide : " + e.message);
    }
  }

  function loadJsonExample() {
    const example = [
      {
        difficulty: "MEDIUM",
        statement: "D'après l'auteur, quel est le thème central abordé dans le texte ?",
        options: [
          "L'évolution technologique",
          "La préservation des traditions",
          "Les relations interpersonnelles",
          "Le développement économique"
        ],
        answerIndex: 1,
        explanation: "Le texte insiste particulièrement sur les valeurs et coutumes ancestrales."
      },
      {
        difficulty: "EASY",
        statement: "Quelle conclusion peut-on tirer du dernier paragraphe ?",
        options: [
          "Le problème est résolu",
          "La situation reste incertaine",
          "Une nouvelle réunion est prévue",
          "Les participants sont en désaccord"
        ],
        answerIndex: 2,
        explanation: "La dernière phrase mentionne explicitement le rendez-vous du lendemain."
      }
    ];
    setJsonText(JSON.stringify(example, null, 2));
  }

  if (texts.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-3xl text-xs sm:text-sm">
        Aucun texte de lecture enregistré en base pour le moment.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {texts.map((text) => {
        const isReading = readingId === text.id;
        const isAddingQ = addingQuestionForId === text.id;

        return (
          <div
            key={text.id}
            className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 transition-all"
          >
            {/* Header du texte */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      text.language === "FR"
                        ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20"
                        : "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
                    }`}
                  >
                    {text.language}
                  </span>
                  <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                    {text.title}
                  </h4>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                    {text._count.questions} question{text._count.questions > 1 ? "s" : ""} liée{text._count.questions > 1 ? "s" : ""}
                  </span>
                </div>
                {text.source && (
                  <p className="text-xs text-slate-400">
                    Source : {text.source}
                  </p>
                )}
              </div>

              {/* Actions rapides */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setReadingId(isReading ? null : text.id)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{isReading ? "Masquer" : "Lire"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAddingQuestionForId(isAddingQ ? null : text.id);
                    setFormError("");
                    setFormSuccess("");
                  }}
                  className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-indigo-200/60 dark:border-indigo-500/20 transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>{isAddingQ ? "Fermer" : "+ Ajouter questions"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(text.id, text.title)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                  title="Supprimer ce texte"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Extrait / Lecture complète */}
            {isReading && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/40 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-serif whitespace-pre-line animate-in fade-in duration-200">
                {text.content}
              </div>
            )}

            {/* Module d'ajout de questions (Formulaire ou Collage JSON) */}
            {isAddingQ && (
              <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-500/30 space-y-4 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-200/60 dark:border-indigo-500/20 pb-3">
                  <div>
                    <h5 className="text-xs sm:text-sm font-extrabold text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-indigo-500" />
                      Ajout de questions pour : "{text.title}"
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Matière attribuée automatiquement : <strong>{text.language === "EN" ? "Anglais" : "Français"}</strong>
                    </p>
                  </div>

                  {/* Basculeur Mode Formulaire vs Mode Collage JSON */}
                  <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-indigo-200/80 dark:border-indigo-500/30">
                    <button
                      type="button"
                      onClick={() => setQuestionMode("form")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        questionMode === "form"
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "text-slate-600 dark:text-slate-400 hover:text-indigo-600"
                      }`}
                    >
                      Formulaire
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuestionMode("json")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                        questionMode === "json"
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "text-slate-600 dark:text-slate-400 hover:text-indigo-600"
                      }`}
                    >
                      <FileCode className="w-3 h-3" />
                      <span>Collage JSON</span>
                    </button>
                  </div>
                </div>

                {formError && (
                  <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold">
                    {formError}
                  </div>
                )}

                {formSuccess && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                    {formSuccess}
                  </div>
                )}

                {/* ─── OPTION 1 : FORMULAIRE UNITAIRE ─── */}
                {questionMode === "form" ? (
                  <form
                    onSubmit={(e) => handleCreateQuestionForText(e, text.id, text.language)}
                    className="space-y-3 text-xs sm:text-sm"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-900 dark:text-white block">Difficulté *</label>
                        <select
                          name="difficulty"
                          defaultValue="MEDIUM"
                          required
                          className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                        >
                          <option value="EASY">Facile</option>
                          <option value="MEDIUM">Moyenne</option>
                          <option value="HARD">Difficile</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-900 dark:text-white block">Notion / Chapitre</label>
                        <input
                          name="topic"
                          type="text"
                          placeholder="Ex: Compréhension, Vocabulaire, Déduction..."
                          className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-900 dark:text-white block">Énoncé de la question *</label>
                      <textarea
                        name="statement"
                        rows={2}
                        placeholder="Selon le texte, que signifie..."
                        required
                        className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>

                    {/* 4 Options */}
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-900 dark:text-white block">
                        Options de réponse (4 choix) *
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          name="option1"
                          type="text"
                          placeholder="Option 1 (Index 0)"
                          required
                          className="w-full p-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                        />
                        <input
                          name="option2"
                          type="text"
                          placeholder="Option 2 (Index 1)"
                          required
                          className="w-full p-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                        />
                        <input
                          name="option3"
                          type="text"
                          placeholder="Option 3 (Index 2)"
                          required
                          className="w-full p-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                        />
                        <input
                          name="option4"
                          type="text"
                          placeholder="Option 4 (Index 3)"
                          required
                          className="w-full p-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    {/* Bonne réponse & Explication */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-900 dark:text-white block">Bonne réponse *</label>
                        <select
                          name="answerIndex"
                          defaultValue="0"
                          required
                          className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                        >
                          <option value="0">Option 1</option>
                          <option value="1">Option 2</option>
                          <option value="2">Option 3</option>
                          <option value="3">Option 4</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2 space-y-1">
                        <label className="font-bold text-slate-900 dark:text-white block">
                          Explication pédagogique <span className="text-slate-400 font-normal">(Optionnel)</span>
                        </label>
                        <input
                          name="explanation"
                          type="text"
                          placeholder="Justification tirée du passage..."
                          className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setAddingQuestionForId(null)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        disabled={isPending}
                        className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all active:scale-95 flex items-center gap-1.5"
                      >
                        {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PlusCircle className="w-3.5 h-3.5" />}
                        <span>Enregistrer la question</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  /* ─── OPTION 2 : COLLAGE JSON EN LOT ─── */
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <FileCode className="w-4 h-4 text-indigo-500" />
                        Collez un tableau de questions JSON :
                      </label>
                      <button
                        type="button"
                        onClick={loadJsonExample}
                        className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Charger un exemple JSON</span>
                      </button>
                    </div>

                    <textarea
                      rows={8}
                      value={jsonText}
                      onChange={(e) => setJsonText(e.target.value)}
                      placeholder={`[\n  {\n    "difficulty": "MEDIUM",\n    "statement": "Quelle est l'idée principale du texte ?",\n    "options": ["A", "B", "C", "D"],\n    "answerIndex": 0,\n    "explanation": "Explication facultative..."\n  }\n]`}
                      className="w-full p-3 text-xs font-mono rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-y"
                    />

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setAddingQuestionForId(null)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        Annuler
                      </button>
                      <button
                        type="button"
                        onClick={() => handleImportJsonForText(text.id)}
                        disabled={isPending || !jsonText.trim()}
                        className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all active:scale-95 flex items-center gap-1.5"
                      >
                        {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PlusCircle className="w-3.5 h-3.5" />}
                        <span>Importer les questions JSON pour ce texte</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
