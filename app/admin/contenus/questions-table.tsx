"use client";

import { useState, useTransition, useMemo } from "react";
import { deleteQuestionAction, deleteManyQuestionsAction, clearAllQuestionsAction } from "@/lib/actions/content";
import {
  Trash2,
  Search,
  Check,
  BookOpen,
  Target,
  PenLine,
  Folder,
  Lightbulb,
  Layers,
  Sparkles,
  Zap,
  Clock,
  Filter,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";

type QuestionItem = {
  id: string;
  subject: string;
  topic: string | null;
  subtopic: string | null;
  difficulty: string;
  language: string;
  statement: string;
  options: any;
  answerIndex: number;
  explanation: string | null;
  type: string;
  mode: string | null;
  scope: string | null;
  timesAppeared?: number;
  timesAnswered?: number;
  textContent?: { id: string; title: string } | null;
};

const SUBJECT_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string }
> = {
  MATH: {
    label: "Mathématiques",
    bg: "bg-blue-500/10 dark:bg-blue-500/20",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-500/20",
  },
  FRENCH: {
    label: "Français",
    bg: "bg-purple-500/10 dark:bg-purple-500/20",
    text: "text-purple-700 dark:text-purple-300",
    border: "border-purple-500/20",
  },
  ENGLISH: {
    label: "Anglais",
    bg: "bg-teal-500/10 dark:bg-teal-500/20",
    text: "text-teal-700 dark:text-teal-300",
    border: "border-teal-500/20",
  },
  GENERAL_CULTURE: {
    label: "Culture Générale",
    bg: "bg-amber-500/10 dark:bg-amber-500/20",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-500/20",
  },
};

const DIFFICULTY_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string }
> = {
  EASY: {
    label: "Facile",
    bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-500/20",
  },
  MEDIUM: {
    label: "Moyen",
    bg: "bg-amber-500/10 dark:bg-amber-500/20",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-500/20",
  },
  HARD: {
    label: "Difficile",
    bg: "bg-rose-500/10 dark:bg-rose-500/20",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-500/20",
  },
};

