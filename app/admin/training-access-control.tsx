"use client";

import { useState, useTransition } from "react";
import { updateTrainingAccessAction } from "@/lib/actions/system";
import {
  TrainingAccessConfig,
  DEFAULT_TRAINING_LOCK_PRESETS,
} from "@/lib/system-config";
import {
  ShieldAlert,
  ShieldCheck,
  Power,
  Sparkles,
  AlertTriangle,
  Wrench,
  Layers,
  Save,
  Loader2,
  CheckCircle2,
  Lock,
  Unlock,
} from "lucide-react";

export function TrainingAccessControl({
  initialConfig,
}: {
  initialConfig: TrainingAccessConfig;
}) {
  const [isPending, startTransition] = useTransition();
  const [enabled, setEnabled] = useState(initialConfig.enabled);
  const [message, setMessage] = useState(initialConfig.message);
  const [selectedPresetId, setSelectedPresetId] = useState<string>(
    initialConfig.reason || "CUSTOM"
  );
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function handlePresetSelect(presetId: string) {
    setSelectedPresetId(presetId);
    const found = DEFAULT_TRAINING_LOCK_PRESETS.find((p) => p.id === presetId);
    if (found) {
      setMessage(found.message);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);

    startTransition(async () => {
      const res = await updateTrainingAccessAction(enabled, message, selectedPresetId);
      if (res?.ok) {
        setFeedback({
          type: "success",
          text: enabled
            ? "Accès aux entraînements déverrouillé avec succès pour tous les candidats !"
            : "Création d'entraînements bloquée avec succès. Le message est maintenant diffusé aux candidats.",
        });
        setTimeout(() => setFeedback(null), 5000);
      } else {
        setFeedback({ type: "error", text: "Erreur lors de la mise à jour du paramètre." });
      }
    });
  }

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
      {/* Header avec état du switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div
              className={`p-2 rounded-2xl ${
                enabled
                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                  : "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"
              }`}
            >
              {enabled ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Contrôle d'accès aux Entraînements libres
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Verrouillez temporairement la création d'entraînements individuels pour les candidats.
              </p>
            </div>
          </div>
        </div>

        {/* Bouton bascule principal */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full border ${
              enabled
                ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/20"
                : "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/20 animate-pulse"
            }`}
          >
            {enabled ? "Autorisé (Actif)" : "Bloqué (Suspendu)"}
          </span>

          <button
            type="button"
            onClick={() => setEnabled((prev) => !prev)}
            className={`relative inline-flex h-7 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              enabled ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-700"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                enabled ? "translate-x-7" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Presets de motifs suggérés */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Motif / Modèle de message rapide :
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {DEFAULT_TRAINING_LOCK_PRESETS.map((preset) => {
              const isSelected = selectedPresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handlePresetSelect(preset.id)}
                  className={`p-3 rounded-2xl text-left border transition-all text-xs flex flex-col justify-between gap-1.5 ${
                    isSelected
                      ? "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-600 text-indigo-900 dark:text-indigo-200 shadow-sm"
                      : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span>{preset.title}</span>
                    {preset.id === "SIMULATION_LIVE" ? (
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    ) : (
                      <Wrench className="w-3.5 h-3.5 text-amber-500" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                    {preset.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Message d'information diffusé au candidat */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Message d'explication affiché aux candidats lors du blocage :
            </label>
            <span className="text-[11px] text-slate-400">Personnalisable</span>
          </div>
          <textarea
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              setSelectedPresetId("CUSTOM");
            }}
            rows={3}
            required={!enabled}
            placeholder="Écrivez le message strict ou informatif à destination des candidats..."
            className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 leading-relaxed"
          />
        </div>

        {feedback && (
          <div
            className={`p-3 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
              feedback.type === "success"
                ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20"
                : "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-500/20"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all disabled:opacity-50 active:scale-95"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Enregistrement...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Appliquer les paramètres d'accès</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
