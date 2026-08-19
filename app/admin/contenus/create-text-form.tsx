"use client";

import { useState, useTransition } from "react";
import { createTextContentAction } from "@/lib/actions/content";
import { FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export function CreateTextContentForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const form = e.currentTarget;
    const formData = new FormData(form);
    startTransition(async () => {
      const res = await createTextContentAction(formData);
      if (res?.error) {
        setError(res.error);
        return;
      }

      setSuccess("Texte de lecture enregistré avec succès !");
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

      {/* Titre */}
      <div className="space-y-1">
        <label className="font-bold text-slate-900 dark:text-white block">Titre du texte *</label>
        <input
          name="title"
          type="text"
          placeholder="Ex: L'impact de l'intelligence artificielle sur l'éducation"
          required
          className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>

      {/* Langue & Source (1 col mobile -> 2 cols tablette/desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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

        <div className="space-y-1">
          <label className="font-bold text-slate-900 dark:text-white block">Source ou Auteur <span className="text-slate-400 font-normal">(Optionnel)</span></label>
          <input
            name="source"
            type="text"
            placeholder="Ex: Extrait d'examen d'État, Le Monde..."
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      {/* Contenu */}
      <div className="space-y-1">
        <label className="font-bold text-slate-900 dark:text-white block">Corps du texte *</label>
        <textarea
          name="content"
          rows={7}
          placeholder="Collez ou rédigez le passage de compréhension ici..."
          required
          className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-y leading-relaxed"
        />
      </div>

      {/* Statut actif */}
      <label className="flex items-center gap-2 cursor-pointer select-none py-1">
        <input
          name="isActive"
          type="checkbox"
          defaultChecked
          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600"
        />
        <span className="font-medium text-slate-700 dark:text-slate-300">Activer immédiatement pour l'association de questions</span>
      </label>

      {/* Bouton de soumission */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all active:scale-[0.99]"
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Enregistrement...</span>
          </>
        ) : (
          <>
            <FileText className="w-4 h-4" />
            <span>Ajouter le texte à la banque</span>
          </>
        )}
      </button>
    </form>
  );
}
