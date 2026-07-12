import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { checkRoomStatuses } from "@/lib/actions/rooms";
import { Users, Building2, CheckCircle2, ShieldAlert, ArrowRight, PlayCircle, PlusCircle, BarChart3, Lock, Globe } from "lucide-react";

export const metadata = { title: "Admin Dashboard | PreExcellantia" };

export default async function AdminDashboardPage() {
  await getSession(); // Guarded by layout
  
  await checkRoomStatuses();

  const [usersCount, roomsCount, attemptsCount, activeRooms] = await Promise.all([
    prisma.user.count({ where: { role: "CANDIDATE" } }),
    prisma.room.count(),
    prisma.attempt.count({ where: { status: "SUBMITTED" } }),
    prisma.room.findMany({ 
      where: { status: "RUNNING" },
      orderBy: { startsAt: "desc" },
      include: { _count: { select: { attempts: true } } }
    })
  ]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* HEADER */}
      <div className="mb-10 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/30">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-1">
            Administration
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Gérez les salles, les candidats et analysez les résultats.
          </p>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-gray-600 dark:text-gray-300">Candidats</h3>
          </div>
          <div>
            <span className="text-4xl font-extrabold text-gray-900 dark:text-white">{usersCount}</span>
            <span className="text-sm text-gray-500 ml-2">inscrits</span>
          </div>
        </div>

        <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-gray-600 dark:text-gray-300">Salles créées</h3>
          </div>
          <div>
            <span className="text-4xl font-extrabold text-amber-600 dark:text-amber-400">{roomsCount}</span>
            <span className="text-sm text-gray-500 ml-2">au total</span>
          </div>
        </div>

        <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-gray-600 dark:text-gray-300">Copies soumises</h3>
          </div>
          <div>
            <span className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">{attemptsCount}</span>
            <span className="text-sm text-gray-500 ml-2">terminées</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ACTIVE ROOMS */}
        <div className="lg:col-span-2 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <PlayCircle className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Salles en cours</h2>
            </div>
            <Link href="/admin/salles" className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
              Gérer toutes
            </Link>
          </div>
          
          {activeRooms.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
              <Building2 className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">Aucune salle n'est actuellement en cours.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeRooms.map(room => (
                <div key={room.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{room.title}</h3>
                    <div className="flex items-center gap-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        {room.visibility === "PRIVATE" ? <Lock className="w-4 h-4 text-amber-500" /> : <Globe className="w-4 h-4 text-blue-500" />}
                        {room.visibility === "PRIVATE" ? "Privée" : "Publique"}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                      <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                        <Users className="w-4 h-4" />
                        {room._count.attempts} tentatives
                      </span>
                    </div>
                  </div>
                  <Link 
                    href={`/admin/salles/${room.id}`} 
                    className="shrink-0 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-white dark:bg-white/10 hover:bg-gray-50 dark:hover:bg-white/20 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 transition-all shadow-sm w-full sm:w-auto"
                  >
                    Suivre
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* QUICK ACTIONS */}
        <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-sm h-fit">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Actions rapides</h2>
          <div className="flex flex-col gap-3">
            <Link 
              href="/admin/salles?action=create" 
              className="flex items-center gap-3 p-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-md shadow-indigo-500/20"
            >
              <PlusCircle className="w-5 h-5" />
              Créer une salle
            </Link>
            
            <Link 
              href="/admin/candidats" 
              className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-100 dark:border-white/5 font-semibold text-gray-700 dark:text-gray-200 transition-all"
            >
              <Users className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              Gérer les candidats
            </Link>
            
            <Link 
              href="/admin/salles?filter=closed" 
              className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-100 dark:border-white/5 font-semibold text-gray-700 dark:text-gray-200 transition-all"
            >
              <BarChart3 className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              Voir les classements
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
