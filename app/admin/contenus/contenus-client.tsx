"use client";

import { useState } from "react";
import { QuestionsTable } from "./questions-table";
import { TextsTable } from "./texts-table";
import { CreateQuestionForm } from "./create-question-form";
import { CreateTextContentForm } from "./create-text-form";
import { ImportJsonForm } from "./import-json-form";
import { BookOpen, PlusCircle, UploadCloud, Layers, FileCode } from "lucide-react";

type Props = {
  questions: any[];
  texts: any[];
  stats: {
    totalQuestions: number;
    mathCount: number;
    frenchCount: number;
    englishCount: number;
    cultureCount: number;
    totalTexts: number;
  };
};

type TabItem = {
  id: "questions" | "texts" | "import" | "create_q" | "create_t";
  label: string;
  icon: any;
  highlight?: boolean;
};

export function ContenusClient({ questions, texts, stats }: Props) {
  const [activeTab, setActiveTab] = useState<"questions" | "texts" | "import" | "create_q" | "create_t">("questions");

  const tabs: TabItem[] = [
    { id: "questions", label: `Questions (${stats.totalQuestions})`, icon: Layers },
    { id: "import", label: "Import JSON", icon: UploadCloud, highlight: true },
    { id: "create_q", label: "+ Question", icon: PlusCircle },
    { id: "texts", label: `Textes (${stats.totalTexts})`, icon: BookOpen },
    { id: "create_t", label: "+ Texte", icon: FileCode },
  ];

  return (
    <div className="space-y-6">
      {/* ─── STATS MINI-CARDS RESPONSIVE ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-sm border-l-4 border-l-indigo-500">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TOTAL</div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">{stats.totalQuestions}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-sm border-l-4 border-l-blue-500">
          <div className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">MATHS</div>
          <div className="text-xl font-extrabold text-blue-600 dark:text-blue-400 mt-0.5">{stats.mathCount}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-sm border-l-4 border-l-emerald-500">
          <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">FRANÇAIS</div>
          <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">{stats.frenchCount}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-sm border-l-4 border-l-amber-500">
          <div className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">ANGLAIS</div>
          <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">{stats.englishCount}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-sm border-l-4 border-l-pink-500">
          <div className="text-[10px] font-bold text-pink-500 uppercase tracking-wider">CULTURE G.</div>
          <div className="text-xl font-extrabold text-pink-600 dark:text-pink-400 mt-0.5">{stats.cultureCount}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-sm border-l-4 border-l-purple-500">
          <div className="text-[10px] font-bold text-purple-500 uppercase tracking-wider">TEXTES</div>
          <div className="text-xl font-extrabold text-purple-600 dark:text-purple-400 mt-0.5">{stats.totalTexts}</div>
        </div>
      </div>

      {/* ─── ONGLETS DE NAVIGATION DÉFILABLES SUR MOBILE ─── */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap active:scale-95 ${
                isActive
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/60 dark:border-slate-700"
                  : tab.highlight
                  ? "text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/10"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ─── CONTENU DE L'ONGLET ACTIF ─── */}
      <div>
        {activeTab === "questions" && (
          <div className="bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                Banque de questions en base de données
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Recherchez, filtrez et gérez les questions utilisées pour les examens et entraînements.
              </p>
            </div>
            <QuestionsTable questions={questions} />
          </div>
        )}

        {activeTab === "import" && (
          <div className="bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                Importation de questions et textes JSON
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Chargez un fichier ou collez votre JSON directement pour alimenter instantanément la base.
              </p>
            </div>
            <ImportJsonForm />
          </div>
        )}

        {activeTab === "create_q" && (
          <div className="bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-sm space-y-4 max-w-3xl mx-auto">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                Ajouter une question autonome
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Créez une question QCM de mathématiques, culture générale, grammaire ou anglais.
              </p>
            </div>
            <CreateQuestionForm />
          </div>
        )}

        {activeTab === "texts" && (
          <div className="bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                Textes de compréhension de lecture
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Consultez les textes et ajoutez des questions directement associées à chaque texte.
              </p>
            </div>
            <TextsTable texts={texts} />
          </div>
        )}

        {activeTab === "create_t" && (
          <div className="bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-sm space-y-4 max-w-2xl mx-auto">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                Ajouter un texte de lecture
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Enregistrez un passage en français ou en anglais pour y rattacher ensuite des questions de compréhension.
              </p>
            </div>
            <CreateTextContentForm />
          </div>
        )}
      </div>
    </div>
  );
}
