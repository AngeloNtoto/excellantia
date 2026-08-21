import { getTrainingAccessStatus } from "@/lib/actions/system";
import { TrainingForm } from "./training-form";
import Link from "next/link";
import {
  Lock,
  ShieldAlert,
  ArrowRight,
  LayoutDashboard,
  Users,
  Sparkles,
  Info,
} from "lucide-react";

export const metadata = {
  title: "Entraînement personnalisé | PreExcellantia",
};

export default async function TrainingPage() {
  const access = await getTrainingAccessStatus();

  // Si l'administration a verrouillé la création d'entraînements
  if (!access.enabled) {
    return (
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-950/5 text-center space-y-6">
          {/* Icône de verrouillage avec halo visuel */}
          <div className="relative inline-flex items-center justify-center">
            <div className="absolute inset-0 rounded-3xl bg-rose-500/20 dark:bg-rose-500/10 blur-xl animate-pulse" />
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-inner">
              <Lock className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/20">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Accès momentanément suspendu</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Création d'entraînements verrouillée
            </h1>
          </div>

          {/* Message strict et formatté rédigé par l'administration */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-left space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <Info className="w-3.5 h-3.5 text-indigo-500" />
              <span>Consigne administrative</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
              « {access.message} »
            </p>
          </div>

          {/* Boutons d'action utiles pour le candidat */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/rooms"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all shadow-md shadow-indigo-600/20"
            >
              <Users className="w-4 h-4" />
              <span>Consulter les Salles officielles</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Retour au Dashboard</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return <TrainingForm />;
}
