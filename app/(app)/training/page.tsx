"use client";

import { useState, useTransition } from "react";
import { startTrainingAction } from "@/lib/actions/training";
import { 
  Calculator, BookA, Globe, BookOpen, 
  Target, Rocket, Clock, PlayCircle, Loader2,
  TrendingUp, TrendingDown, Gauge, AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SUBJECTS = [
  { id: "subject_0", name: "Mathématiques", icon: Calculator, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-500/10", border: "border-indigo-200 dark:border-indigo-500/30", activeBg: "bg-indigo-500", activeBorder: "border-indigo-600 dark:border-indigo-500" },
  { id: "subject_1", name: "Français", icon: BookA, color: "text-pink-500", bg: "bg-pink-50 dark:bg-pink-500/10", border: "border-pink-200 dark:border-pink-500/30", activeBg: "bg-pink-500", activeBorder: "border-pink-600 dark:border-pink-500" },
  { id: "subject_2", name: "Anglais", icon: Globe, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10", border: "border-amber-200 dark:border-amber-500/30", activeBg: "bg-amber-500", activeBorder: "border-amber-600 dark:border-amber-500" },
  { id: "subject_3", name: "Culture Générale", icon: BookOpen, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-200 dark:border-emerald-500/30", activeBg: "bg-emerald-500", activeBorder: "border-emerald-600 dark:border-emerald-500" },
];

const DIFFICULTIES = [
  { value: "EASY", label: "Facile", desc: "70% faciles, 30% moyennes", icon: TrendingDown, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-200 dark:border-emerald-500/30" },
  { value: "MIXED", label: "Mixte", desc: "Équilibré (Standard)", icon: Gauge, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-500/10", border: "border-indigo-200 dark:border-indigo-500/30" },
  { value: "HARD", label: "Difficile", desc: "50% moyennes, 50% difficiles", icon: TrendingUp, color: "text-red-500", bg: "bg-red-50 dark:bg-red-500/10", border: "border-red-200 dark:border-red-500/30" },
];

export default function TrainingPage() {
  const [isPending, startTransition] = useTransition();
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(SUBJECTS.map(s => s.id));
  const [difficulty, setDifficulty] = useState("MIXED");
  const [duration, setDuration] = useState(60);
  const [error, setError] = useState("");

  function toggleSubject(id: string) {
    setError("");
    setSelectedSubjects(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (selectedSubjects.length === 0) {
      setError("Veuillez sélectionner au moins une matière.");
      return;
    }

    const fd = new FormData();
    selectedSubjects.forEach(id => fd.append(id, "true"));
    fd.append("difficulty", difficulty);
    fd.append("duration", duration.toString());

    startTransition(async () => {
      const res = await startTrainingAction(fd);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-10 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
          <Target className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-1">
            Entraînement personnel
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Configurez une session sur mesure pour tester vos connaissances.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl p-6 sm:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-10">
          
          {/* MATIÈRES */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <label className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-500" />
                Matières à inclure
              </label>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {selectedSubjects.length} sélectionnée(s)
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SUBJECTS.map((subj) => {
                const isSelected = selectedSubjects.includes(subj.id);
                const Icon = subj.icon;
                return (
                  <button
                    key={subj.id}
                    type="button"
                    onClick={() => toggleSubject(subj.id)}
                    className={`relative flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 text-left overflow-hidden group ${
                      isSelected 
                        ? `${subj.activeBorder} bg-white dark:bg-white/5 shadow-md` 
                        : `border-transparent bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10`
                    }`}
                  >
                    <div className={`flex items-center justify-center w-12 h-12 rounded-xl transition-colors duration-300 ${
                      isSelected ? subj.activeBg : subj.bg
                    } ${isSelected ? 'text-white shadow-inner' : subj.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    
                    <div className="flex-1">
                      <p className={`font-semibold text-base transition-colors ${
                        isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'
                      }`}>
                        {subj.name}
                      </p>
                    </div>

                    {/* Indicator */}
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {isSelected && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <hr className="border-gray-200 dark:border-white/10" />

          {/* DIFFICULTÉ */}
          <section>
            <label className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <Gauge className="w-5 h-5 text-indigo-500" />
              Niveau de difficulté
            </label>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {DIFFICULTIES.map((diff) => {
                const isSelected = difficulty === diff.value;
                const Icon = diff.icon;
                return (
                  <button
                    key={diff.value}
                    type="button"
                    onClick={() => setDifficulty(diff.value)}
                    className={`relative flex flex-col items-center text-center p-5 rounded-2xl border-2 transition-all duration-200 ${
                      isSelected 
                        ? `border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10 shadow-md` 
                        : `border-transparent bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10`
                    }`}
                  >
                    <div className={`p-3 rounded-full mb-3 ${isSelected ? diff.color : 'text-gray-400 dark:text-gray-500'} ${diff.bg} ${isSelected ? 'shadow-sm' : ''}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <p className={`font-bold mb-1 ${isSelected ? 'text-indigo-900 dark:text-indigo-100' : 'text-gray-700 dark:text-gray-300'}`}>
                      {diff.label}
                    </p>
                    <p className={`text-xs font-medium ${isSelected ? 'text-indigo-600/70 dark:text-indigo-300/70' : 'text-gray-500 dark:text-gray-500'}`}>
                      {diff.desc}
                    </p>
                    {isSelected && (
                      <motion.div layoutId="diff-outline" className="absolute inset-0 rounded-2xl border-2 border-indigo-500" transition={{ type: "spring", stiffness: 300, damping: 25 }} />
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          <hr className="border-gray-200 dark:border-white/10" />

          {/* DURÉE */}
          <section>
            <label className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-indigo-500" />
              Durée de l'épreuve
            </label>
            
            <div className="flex items-center gap-6">
              <div className="relative">
                <input 
                  type="number" 
                  name="duration" 
                  value={duration}
                  onChange={(e) => setDuration(Math.max(10, Math.min(240, parseInt(e.target.value) || 60)))}
                  className="w-32 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-2xl font-bold text-center text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min="10" 
                  max="240"
                  step="10"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">min</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                Vous pouvez définir une durée entre 10 et 240 minutes.
              </p>
            </div>
          </section>

          {/* ERREUR */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium"
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* SUBMIT */}
          <button 
            type="submit" 
            disabled={isPending || selectedSubjects.length === 0}
            className="group relative flex items-center justify-center gap-3 w-full py-5 rounded-2xl text-lg font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-indigo-500/20 overflow-hidden"
          >
            {isPending ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Génération de l'épreuve...</span>
              </>
            ) : (
              <>
                <PlayCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span>Démarrer l'entraînement</span>
              </>
            )}
            
            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          </button>
        </form>
      </div>
    </main>
  );
}