export function QuestionsTable({ questions }: { questions: QuestionItem[] }) {
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [selectedMode, setSelectedMode] = useState<"ALL" | "TRAINING" | "SIMULATION" | "UNIVERSAL">("ALL");
  const [selectedSubject, setSelectedSubject] = useState<string>("ALL");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("ALL");
  const [selectedTextOnly, setSelectedTextOnly] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"RECENT" | "MOST_APPEARED" | "MOST_ANSWERED" | "LEAST_APPEARED">("RECENT");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Compteurs par mode pour les onglets
  const countsByMode = useMemo(() => {
    return {
      all: questions.length,
      training: questions.filter((q) => q.mode === "TRAINING").length,
      simulation: questions.filter((q) => q.mode === "SIMULATION").length,
      universal: questions.filter((q) => !q.mode).length,
    };
  }, [questions]);

  // Filtrage local en temps réel
  const filtered = useMemo(() => {
    return questions.filter((q) => {
      // Filtre par Mode (Entraînement / Simulation / Universel)
      if (selectedMode === "TRAINING" && q.mode !== "TRAINING") return false;
      if (selectedMode === "SIMULATION" && q.mode !== "SIMULATION") return false;
      if (selectedMode === "UNIVERSAL" && q.mode !== null && q.mode !== undefined && q.mode !== "") return false;

      // Filtres Matière / Difficulté / Texte
      if (selectedSubject !== "ALL" && q.subject !== selectedSubject) return false;
      if (selectedDifficulty !== "ALL" && q.difficulty !== selectedDifficulty) return false;
      if (selectedTextOnly === "WITH_TEXT" && !q.textContent) return false;
      if (selectedTextOnly === "WITHOUT_TEXT" && q.textContent) return false;

      if (search.trim()) {
        const s = search.toLowerCase();
        const matchStatement = q.statement.toLowerCase().includes(s);
        const matchTopic = q.topic?.toLowerCase().includes(s);
        const matchSubtopic = q.subtopic?.toLowerCase().includes(s);
        const matchText = q.textContent?.title.toLowerCase().includes(s);
        return matchStatement || matchTopic || matchSubtopic || matchText;
      }
      return true;
    });
  }, [questions, selectedMode, selectedSubject, selectedDifficulty, selectedTextOnly, search]);

  // Tri des questions
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortBy === "MOST_APPEARED") {
        return (b.timesAppeared ?? 0) - (a.timesAppeared ?? 0);
      }
      if (sortBy === "MOST_ANSWERED") {
        return (b.timesAnswered ?? 0) - (a.timesAnswered ?? 0);
      }
      if (sortBy === "LEAST_APPEARED") {
        return (a.timesAppeared ?? 0) - (b.timesAppeared ?? 0);
      }
      return 0; // Récentes par défaut
    });
  }, [filtered, sortBy]);

  function handleDelete(id: string) {
    if (!confirm("Voulez-vous vraiment supprimer cette question ?")) return;
    startTransition(async () => {
      await deleteQuestionAction(id);
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    });
  }

  function handleDeleteBatch() {
    if (selectedIds.length === 0) return;
    if (!confirm(`Supprimer définitivement ${selectedIds.length} question(s) sélectionnée(s) ?`)) return;
    startTransition(async () => {
      await deleteManyQuestionsAction(selectedIds);
      setSelectedIds([]);
    });
  }

  function handleClearAll() {
    if (questions.length === 0) return;
    const code = prompt(
      `ATTENTION : Vous êtes sur le point de supprimer TOUTES les ${questions.length} questions de la base de données.\n\nTapez "SUPPRIMER" pour confirmer cette action irréversible :`
    );
    if (code !== "SUPPRIMER") return;

    startTransition(async () => {
      await clearAllQuestionsAction();
      setSelectedIds([]);
    });
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  function toggleSelectAll() {
    if (selectedIds.length === sorted.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(sorted.map((q) => q.id));
    }
  }

  return (
    <div className="space-y-4">
      {/* ─── SÉLECTEUR RAPIDE DE MODE (ONGLETS SEGMENTÉS) ─── */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
        <button
          type="button"
          onClick={() => setSelectedMode("ALL")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            selectedMode === "ALL"
              ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm border border-slate-200/60 dark:border-slate-700"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Layers className="w-4 h-4 text-slate-500" />
          <span>Toutes les questions</span>
          <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {countsByMode.all}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedMode("TRAINING")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            selectedMode === "TRAINING"
              ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20"
              : "text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Entraînement</span>
          <span
            className={`ml-1 text-xs px-2 py-0.5 rounded-full ${
              selectedMode === "TRAINING"
                ? "bg-emerald-700/80 text-white"
                : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
            }`}
          >
            {countsByMode.training}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedMode("SIMULATION")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            selectedMode === "SIMULATION"
              ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/20"
              : "text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Simulation / Salons</span>
          <span
            className={`ml-1 text-xs px-2 py-0.5 rounded-full ${
              selectedMode === "SIMULATION"
                ? "bg-indigo-700/80 text-white"
                : "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300"
            }`}
          >
            {countsByMode.simulation}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedMode("UNIVERSAL")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            selectedMode === "UNIVERSAL"
              ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm border border-slate-200/60 dark:border-slate-700"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <HelpCircle className="w-4 h-4 text-slate-400" />
          <span>Universelles</span>
          <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {countsByMode.universal}
          </span>
        </button>
      </div>

      {/* ─── BARRE DE RECHERCHE ET FILTRES DÉTAILLÉS ─── */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        {/* Recherche */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par mot-clé, énoncé, chapitre, texte..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Menus déroulants de filtrage */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Matière */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="ALL">Toutes matières</option>
            <option value="MATH">Mathématiques</option>
            <option value="FRENCH">Français</option>
            <option value="ENGLISH">Anglais</option>
            <option value="GENERAL_CULTURE">Culture Générale</option>
          </select>

          {/* Difficulté */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="ALL">Toutes difficultés</option>
            <option value="EASY">Facile</option>
            <option value="MEDIUM">Moyen</option>
            <option value="HARD">Difficile</option>
          </select>

          {/* Type : Autonome vs Texte */}
          <select
            value={selectedTextOnly}
            onChange={(e) => setSelectedTextOnly(e.target.value)}
            className="px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="ALL">Tous types</option>
            <option value="WITHOUT_TEXT">Autonomes</option>
            <option value="WITH_TEXT">Liées à un texte</option>
          </select>

          {/* Tri */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 text-xs sm:text-sm font-bold rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="RECENT">Plus récentes</option>
            <option value="MOST_APPEARED">Plus souvent tirées</option>
            <option value="MOST_ANSWERED">Plus souvent répondues</option>
            <option value="LEAST_APPEARED">Moins souvent tirées</option>
          </select>
        </div>
      </div>

      {/* ─── BARRE D'ACTIONS DE SÉLECTION EN LOT ─── */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl text-xs sm:text-sm text-rose-800 dark:text-rose-300">
          <span className="font-semibold">
            <strong>{selectedIds.length}</strong> question(s) sélectionnée(s)
          </span>
          <button
            type="button"
            onClick={handleDeleteBatch}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Supprimer la sélection</span>
          </button>
        </div>
      )}

      {/* ─── LISTE DES QUESTIONS AVEC SÉPARATION VISUELLE ─── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {/* En-tête de liste */}
        <div className="px-4 py-3 bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2.5">
            <input
              type="checkbox"
              checked={sorted.length > 0 && selectedIds.length === sorted.length}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700 cursor-pointer"
            />
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {sorted.length} question{sorted.length > 1 ? "s" : ""} affichée{sorted.length > 1 ? "s" : ""}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total base : {questions.length}
            </span>
            {questions.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                disabled={isPending}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 transition-all active:scale-95 disabled:opacity-50"
                title="Vider entièrement la table des questions"
              >
                <Trash2 className="w-3 h-3" />
                <span>Vider la banque</span>
              </button>
            )}
          </div>
        </div>

        {/* Corps de liste */}
        {sorted.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 space-y-2">
            <Filter className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-semibold">Aucune question ne correspond aux filtres sélectionnés.</p>
            <p className="text-xs text-slate-400">Essayez de réinitialiser le filtre ou la recherche.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80 max-h-[700px] overflow-y-auto">
            {sorted.map((q) => {
              const options = Array.isArray(q.options) ? q.options : [];
              const isSelected = selectedIds.includes(q.id);
              const appeared = q.timesAppeared ?? 0;
              const answered = q.timesAnswered ?? 0;
              const subj = SUBJECT_CONFIG[q.subject] ?? {
                label: q.subject,
                bg: "bg-slate-100 dark:bg-slate-800",
                text: "text-slate-800 dark:text-slate-200",
                border: "border-slate-200 dark:border-slate-700",
              };
              const diff = DIFFICULTY_CONFIG[q.difficulty] ?? {
                label: q.difficulty,
                bg: "bg-slate-100 dark:bg-slate-800",
                text: "text-slate-800 dark:text-slate-200",
                border: "border-slate-200 dark:border-slate-700",
              };

              return (
                <div
                  key={q.id}
                  className={`p-4 sm:p-5 flex items-start gap-3.5 transition-colors ${
                    isSelected
                      ? "bg-indigo-50/40 dark:bg-indigo-950/20"
                      : "hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                  }`}
                >
                  {/* Case à cocher */}
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(q.id)}
                    className="mt-1 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700 cursor-pointer"
                  />

                  {/* Contenu de la question */}
                  <div className="flex-1 min-w-0 space-y-2.5">
                    {/* Ligne 1 : Badges d'information visuels */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {/* Badge Mode (Entraînement / Simulation / Universel) */}
                      {q.mode === "TRAINING" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                          <Zap className="w-3 h-3" />
                          Entraînement
                        </span>
                      ) : q.mode === "SIMULATION" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                          <Sparkles className="w-3 h-3" />
                          Simulation
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          Universel
                        </span>
                      )}

                      {/* Badge Matière */}
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${subj.bg} ${subj.text} ${subj.border}`}
                      >
                        {subj.label}
                      </span>

                      {/* Badge Difficulté */}
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${diff.bg} ${diff.text} ${diff.border}`}
                      >
                        {diff.label}
                      </span>

                      {/* Badge Usage : Appels & Réponses */}
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/80"
                        title="Nombre de fois où cette question a été tirée dans une épreuve ou un entraînement"
                      >
                        <Target className="w-3 h-3 text-slate-400" />
                        <span>{appeared} tirage{appeared > 1 ? "s" : ""}</span>
                      </span>

                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/80"
                        title="Nombre de fois où des candidats ont répondu à cette question"
                      >
                        <PenLine className="w-3 h-3 text-slate-400" />
                        <span>{answered} réponse{answered > 1 ? "s" : ""}</span>
                      </span>

                      {/* Chapitre / Rubrique */}
                      {q.topic && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                          <Folder className="w-3 h-3" />
                          <span>{q.topic}{q.subtopic ? ` > ${q.subtopic}` : ""}</span>
                        </span>
                      )}

                      {/* Texte associé */}
                      {q.textContent && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md border border-indigo-200/50 dark:border-indigo-800/50">
                          <BookOpen className="w-3 h-3" />
                          <span>{q.textContent.title}</span>
                        </span>
                      )}
                    </div>

                    {/* Énoncé de la question */}
                    <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
                      {q.statement}
                    </p>

                    {/* Options QCM en grille responsive */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {options.map((opt: string, optIdx: number) => {
                        const isCorrect = optIdx === q.answerIndex;
                        return (
                          <div
                            key={optIdx}
                            className={`flex items-center gap-2 p-2 rounded-xl text-xs transition-all ${
                              isCorrect
                                ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-200 border border-emerald-500/30 font-bold"
                                : "bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/60 font-medium"
                            }`}
                          >
                            <span
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0 ${
                                isCorrect
                                  ? "bg-emerald-600 text-white"
                                  : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                              }`}
                            >
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="truncate">{opt}</span>
                            {isCorrect && (
                              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 ml-auto" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explication pédagogique */}
                    {q.explanation && (
                      <div className="flex items-start gap-1.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/40 text-[11px] text-slate-600 dark:text-slate-400">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span className="leading-normal">{q.explanation}</span>
                      </div>
                    )}
                  </div>

                  {/* Bouton supprimer */}
                  <button
                    type="button"
                    onClick={() => handleDelete(q.id)}
                    disabled={isPending}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all shrink-0"
                    title="Supprimer la question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
