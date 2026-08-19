"use client";

import { useState, useTransition } from "react";
import { addCandidateAction } from "@/lib/actions/candidates";
import { UserPlus, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export function AddCandidateForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const fd = new FormData(e.currentTarget);
    const code = fd.get("code") as string;

    if (code.length !== 14 || !/^\d+$/.test(code)) {
      setError("Le code doit contenir exactement 14 chiffres.");
      return;
    }

    startTransition(async () => {
      const res = await addCandidateAction(fd);
      if (res?.error) {
        setError(res.error);
      } else {
        setSuccess(true);
        (e.target as HTMLFormElement).reset();
      }
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
          <span>Candidat inscrit avec succès !</span>
        </div>
      )}

      <div className="space-y-1">
        <label className="font-bold text-slate-900 dark:text-white block">Nom complet *</label>
        <input
          type="text"
          name="fullname"
          placeholder="Ex: KABONGO Jean Pierre"
          required
          className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>

      <div className="space-y-1">
        <label className="font-bold text-slate-900 dark:text-white block">Code d'accès unique (14 chiffres) *</label>
        <input
          type="text"
          name="code"
          placeholder="Ex: 25072006123456"
          minLength={14}
          maxLength={14}
          required
          className="w-full p-2.5 rounded-xl font-mono bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>

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
            <UserPlus className="w-4 h-4" />
            <span>Ajouter le candidat</span>
          </>
        )}
      </button>
    </form>
  );
}
