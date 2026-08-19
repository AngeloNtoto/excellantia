"use client";

import { useState, useTransition } from "react";
import { createQuestionAction } from "@/lib/actions/content";
import { PlusCircle, Loader2, CheckCircle2, AlertCircle, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";

type TextSummary = {
  id: string;
  title: string;
  language: string;
};

export function CreateQuestionForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const form = e.currentTarget;
    const formData = new FormData(form);
    startTransition(async () => {
      const res = await createQuestionAction(formData);
      if (res?.error) {
        setError(res.error);
        return;
      }

      setSuccess("Question ajoutée avec succès à la base pédagogique !");
      form.reset();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Matière & Difficulté (Responsive 1 col mobile -> 2 cols tablette/desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-1">
          <label className="font-bold text-slate-900 dark:text-white block">Matière *</label>
          <select
            name="subject"
            defaultValue="MATH"
            required
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="MATH">Mathématiques</option>
            <option value="FRENCH">Français</option>
            <option value="ENGLISH">Anglais</option>
            <option value="GENERAL_CULTURE">Culture Générale</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="font-bold text-slate-900 dark:text-white block">Difficulté *</label>
          <select
            name="difficulty"
            defaultValue="MEDIUM"
            required
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="EASY">Facile</option>
            <option value="MEDIUM">Moyenne</option>
            <option value="HARD">Difficile</option>
          </select>
        </div>
      </div>

      {/* Chapitre & Notion */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-1">
          <label className="font-bold text-slate-900 dark:text-white block">Thème / Chapitre</label>
          <input
            name="topic"
            type="text"
            placeholder="Ex: Analyse, Histoire RDC, Géométrie..."
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="space-y-1">
          <label className="font-bold text-slate-900 dark:text-white block">Sous-branche / Notion</label>
          <input
            name="subtopic"
            type="text"
            placeholder="Ex: Dérivées, Équations..."
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      {/* Énoncé */}
      <div className="space-y-1">
        <label className="font-bold text-slate-900 dark:text-white block">Énoncé de la question *</label>
        <textarea
          name="statement"
          rows={3}
          placeholder="Saisissez l'énoncé complet du problème ou de la question..."
          required
          className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-y"
        />
      </div>

      {/* 4 Options de réponse (Adaptées Mobile) */}
      <div className="space-y-2">
        <label className="font-bold text-slate-900 dark:text-white block">
          Options de réponse (4 choix) *
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold">Option 1 (Index 0)</span>
            <input
              name="option1"
              type="text"
              placeholder="Première option"
              required
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold">Option 2 (Index 1)</span>
            <input
              name="option2"
              type="text"
              placeholder="Deuxième option"
              required
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold">Option 3 (Index 2)</span>
            <input
              name="option3"
              type="text"
              placeholder="Troisième option"
              required
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold">Option 4 (Index 3)</span>
            <input
              name="option4"
              type="text"
              placeholder="Quatrième option"
              required
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>
      </div>

      {/* Bonne réponse & Langue */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-1">
          <label className="font-bold text-slate-900 dark:text-white block">Bonne réponse *</label>
          <select
            name="answerIndex"
            defaultValue="0"
            required
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold"
          >
            <option value="0">Option 1</option>
            <option value="1">Option 2</option>
            <option value="2">Option 3</option>
            <option value="3">Option 4</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="font-bold text-slate-900 dark:text-white block">Langue</label>
          <select
            name="language"
            defaultValue="FR"
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="FR">Français</option>
            <option value="EN">Anglais</option>
          </select>
        </div>
      </div>

      {/* Explication générale */}
      <div className="space-y-1">
        <label className="font-bold text-slate-900 dark:text-white block">
          Explication pédagogique globale <span className="text-slate-400 font-normal">(Optionnel)</span>
        </label>
        <textarea
          name="explanation"
          rows={2}
          placeholder="Détaillez la démarche de résolution affichée lors de la correction..."
          className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-y"
        />
      </div>

      {/* Accordéon Options Avancées */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline py-1"
        >
          {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          <span>{showAdvanced ? "Masquer les options avancées" : "Options avancées (Scope, Mode, Justifications par option)"}</span>
        </button>

        {showAdvanced && (
          <div className="mt-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">Mode</label>
                <select
                  name="mode"
                  defaultValue=""
                  className="w-full p-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="">Tous les modes</option>
                  <option value="TRAINING">Entraînement seul</option>
                  <option value="SIMULATION">Simulation seule</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">Scope Culture G</label>
                <select
                  name="scope"
                  defaultValue=""
                  className="w-full p-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="">Général</option>
                  <option value="DRC">RDC National</option>
                  <option value="INTERNATIONAL">International</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">Source</label>
                <select
                  name="source"
                  defaultValue="USER_CREATED"
                  className="w-full p-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="USER_CREATED">Admin Manuel</option>
                  <option value="ROOM_GENERATED">Génération auto</option>
                  <option value="TRAINING_POOL">Pool d'entraînement</option>
                </select>
              </div>
            </div>

            {/* Explications par option (Optionnel) */}
            <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/40">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Justifications individuelles par option <span className="text-slate-400 font-normal">(Optionnel)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  name="optionExplanation1"
                  type="text"
                  placeholder="Justification Option 1"
                  className="w-full p-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
                <input
                  name="optionExplanation2"
                  type="text"
                  placeholder="Justification Option 2"
                  className="w-full p-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
                <input
                  name="optionExplanation3"
                  type="text"
                  placeholder="Justification Option 3"
                  className="w-full p-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
                <input
                  name="optionExplanation4"
                  type="text"
                  placeholder="Justification Option 4"
                  className="w-full p-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bouton de soumission */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all active:scale-[0.99]"
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Enregistrement en base...</span>
          </>
        ) : (
          <>
            <PlusCircle className="w-4 h-4" />
            <span>Créer la question</span>
          </>
        )}
      </button>
    </form>
  );
}
