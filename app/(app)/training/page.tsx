"use client";

import { useState, useTransition } from "react";
import { startTrainingAction } from "@/lib/actions/training";
import { 
  Calculator, BookA, Globe, BookOpen, 
  Target, Rocket, Clock, PlayCircle, Loader2,
  TrendingUp, TrendingDown, Gauge, AlertCircle, Plus, Minus
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

const containerVariants: any = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function TrainingPage() {
  const [isPending, startTransition] = useTransition();
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(SUBJECTS.map(s => s.id));
  const [subjectCounts, setSubjectCounts] = useState<Record<string, number>>({
    "subject_0": 10,
    "subject_1": 10,
    "subject_2": 10,
    "subject_3": 10
  });
  const [difficulty, setDifficulty] = useState("MIXED");
  const [duration, setDuration] = useState(60);
  const [pausableTimer, setPausableTimer] = useState(false); // Default to pausable
  const [error, setError] = useState("");

  const totalQuestions = selectedSubjects.reduce((acc, id) => acc + (subjectCounts[id] || 0), 0);

  function toggleSubject(id: string) {
    setError("");
    setSelectedSubjects(prev => {
      if (prev.includes(id)) {
        return prev.filter(s => s !== id);
      } else {
        if (!subjectCounts[id]) {
          setSubjectCounts(c => ({ ...c, [id]: 10 }));
        }
        return [...prev, id];
      }
    });
  }

  function updateCount(id: string, delta: number) {
    setSubjectCounts(prev => {
      const current = prev[id] || 0;
      const newCount = Math.max(1, Math.min(50, current + delta)); // min 1, max 50
      return { ...prev, [id]: newCount };
    });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (selectedSubjects.length === 0 || totalQuestions === 0) {
      setError("Veuillez sélectionner au moins une matière avec des questions.");
      return;
    }

    const fd = new FormData();
    selectedSubjects.forEach(id => {
      const countKey = id.replace("subject_", "subject_count_");
      fd.append(countKey, subjectCounts[id].toString());
    });
    fd.append("difficulty", difficulty);
    fd.append("duration", duration.toString());
    fd.append("pausableTimer", pausableTimer.toString());

    startTransition(async () => {
      const res = await startTrainingAction(fd);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <motion.main 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-4xl mx-auto px-4 sm:px-6 py-8"
    >
      <motion.div variants={itemVariants} className="mb-10 flex items-center gap-4">
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
      </motion.div>

      <motion.div variants={itemVariants} className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl p-6 sm:p-10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-none">
        <form onSubmit={handleSubmit} className="flex flex-col gap-10">
          
          {/* MATIÈRES */}
          <motion.section variants={itemVariants}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500 text-white text-sm font-bold shadow-sm">1</span>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight">Matières et questions</h3>
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Sélectionnez les matières à entraîner</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 rounded-lg text-sm font-bold">
                  {totalQuestions} questions au total
                </span>
              </div>
            </div>
            
            <motion.div 
              variants={containerVariants}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {SUBJECTS.map((subj) => {
                const isSelected = selectedSubjects.includes(subj.id);
                const count = subjectCounts[subj.id] || 0;
                const Icon = subj.icon;
                
                return (
                  <motion.div
                    variants={itemVariants}
                    key={subj.id}
                    className={`relative flex flex-col gap-4 p-4 rounded-2xl border-2 transition-all duration-300 text-left overflow-hidden group ${
                      isSelected 
                        ? `${subj.activeBorder} bg-white dark:bg-white/5 shadow-md` 
                        : `border-transparent bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10`
                    }`}
                  >
                    <div 
                      className="flex items-center gap-4 cursor-pointer"
                      onClick={() => toggleSubject(subj.id)}
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
                    </div>

                    {/* Question count selector */}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-2 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Questions</span>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); updateCount(subj.id, -1); }}
                                className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-6 text-center font-bold text-gray-900 dark:text-white">
                                {count}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); updateCount(subj.id, 1); }}
                                className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.section>

          {/* DIFFICULTÉ */}
          <motion.section variants={itemVariants}>
            <div className="flex items-center gap-3 mb-6">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500 text-white text-sm font-bold shadow-sm">2</span>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight">Niveau de difficulté</h3>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Choisissez le niveau des questions générées</p>
              </div>
            </div>
            
            <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {DIFFICULTIES.map((diff) => {
                const isSelected = difficulty === diff.value;
                const Icon = diff.icon;
                return (
                  <motion.button
                    variants={itemVariants}
                    key={diff.value}
                    type="button"
                    onClick={() => setDifficulty(diff.value)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative flex flex-col items-center text-center p-5 rounded-2xl border-2 transition-all duration-300 ${
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
                  </motion.button>
                );
              })}
            </motion.div>
          </motion.section>

          {/* CHRONOMÈTRE */}
          <motion.section variants={itemVariants}>
            <div className="flex items-center gap-3 mb-6">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500 text-white text-sm font-bold shadow-sm">3</span>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight">Mode du chronomètre</h3>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Strict pour un examen réel, flexible pour réviser à son rythme</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className={`cursor-pointer relative flex flex-col p-4 rounded-2xl border-2 transition-all duration-300 ${!pausableTimer ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10 shadow-md' : 'border-transparent bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10'}`}>
                <input type="radio" name="pausableTimer" value="false" checked={!pausableTimer} onChange={() => setPausableTimer(false)} className="sr-only" />
                <span className="font-bold mb-1 text-gray-900 dark:text-white">Strict (Temps réel)</span>
                <span className="text-xs font-medium text-gray-500">Le temps s'écoule même si vous quittez la page. Idéal pour simuler l'examen réel.</span>
              </label>
              
              <label className={`cursor-pointer relative flex flex-col p-4 rounded-2xl border-2 transition-all duration-300 ${pausableTimer ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10 shadow-md' : 'border-transparent bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10'}`}>
                <input type="radio" name="pausableTimer" value="true" checked={pausableTimer} onChange={() => setPausableTimer(true)} className="sr-only" />
                <span className="font-bold mb-1 text-gray-900 dark:text-white">Flexible (Pause active)</span>
                <span className="text-xs font-medium text-gray-500">Le chronomètre se fige si vous vous déconnectez ou quittez la page. Idéal pour un entraînement fragmenté.</span>
              </label>
            </div>
          </motion.section>

          {/* DURÉE */}
          <motion.section variants={itemVariants}>
            <div className="flex items-center gap-3 mb-6">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500 text-white text-sm font-bold shadow-sm">4</span>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight">Durée de l'épreuve</h3>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Définissez le temps imparti en minutes</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="relative">
                <input 
                  type="number" 
                  name="duration" 
                  value={duration}
                  onChange={(e) => setDuration(Math.max(1, Math.min(240, parseInt(e.target.value) || 60)))}
                  className="w-32 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-2xl font-bold text-center text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
                  min="1" 
                  max="240"
                  step="1"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">min</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                Vous pouvez définir la durée librement pour votre entraînement.
              </p>
            </div>
          </motion.section>

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
          <motion.button 
            variants={itemVariants}
            whileHover={!isPending && selectedSubjects.length > 0 ? { scale: 1.01 } : {}}
            whileTap={!isPending && selectedSubjects.length > 0 ? { scale: 0.98 } : {}}
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
                <span>Démarrer l'entraînement ({totalQuestions} q.)</span>
              </>
            )}
            
            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          </motion.button>
        </form>
      </motion.div>
    </motion.main>
  );
}
