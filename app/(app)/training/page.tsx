"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import { startTrainingAction } from "@/lib/actions/training";
import {
  Calculator, BookA, Globe, BookOpen,
  Target, PlayCircle, Loader2,
  TrendingUp, TrendingDown, Gauge, AlertCircle,
  Plus, Minus, ChevronDown, ChevronUp,
  Clock, CheckCircle2, BookMarked, Timer, PauseCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ── Types ────────────────────────────────────────────────────────────────── */
type SubjectKey = "MATH" | "FRENCH" | "ENGLISH" | "GENERAL_CULTURE";

/* ── Config matières ──────────────────────────────────────────────────────── */
const SUBJECTS = [
  {
    id: "subject_0", key: "MATH" as SubjectKey, name: "Mathématiques", icon: Calculator,
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-50 dark:bg-indigo-500/10",
    activeBg: "bg-indigo-600", activeBorder: "border-indigo-600 dark:border-indigo-500",
    chipColor: "#4f46e5",
  },
  {
    id: "subject_1", key: "FRENCH" as SubjectKey, name: "Français", icon: BookA,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-500/10",
    activeBg: "bg-blue-600", activeBorder: "border-blue-600 dark:border-blue-500",
    chipColor: "#2563eb",
  },
  {
    id: "subject_2", key: "ENGLISH" as SubjectKey, name: "Anglais", icon: Globe,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-500/10",
    activeBg: "bg-amber-600", activeBorder: "border-amber-600 dark:border-amber-500",
    chipColor: "#d97706",
  },
  {
    id: "subject_3", key: "GENERAL_CULTURE" as SubjectKey, name: "Culture Générale", icon: BookOpen,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    activeBg: "bg-emerald-600", activeBorder: "border-emerald-600 dark:border-emerald-500",
    chipColor: "#059669",
  },
];

const DIFFICULTIES = [
  { value: "EASY",  label: "Facile",    desc: "Majorité de questions fondamentales", icon: TrendingDown, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-600" },
  { value: "MIXED", label: "Mixte",     desc: "Mélange équilibré (standard)",       icon: Gauge,        color: "text-indigo-600 dark:text-indigo-400",   bg: "bg-indigo-50 dark:bg-indigo-500/10",   border: "border-indigo-600" },
  { value: "HARD",  label: "Difficile", desc: "Questions complexes et avancées",    icon: TrendingUp,   color: "text-rose-600 dark:text-rose-400",       bg: "bg-rose-50 dark:bg-rose-500/10",       border: "border-rose-600" },
];

const DURATIONS = [30, 45, 60, 90, 120];

/* ── TopicPicker ──────────────────────────────────────────────────────────── */
function TopicPicker({ subjectKey, chipColor, selectedTopics, onChange }: {
  subjectKey: SubjectKey; chipColor: string; selectedTopics: string[]; onChange: (t: string[]) => void;
}) {
  const [topics, setTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch(`/api/topics?subject=${subjectKey}`)
      .then((r) => r.json())
      .then((d) => { setTopics(d.topics ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [subjectKey]);

  const hint = selectedTopics.length === 0
    ? "Tous les chapitres"
    : `${selectedTopics.length} chapitre(s)`;

  if (topics.length === 0 && !loading) return null;

  return (
    <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 w-full text-left"
      >
        <BookMarked className="w-3 h-3 text-slate-400" />
        <span className="text-xs text-slate-500 font-medium">Chapitres :</span>
        <span className="text-xs font-bold" style={{ color: chipColor }}>{hint}</span>
        <span className="ml-auto text-slate-400">
          {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} className="overflow-hidden"
          >
            <div className="pt-2.5 pb-1">
              <div className="flex gap-2 mb-2.5">
                <button type="button" onClick={() => onChange([...topics])}
                  className="text-[11px] px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  Tout sélectionner
                </button>
                <button type="button" onClick={() => onChange([])}
                  className="text-[11px] px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  Réinitialiser
                </button>
              </div>
              {loading ? (
                <p className="text-xs text-slate-400">Chargement des chapitres…</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {topics.map((topic) => {
                    const active = selectedTopics.includes(topic);
                    return (
                      <button
                        key={topic} type="button"
                        onClick={() => onChange(active ? selectedTopics.filter((t) => t !== topic) : [...selectedTopics, topic])}
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-full transition-all"
                        style={{
                          border: `1.5px solid ${active ? chipColor : "transparent"}`,
                          background: active ? chipColor : "rgba(0,0,0,0.05)",
                          color: active ? "#fff" : undefined,
                        }}
                      >
                        {topic}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TrainingPage() {
  const [isPending, startTransition] = useTransition();
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(SUBJECTS.map((s) => s.id));
  const [subjectCounts, setSubjectCounts] = useState<Record<string, number>>({
    subject_0: 10, subject_1: 10, subject_2: 10, subject_3: 10,
  });
  const [difficulty, setDifficulty] = useState("MIXED");
  const [duration, setDuration] = useState(60);
  const [pausableTimer, setPausableTimer] = useState(false);
  const [error, setError] = useState("");
  const [selectedTopics, setSelectedTopics] = useState<Record<SubjectKey, string[]>>({
    MATH: [], FRENCH: [], ENGLISH: [], GENERAL_CULTURE: [],
  });

  const updateTopics = useCallback((key: SubjectKey, topics: string[]) => {
    setSelectedTopics((prev) => ({ ...prev, [key]: topics }));
  }, []);

  const totalQuestions = selectedSubjects.reduce((acc, id) => acc + (subjectCounts[id] || 0), 0);

  function toggleSubject(id: string) {
    setError("");
    setSelectedSubjects((prev) => {
      if (prev.includes(id)) return prev.filter((s) => s !== id);
      if (!subjectCounts[id]) setSubjectCounts((c) => ({ ...c, [id]: 10 }));
      return [...prev, id];
    });
  }

  function updateCount(id: string, delta: number) {
    setSubjectCounts((prev) => ({
      ...prev,
      [id]: Math.max(1, Math.min(50, (prev[id] || 0) + delta)),
    }));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (selectedSubjects.length === 0 || totalQuestions === 0) {
      setError("Veuillez sélectionner au moins une matière avec des questions.");
      return;
    }
    const fd = new FormData();
    SUBJECTS.forEach((subj) => {
      const key = subj.id.replace("subject_", "subject_count_");
      fd.append(key, selectedSubjects.includes(subj.id) ? String(subjectCounts[subj.id] || 0) : "0");
    });
    fd.append("difficulty", difficulty);
    fd.append("duration", duration.toString());
    fd.append("pausableTimer", pausableTimer.toString());
    fd.append("selectedTopics", JSON.stringify(selectedTopics));
    startTransition(async () => {
      const res = await startTrainingAction(fd);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* En-tête sobre */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0">
          <Target className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Entraînement personnalisé
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Configurez les paramètres de votre épreuve d'entraînement.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ── ÉTAPE 1 : Matières ─────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-md bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">1</span>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Matières et chapitres</h2>
            </div>
            <span className="px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-xs font-bold">
              {totalQuestions} question(s) au total
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SUBJECTS.map((subj) => {
              const isSelected = selectedSubjects.includes(subj.id);
              const count = subjectCounts[subj.id] || 0;
              const Icon = subj.icon;

              return (
                <div
                  key={subj.id}
                  className={`rounded-xl border-2 transition-all overflow-hidden ${
                    isSelected
                      ? `${subj.activeBorder} bg-white dark:bg-slate-900`
                      : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleSubject(subj.id)}
                    className="w-full flex items-center gap-3 p-3.5 text-left"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? subj.activeBg : subj.bg} ${isSelected ? "text-white" : subj.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="flex-1 font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      {subj.name}
                    </span>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isSelected ? "border-indigo-600 bg-indigo-600" : "border-slate-300 dark:border-slate-600"}`}>
                      {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-3.5 pb-3.5 space-y-2 border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500 font-medium">Nombre de questions</span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); updateCount(subj.id, -1); }}
                                className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-6 text-center font-bold text-xs text-slate-900 dark:text-white">{count}</span>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); updateCount(subj.id, 1); }}
                                className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          <TopicPicker
                            subjectKey={subj.key}
                            chipColor={subj.chipColor}
                            selectedTopics={selectedTopics[subj.key]}
                            onChange={(topics) => updateTopics(subj.key, topics)}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── ÉTAPE 2 : Difficulté ───────────────────────────────────────────── */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="w-6 h-6 rounded-md bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">2</span>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Niveau de difficulté</h2>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {DIFFICULTIES.map((diff) => {
              const isActive = difficulty === diff.value;
              const Icon = diff.icon;
              return (
                <button
                  key={diff.value}
                  type="button"
                  onClick={() => setDifficulty(diff.value)}
                  className={`flex flex-col items-center text-center p-3.5 rounded-xl border-2 transition-all ${
                    isActive
                      ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100"
                  }`}
                >
                  <div className={`p-2 rounded-lg mb-2 ${diff.bg} ${diff.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white mb-0.5">
                    {diff.label}
                  </p>
                  <p className="text-[10px] text-slate-400 leading-tight hidden sm:block">{diff.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── ÉTAPE 3 : Durée ────────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="w-6 h-6 rounded-md bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">3</span>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Durée de l'épreuve</h2>
          </div>

          {/* Raccourcis */}
          <div className="flex flex-wrap gap-2">
            {DURATIONS.map((d) => (
              <button
                key={d} type="button"
                onClick={() => setDuration(d)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  duration === d
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                {d} min
              </button>
            ))}
          </div>

          {/* Saisie */}
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-slate-400" />
            <div className="relative">
              <input
                type="number" name="duration" value={duration}
                onChange={(e) => setDuration(Math.max(1, Math.min(240, parseInt(e.target.value) || 60)))}
                className="w-24 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-sm font-bold text-center text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                min="1" max="240"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">min</span>
            </div>
            <p className="text-xs text-slate-400">Durée libre (1 à 240 minutes)</p>
          </div>
        </div>

        {/* ── ÉTAPE 4 : Chronomètre ──────────────────────────────────────────── */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="w-6 h-6 rounded-md bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">4</span>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Mode du chronomètre</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label
              className={`cursor-pointer flex items-start gap-3 p-3.5 rounded-xl border-2 transition-all ${
                !pausableTimer
                  ? "border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/20"
                  : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100"
              }`}
            >
              <input type="radio" name="pausableTimer" checked={!pausableTimer} onChange={() => setPausableTimer(false)} className="sr-only" />
              <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
                <Timer className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">Strict (Temps réel)</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Le temps continue de s'écouler si vous fermez la page.</p>
              </div>
            </label>

            <label
              className={`cursor-pointer flex items-start gap-3 p-3.5 rounded-xl border-2 transition-all ${
                pausableTimer
                  ? "border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/20"
                  : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100"
              }`}
            >
              <input type="radio" name="pausableTimer" checked={pausableTimer} onChange={() => setPausableTimer(true)} className="sr-only" />
              <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
                <PauseCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">Flexible (Pause active)</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Le chronomètre se fige si vous quittez la session.</p>
              </div>
            </label>
          </div>
        </div>

        {/* ── ERREUR ─────────────────────────────────────────────────────────── */}
        {error && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* ── SOUMISSION ─────────────────────────────────────────────────────── */}
        <button
          type="submit"
          disabled={isPending || selectedSubjects.length === 0}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Génération de la session d'entraînement…</span>
            </>
          ) : (
            <>
              <PlayCircle className="w-4 h-4" />
              <span>Lancer l'entraînement ({totalQuestions} questions • {duration} min)</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
