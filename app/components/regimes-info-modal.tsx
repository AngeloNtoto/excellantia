"use client";

import { useState } from "react";
import { TIMING_REGIMES, CHRONO_MODES, TimingRegime, ChronoMode } from "@/lib/types";
import {
  Infinity,
  Layers,
  Zap,
  Eye,
  X,
  Timer,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  HelpCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function RegimesInfoModal({
  isOpen,
  onClose,
  initialRegime = "EINSTEIN",
}: {
  isOpen: boolean;
  onClose: () => void;
  initialRegime?: TimingRegime;
}) {
  const [activeTab, setActiveTab] = useState<TimingRegime | ChronoMode>(initialRegime);

  if (!isOpen) return null;

  const regimesList: TimingRegime[] = ["EINSTEIN", "NEWTON", "TESLA"];
  const chronoModesList: ChronoMode[] = ["GALILEE", "HEISENBERG", "SCHRODINGER"];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-md transition-all"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── EN-TÊTE MODAL ─── */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Timer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                Régimes Temporels &amp; Chronomètres
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                Guide des dynamiques d'épreuve et de gestion du temps
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ─── CORPS DU MODAL (SCROLLABLE) ─── */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-xs sm:text-sm">
          {/* SÉLECTEUR DE TABS */}
          <div className="space-y-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                1. Régimes Temporels (Découpage de l'épreuve)
              </span>
              <div className="grid grid-cols-3 gap-2 mt-1.5">
                {regimesList.map((r) => {
                  const cfg = TIMING_REGIMES[r];
                  const isSelected = activeTab === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setActiveTab(r)}
                      className={`p-2.5 sm:p-3 rounded-2xl border text-center font-bold transition-all active:scale-95 flex flex-col items-center gap-1 ${
                        isSelected
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20"
                          : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <span className="text-xs sm:text-sm">{cfg.badge}</span>
                      <span className={`text-[10px] font-medium truncate max-w-full ${isSelected ? "text-indigo-100" : "text-slate-400"}`}>
                        {r === "EINSTEIN" ? "Libre" : r === "NEWTON" ? "Paliers" : "Sprint"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                2. Modes d'Affichage du Chrono (Visibilité du cadran)
              </span>
              <div className="grid grid-cols-3 gap-2 mt-1.5">
                {chronoModesList.map((m) => {
                  const cfg = CHRONO_MODES[m];
                  const isSelected = activeTab === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setActiveTab(m)}
                      className={`p-2.5 sm:p-3 rounded-2xl border text-center font-bold transition-all active:scale-95 flex flex-col items-center gap-1 ${
                        isSelected
                          ? "bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/20"
                          : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <span className="text-xs sm:text-sm">{cfg.badge}</span>
                      <span className={`text-[10px] font-medium truncate max-w-full ${isSelected ? "text-purple-100" : "text-slate-400"}`}>
                        {m === "GALILEE" ? "Continu" : m === "HEISENBERG" ? "Incertitude" : "Quantique"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* FICHE DÉTAILLÉE DE L'OPTION ACTIVE */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-4">
            {/* Si c'est un régime temporel */}
            {regimesList.includes(activeTab as TimingRegime) && (() => {
              const r = activeTab as TimingRegime;
              const cfg = TIMING_REGIMES[r];
              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{cfg.name}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                        {cfg.subtitle}
                      </span>
                    </h3>
                  </div>

                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {cfg.description}
                  </p>

                  <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/40">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">Règles fondamentales :</span>
                    <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                      {cfg.rules.map((rule, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <ChevronRight className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })()}

            {/* Si c'est un mode d'affichage de chrono */}
            {chronoModesList.includes(activeTab as ChronoMode) && (() => {
              const m = activeTab as ChronoMode;
              const cfg = CHRONO_MODES[m];
              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{cfg.name}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20">
                        {cfg.subtitle}
                      </span>
                    </h3>
                  </div>

                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {cfg.description}
                  </p>

                  <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/40">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">Fonctionnement du cadran :</span>
                    <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                      {cfg.rules.map((rule, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <ChevronRight className="w-3.5 h-3.5 text-purple-500 shrink-0 mt-0.5" />
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* ─── PIED DE MODAL ─── */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold transition-all active:scale-95"
          >
            Fermer le guide
          </button>
        </div>
      </div>
    </div>
  );
}
