"use client";

import { useState, useTransition, useMemo } from "react";
import {
  deleteTextContentAction,
  createQuestionAction,
  importQuestionsForTextAction,
  updateTextContentAction,
} from "@/lib/actions/content";
import {
  Trash2,
  BookOpen,
  PlusCircle,
  Pencil,
  Save,
  X,
  FileCode,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Layers,
  Zap,
  HelpCircle,
  Search,
  Filter,
} from "lucide-react";

type TextItem = {
  id: string;
  title: string;
  language: string;
  content: string;
  source: string | null;
  mode: string | null;
  isActive: boolean;
  _count: { questions: number };
};

export function TextsTable({ texts }: { texts: TextItem[] }) {
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("ALL");
  const [selectedMode, setSelectedMode] = useState<"ALL" | "TRAINING" | "SIMULATION" | "UNIVERSAL">("ALL");
  const [readingId, setReadingId] = useState<string | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [addingQuestionForId, setAddingQuestionForId] = useState<string | null>(null);
  const [questionMode, setQuestionMode] = useState<"form" | "json">("form");
  const [jsonText, setJsonText] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");

  // Compteurs par mode pour les textes
  const countsByMode = useMemo(() => {
    return {
      all: texts.length,
      training: texts.filter((t) => t.mode === "TRAINING").length,
      simulation: texts.filter((t) => t.mode === "SIMULATION").length,
      universal: texts.filter((t) => !t.mode).length,
    };
  }, [texts]);

  // Filtrage local en temps réel
  const filteredTexts = useMemo(() => {
    return texts.filter((t) => {
      if (selectedMode === "TRAINING" && t.mode !== "TRAINING") return false;
      if (selectedMode === "SIMULATION" && t.mode !== "SIMULATION") return false;
      if (selectedMode === "UNIVERSAL" && t.mode !== null && t.mode !== undefined && t.mode !== "") return false;

      if (selectedLanguage !== "ALL" && t.language !== selectedLanguage) return false;

      if (search.trim()) {
        const s = search.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(s);
        const matchSource = t.source?.toLowerCase().includes(s);
        const matchContent = t.content.toLowerCase().includes(s);
        return matchTitle || matchSource || matchContent;
      }
      return true;
    });
  }, [texts, selectedMode, selectedLanguage, search]);

  function handleDelete(id: string, title: string) {
    if (!confirm(`Supprimer le texte "${title}" ? Les questions associées deviendront autonomes.`)) return;
    startTransition(async () => {
      await deleteTextContentAction(id);
    });
  }

  // Mise à jour des détails d'un texte (titre, langue, source, contenu, mode, statut)
  function handleUpdateText(e: React.FormEvent<HTMLFormElement>, textId: string) {
    e.preventDefault();
    setEditError("");
    setEditSuccess("");

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("id", textId);

    startTransition(async () => {
      const res = await updateTextContentAction(formData);
      if (res?.error) {
        setEditError(res.error);
        return;
      }
      setEditSuccess("Détails du texte mis à jour avec succès !");
      setTimeout(() => {
        setEditingTextId(null);
        setEditSuccess("");
      }, 1000);
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

  function loadJsonExample(parentTextMode?: string | null) {
    const example = [
      {
        difficulty: "MEDIUM",
        mode: parentTextMode === "TRAINING" ? "TRAINING" : "SIMULATION",
        statement: "D'après l'auteur, quel est le thème central abordé dans le texte ?",
        options: [
          "L'évolution technologique",
          "La préservation des traditions",
          "Les relations interpersonnelles",
          "Le développement économique"
        ],
        answerIndex: 1,
        explanation: "Le texte insiste à plusieurs reprises sur la transmission et la coutume.",
        optionExplanations: [
          "La technologie n'est pas mentionnée",
          "Bonne réponse : l'auteur met l'accent sur les traditions",
          "Sujet secondaire",
          "Hors sujet"
        ]
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
      {/* ─── ONGLETS DE FILTRAGE PAR MODE POUR LES TEXTES ─── */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
        <button
          type="button"
          onClick={() => setSelectedMode("ALL")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            selectedMode === "ALL"
              ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm border border-slate-200/60 dark:border-slate-700"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-slate-500" />
          <span>Tous les textes</span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {countsByMode.all}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedMode("TRAINING")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            selectedMode === "TRAINING"
              ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20"
              : "text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Entraînement</span>
          <span
            className={`text-[11px] px-2 py-0.5 rounded-full ${
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
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            selectedMode === "SIMULATION"
              ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/20"
              : "text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Simulation / Salons</span>
          <span
            className={`text-[11px] px-2 py-0.5 rounded-full ${
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
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            selectedMode === "UNIVERSAL"
              ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm border border-slate-200/60 dark:border-slate-700"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          <span>Universels</span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {countsByMode.universal}
          </span>
        </button>
      </div>

      {/* ─── BARRE DE RECHERCHE ET LANGUE ─── */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un texte par titre, auteur, passage..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          className="px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          <option value="ALL">Toutes les langues</option>
          <option value="FR">Français</option>
          <option value="EN">Anglais</option>
        </select>
      </div>

      {/* ─── LISTE DES TEXTES ─── */}
      {filteredTexts.length === 0 ? (
        <div className="p-8 text-center text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-3xl text-xs sm:text-sm">
          Aucun texte ne correspond aux filtres actuels.
        </div>
      ) : (
        filteredTexts.map((text) => {
          const isReading = readingId === text.id;
          const isEditing = editingTextId === text.id;
          const isAddingQ = addingQuestionForId === text.id;

          return (
            <div
              key={text.id}
              className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 transition-all"
            >
              {/* Header du texte */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Badge Langue */}
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        text.language === "FR"
                          ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20"
                          : "bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400 border border-teal-200 dark:border-teal-500/20"
                      }`}
                    >
                      {text.language === "FR" ? "Français" : "Anglais"}
                    </span>

                    {/* Badge Mode du Texte */}
                    {text.mode === "TRAINING" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                        <Zap className="w-3 h-3" />
                        Entraînement
                      </span>
                    ) : text.mode === "SIMULATION" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                        <Sparkles className="w-3 h-3" />
                        Simulation
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        Universel
                      </span>
                    )}

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
                    onClick={() => {
                      setReadingId(isReading ? null : text.id);
                      if (!isReading) setEditingTextId(null);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{isReading ? "Masquer" : "Lire"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingTextId(isEditing ? null : text.id);
                      setEditError("");
                      setEditSuccess("");
                      if (!isEditing) {
                        setReadingId(null);
                        setAddingQuestionForId(null);
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-200/60 dark:border-amber-500/20 transition-all active:scale-95 flex items-center gap-1.5"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>{isEditing ? "Fermer" : "Modifier"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAddingQuestionForId(isAddingQ ? null : text.id);
                      setFormError("");
                      setFormSuccess("");
                      if (!isAddingQ) setEditingTextId(null);
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

              {/* ─── MODULE D'ÉDITION DES DÉTAILS DU TEXTE (TITRE, LANGUE, SOURCE, CONTENU, MODE) ─── */}
              {isEditing && (
                <form
                  onSubmit={(e) => handleUpdateText(e, text.id)}
                  className="p-4 sm:p-5 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-500/30 space-y-4 animate-in fade-in duration-200"
                >
                  <div className="flex items-center justify-between border-b border-amber-200/60 dark:border-amber-500/20 pb-3">
                    <h5 className="text-xs sm:text-sm font-extrabold text-amber-900 dark:text-amber-200 flex items-center gap-2">
                      <Pencil className="w-4 h-4 text-amber-500" />
                      Modifier les détails du texte
                    </h5>
                    <button
                      type="button"
                      onClick={() => setEditingTextId(null)}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {editError && (
                    <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold">
                      {editError}
                    </div>
                  )}

                  {editSuccess && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                      {editSuccess}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
                    {/* Titre du texte */}
                    <div className="sm:col-span-2 space-y-1">
                      <label className="font-bold text-slate-900 dark:text-white block">Titre du texte *</label>
                      <input
                        name="title"
                        defaultValue={text.title}
                        required
                        placeholder="Titre de l'extrait ou du document..."
                        className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-amber-500/20 outline-none"
                      />
                    </div>

                    {/* Langue du texte */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-900 dark:text-white block">Langue *</label>
                      <select
                        name="language"
                        defaultValue={text.language}
                        required
                        className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold outline-none"
                      >
                        <option value="FR">Français (FR)</option>
                        <option value="EN">Anglais (EN)</option>
                      </select>
                    </div>

                    {/* Source */}
                    <div className="sm:col-span-2 space-y-1">
                      <label className="font-bold text-slate-900 dark:text-white block">Source / Auteur / Ouvrage</label>
                      <input
                        name="source"
                        defaultValue={text.source || ""}
                        placeholder="ex: Victor Hugo, Les Misérables (1862)"
                        className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                      />
                    </div>

                    {/* Mode */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-900 dark:text-white block">Mode d'épreuve</label>
                      <select
                        name="mode"
                        defaultValue={text.mode || ""}
                        className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium outline-none"
                      >
                        <option value="">Universel (Simulation & Entraînement)</option>
                        <option value="TRAINING">Entraînement uniquement</option>
                        <option value="SIMULATION">Simulation / Concours uniquement</option>
                      </select>
                    </div>
                  </div>

                  {/* Contenu du texte */}
                  <div className="space-y-1 text-xs sm:text-sm">
                    <label className="font-bold text-slate-900 dark:text-white block">Contenu / Passage complet *</label>
                    <textarea
                      name="content"
                      defaultValue={text.content}
                      required
                      rows={7}
                      placeholder="Collez ou modifiez le texte complet ici..."
                      className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-serif leading-relaxed text-xs sm:text-sm focus:ring-2 focus:ring-amber-500/20 outline-none"
                    />
                  </div>

                  {/* Boutons d'action */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        name="isActive"
                        defaultChecked={text.isActive}
                        className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                      />
                      <span>Actif pour la sélection aléatoire</span>
                    </label>

                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingTextId(null)}
                        className="px-4 py-2 text-xs font-bold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        disabled={isPending}
                        className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-sm flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 active:scale-95"
                      >
                        {isPending ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Enregistrement...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-3.5 h-3.5" />
                            <span>Enregistrer les modifications</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              )}

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

                    {/* Bascule Saisie Manuelle vs JSON */}
                    <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-indigo-100 dark:border-indigo-900">
                      <button
                        type="button"
                        onClick={() => setQuestionMode("form")}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                          questionMode === "form"
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        Formulaire
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuestionMode("json")}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                          questionMode === "json"
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        <FileCode className="w-3.5 h-3.5" />
                        Collage JSON
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
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                          <label className="font-bold text-slate-900 dark:text-white block">Mode de la question</label>
                          <select
                            name="mode"
                            defaultValue={text.mode || "SIMULATION"}
                            className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                          >
                            <option value="TRAINING">Entraînement uniquement</option>
                            <option value="SIMULATION">Simulation / Salon</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-slate-900 dark:text-white block">Notion / Chapitre</label>
                          <input
                            name="topic"
                            type="text"
                            placeholder="Ex: Compréhension, Déduction..."
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
                            <option value="0">Option 1 (Index 0)</option>
                            <option value="1">Option 2 (Index 1)</option>
                            <option value="2">Option 3 (Index 2)</option>
                            <option value="3">Option 4 (Index 3)</option>
                          </select>
                        </div>

                        <div className="sm:col-span-2 space-y-1">
                          <label className="font-bold text-slate-900 dark:text-white block">Explication pédagogique</label>
                          <input
                            name="explanation"
                            type="text"
                            placeholder="Ex: Le paragraphe 2 précise explicitement cette idée..."
                            className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          type="submit"
                          disabled={isPending}
                          className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all active:scale-95 disabled:opacity-50"
                        >
                          {isPending ? "Enregistrement..." : "Enregistrer la question"}
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* ─── OPTION 2 : COLLAGE JSON ─── */
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Collez le tableau JSON de questions liées :
                        </label>
                        <button
                          type="button"
                          onClick={() => loadJsonExample(text.mode)}
                          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          Charger un exemple
                        </button>
                      </div>

                      <textarea
                        rows={6}
                        value={jsonText}
                        onChange={(e) => setJsonText(e.target.value)}
                        placeholder={`[
  {
    "difficulty": "MEDIUM",
    "mode": "TRAINING", // ou "SIMULATION"
    "statement": "Que signifie l'expression employée au paragraphe 1 ?",
    "options": ["Choix A", "Choix B", "Choix C", "Choix D"],
    "answerIndex": 0,
    "explanation": "Explication pédagogique..."
  }
]`}
                        className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleImportJsonForText(text.id)}
                          disabled={isPending || !jsonText.trim()}
                          className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                        >
                          {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                          <span>Importer ces questions</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
