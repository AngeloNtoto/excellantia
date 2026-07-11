"use client";

import { motion } from "framer-motion";
import { Building2, Clock, Lock, Unlock, PlayCircle, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { ROOM_STATUS_LABELS } from "@/lib/types";

interface RoomData {
  id: string;
  title: string;
  visibility: string;
  status: string;
  durationMin: number;
  startsAt: Date | null;
  endsAt: Date | null;
}

interface RoomsClientProps {
  availableRooms: RoomData[];
  pastRooms: RoomData[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export function RoomsClient({ availableRooms, pastRooms }: RoomsClientProps) {
  const now = new Date();

  return (
    <motion.main 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-5xl mx-auto px-4 sm:px-6 py-8"
    >
      <motion.div variants={itemVariants} className="mb-10 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
          <Building2 className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-1">
            Salles d'examen
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Rejoignez une session en cours ou consultez l'historique.
          </p>
        </div>
      </motion.div>

      <motion.h2 variants={itemVariants} className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <ActivityIcon className="w-5 h-5 text-blue-500" />
        Salles disponibles
      </motion.h2>

      {availableRooms.length === 0 ? (
        <motion.div variants={itemVariants} className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-3xl p-10 text-center shadow-sm dark:shadow-none mb-12">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-blue-300 dark:text-blue-500/50" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Aucune salle n'est ouverte pour le moment.</p>
        </motion.div>
      ) : (
        <motion.div variants={containerVariants} className="grid gap-4 mb-12">
          {availableRooms.map((room) => {
            const isPrivate = room.visibility === "PRIVATE";
            const isRunning = room.status === "RUNNING";
            const isScheduled = room.status === "SCHEDULED";
            
            let timeInfo = "";
            if (isRunning && room.endsAt) {
              const remaining = Math.max(0, Math.floor((room.endsAt.getTime() - now.getTime()) / 60000));
              timeInfo = `Reste : ${remaining} min`;
            } else if (isScheduled && room.startsAt) {
              timeInfo = `Débute le ${new Date(room.startsAt).toLocaleDateString()} à ${new Date(room.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            }

            return (
              <motion.div 
                variants={itemVariants}
                key={room.id} 
                className="group bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl p-5 sm:p-6 shadow-sm dark:shadow-none hover:shadow-md hover:border-blue-200 dark:hover:border-blue-500/30 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{room.title}</h3>
                    {isPrivate ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400">
                        <Lock className="w-3 h-3" /> Privée
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                        <Unlock className="w-3 h-3" /> Publique
                      </span>
                    )}
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      isRunning ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" : 
                      isScheduled ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400" : "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400"
                    }`}>
                      {ROOM_STATUS_LABELS[room.status as keyof typeof ROOM_STATUS_LABELS]}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" /> {room.durationMin} min
                    </span>
                    {timeInfo && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                        <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                          {isRunning ? <PlayCircle className="w-4 h-4 animate-pulse" /> : <Clock className="w-4 h-4" />} 
                          {timeInfo}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                
                <Link 
                  href={`/rooms/${room.id}`} 
                  className={`shrink-0 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                    isRunning 
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
                      : "bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-900 dark:text-white"
                  }`}
                >
                  {isRunning ? "Entrer" : "Détails"}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      <motion.h2 variants={itemVariants} className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5 text-gray-400" />
        Anciennes salles
      </motion.h2>
      
      {pastRooms.length === 0 ? (
        <motion.div variants={itemVariants} className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-3xl p-10 text-center shadow-sm dark:shadow-none">
          <p className="text-gray-500 dark:text-gray-400 font-medium">Aucun historique de salle.</p>
        </motion.div>
      ) : (
        <motion.div variants={containerVariants} className="grid gap-3">
          {pastRooms.map((room) => (
            <motion.div 
              variants={itemVariants}
              key={room.id} 
              className="group bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl p-4 sm:p-5 shadow-sm dark:shadow-none hover:shadow-md flex items-center justify-between transition-all"
            >
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{room.title}</h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400">
                  Terminée
                </span>
              </div>
              <Link 
                href={`/rooms/${room.id}`} 
                className="inline-flex items-center justify-center p-2 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 dark:hover:text-blue-400 transition-all"
                title="Consulter"
              >
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.main>
  );
}

function ActivityIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  )
}
