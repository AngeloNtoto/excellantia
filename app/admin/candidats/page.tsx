import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AddCandidateForm } from "./add-form";
import { ImportCandidatesForm } from "./import-form";
import { Users, Search, UserCheck, UserX, Trash2, ShieldCheck, PlusCircle, Upload } from "lucide-react";

export const metadata = { title: "Registre des Candidats | PreExcellantia" };

export default async function AdminCandidatesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await getSession(); // Guarded by layout

  const { q } = await searchParams;
  const query = q ?? "";

  const [candidates, totalCount, activeCount] = await Promise.all([
    prisma.user.findMany({
      where: {
        role: "CANDIDATE",
        ...(query ? { fullname: { contains: query, mode: "insensitive" } } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { attempts: true } } },
    }),
    prisma.user.count({ where: { role: "CANDIDATE" } }),
    prisma.user.count({ where: { role: "CANDIDATE", isActive: true } }),
  ]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* ─── EN-TÊTE PROFESSIONNEL ÉPURÉ ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20">
              <Users className="w-3.5 h-3.5" />
              {totalCount} Candidats Inscrits
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <UserCheck className="w-3 h-3" />
              {activeCount} Actifs
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Registre des Candidats
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl">
            Gérez les comptes, consultez les codes d'accès uniques et activez/désactivez les droits de composition.
          </p>
        </div>
      </div>

      {/* ─── CONTENU PRINCIPAL : LISTE & FORMULAIRES ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLONNE GAUCHE (2/3) : RECHERCHE ET LISTE DES CANDIDATS */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            {/* Barre de recherche */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-500" />
                Liste des Candidats ({candidates.length})
              </h2>

              <form action="/admin/candidats" method="GET" className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    name="q"
                    defaultValue={query}
                    placeholder="Rechercher par nom..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all"
                >
                  Filtrer
                </button>
              </form>
            </div>

            {candidates.length === 0 ? (
              <div className="p-10 text-center text-xs text-slate-400">
                Aucun candidat trouvé pour cette recherche.
              </div>
            ) : (
              <>
                {/* Vue Mobile (Cartes tactiles < 640px) */}
                <div className="grid grid-cols-1 gap-3 p-4 sm:hidden">
                  {candidates.map((c: any) => (
                    <div
                      key={c.id}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-sm text-slate-900 dark:text-white">
                            {c.fullname}
                          </div>
                          <div className="text-xs font-mono text-indigo-600 dark:text-indigo-400 mt-0.5">
                            Code : {c.code}
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            c.isActive
                              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                              : "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                          }`}
                        >
                          {c.isActive ? "Actif" : "Désactivé"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/40 text-xs">
                        <span className="text-slate-500">
                          <strong>{c._count.attempts}</strong> épreuve{c._count.attempts > 1 ? "s" : ""}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <form
                            action={async () => {
                              "use server";
                              const { toggleCandidateAction } = await import("@/lib/actions/candidates");
                              await toggleCandidateAction(c.id);
                            }}
                          >
                            <button
                              type="submit"
                              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-[11px]"
                            >
                              {c.isActive ? "Désactiver" : "Activer"}
                            </button>
                          </form>

                          <form
                            action={async () => {
                              "use server";
                              const { deleteCandidateAction } = await import("@/lib/actions/candidates");
                              await deleteCandidateAction(c.id);
                            }}
                          >
                            <button
                              type="submit"
                              className="p-1 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                              title="Supprimer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Vue Desktop Table (>= 640px) */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                        <th className="py-3 pl-4">Nom complet</th>
                        <th className="py-3">Code d'accès</th>
                        <th className="py-3">Épreuves</th>
                        <th className="py-3">Statut</th>
                        <th className="py-3 pr-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {candidates.map((c: any) => (
                        <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 pl-4 font-bold text-slate-900 dark:text-white">
                            {c.fullname}
                          </td>
                          <td className="py-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            {c.code}
                          </td>
                          <td className="py-3 text-slate-600 dark:text-slate-300 font-medium">
                            {c._count.attempts} participation{c._count.attempts > 1 ? "s" : ""}
                          </td>
                          <td className="py-3">
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                c.isActive
                                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                                  : "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                              }`}
                            >
                              {c.isActive ? "Actif" : "Désactivé"}
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-right">
                            <div className="inline-flex items-center gap-2">
                              <form
                                action={async () => {
                                  "use server";
                                  const { toggleCandidateAction } = await import("@/lib/actions/candidates");
                                  await toggleCandidateAction(c.id);
                                }}
                              >
                                <button
                                  type="submit"
                                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-[11px] transition-all"
                                >
                                  {c.isActive ? "Désactiver" : "Activer"}
                                </button>
                              </form>

                              <form
                                action={async () => {
                                  "use server";
                                  const { deleteCandidateAction } = await import("@/lib/actions/candidates");
                                  await deleteCandidateAction(c.id);
                                }}
                              >
                                <button
                                  type="submit"
                                  className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                                  title="Supprimer définitivement"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </form>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>

        {/* COLONNE DROITE (1/3) : FORMULAIRES D'AJOUT ET IMPORT */}
        <div className="space-y-6">
          {/* Formulaire Ajout Manuel */}
          <div className="bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-indigo-500" />
              Ajouter un candidat
            </h3>
            <AddCandidateForm />
          </div>

          {/* Formulaire Import JSON */}
          <div className="bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base flex items-center gap-2">
                <Upload className="w-4 h-4 text-purple-500" />
                Import JSON en Lot
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Importez une liste de candidats avec nom et code pré-généré.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-400">
              <pre className="overflow-x-auto">
{`[
  { "fullname": "KABONGO Jean", "code": "250701" },
  { "fullname": "MUKENDI Grace", "code": "250702" }
]`}
              </pre>
            </div>

            <ImportCandidatesForm />
          </div>
        </div>
      </div>
    </main>
  );
}
