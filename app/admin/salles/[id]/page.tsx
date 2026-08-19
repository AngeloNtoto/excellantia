import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ROOM_STATUS_LABELS } from "@/lib/types";
import { startRoomNowAction, closeRoomAction, cancelRoomAction } from "@/lib/actions/rooms";
import { buildWhatsAppMessage, buildRanking } from "@/lib/scoring";
import { getQuestionsByIdsFromDb, getPassagesForQuestions } from "@/lib/questions-db";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Building2, Users, Clock, Trophy, Eye, CheckCircle2,
  AlertCircle, Lock, Unlock, PlayCircle, XCircle, ArrowLeft,
  Share2, FileText, HelpCircle, Check, BookOpen, User, Layers, Zap, Cog, Infinity as InfinityIcon, Box, EyeOff, Telescope
} from "lucide-react";

export default async function AdminRoomDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/");

  const room = await prisma.room.findUnique({
    where: { id },
    include: {
      createdBy: { select: { fullname: true, role: true } },
      attempts: {
        include: {
          user: { select: { id: true, fullname: true, code: true } },
        },
        orderBy: [
          { status: "asc" },
          { percentage: "desc" },
          { timeUsedSec: "asc" },
        ],
      },
    },
  });

  if (!room) redirect("/admin/salles");

  // Récupérer les questions et passages tirés pour cette salle
  const questionIds = Array.isArray(room.questionIds)
    ? (room.questionIds as string[])
    : typeof room.questionIds === "string"
      ? (() => { try { return JSON.parse(room.questionIds) as string[]; } catch { return []; } })()
      : [];

  const questions = await getQuestionsByIdsFromDb(questionIds);
  const passages = await getPassagesForQuestions(questions);
  const passagesMap = new Map(passages.map((p) => [p.id, p]));

  const totalQuestions = questions.length;
  const isRunning = room.status === "RUNNING";
  const isWaiting = room.status === "WAITING" || room.status === "SCHEDULED";
  const isClosed = room.status === "CLOSED";

  const submittedAttempts = room.attempts.filter((a) => a.status !== "IN_PROGRESS");
  const inProgressAttempts = room.attempts.filter((a) => a.status === "IN_PROGRESS");

  const avgScore = submittedAttempts.length > 0
    ? Math.round(submittedAttempts.reduce((acc, a) => acc + (a.percentage ?? 0), 0) / submittedAttempts.length)
    : null;

  const bestScore = submittedAttempts.length > 0
    ? Math.max(...submittedAttempts.map((a) => a.percentage ?? 0))
    : null;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* ─── BARRE DE NAVIGATION & RETOUR ─── */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/admin/salles"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour à la liste des salles</span>
        </Link>

        {/* Contrôles de la salle */}
        <div className="flex items-center gap-2 flex-wrap">
          {isWaiting && (
            <form action={async () => { "use server"; await startRoomNowAction(room.id); }}>
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                <PlayCircle className="w-4 h-4" />
                <span>Démarrer maintenant</span>
              </button>
            </form>
          )}

          {isRunning && (
            <form action={async () => { "use server"; await closeRoomAction(room.id); }}>
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                <span>Fermer la salle</span>
              </button>
            </form>
          )}

          {isWaiting && (
            <form action={async () => { "use server"; await cancelRoomAction(room.id); }}>
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all"
              >
                <span>Annuler</span>
              </button>
            </form>
          )}

          {isClosed && submittedAttempts.length > 0 && (
            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                buildWhatsAppMessage(
                  room.title,
                  room.createdAt.toLocaleDateString(),
                  room.durationMin,
                  buildRanking(
                    submittedAttempts.map((attempt: any) => ({
                      ...attempt,
                      fullname: attempt.user.fullname,
                      scoreBySubject:
                        typeof attempt.scoreBySubject === "string"
                          ? attempt.scoreBySubject
                          : JSON.stringify(attempt.scoreBySubject),
                    }))
                  ),
                  totalQuestions
                )
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <Share2 className="w-4 h-4" />
              <span>Partager sur WhatsApp</span>
            </a>
          )}
        </div>
      </div>

      {/* ─── EN-TÊTE DU SALON INSPECTÉ ─── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                isRunning
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                  : isWaiting
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                    : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
              }`}>
                {isRunning && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                {ROOM_STATUS_LABELS[room.status as keyof typeof ROOM_STATUS_LABELS] ?? room.status}
              </span>

              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                room.mode === "TRAINING"
                  ? "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-200 dark:border-purple-800"
                  : "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800"
              }`}>
                {room.mode === "TRAINING" ? "Salon d'entraînement" : "Évaluation officielle"}
              </span>

              {room.visibility === "PRIVATE" ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  <Lock className="w-3 h-3" /> Privée
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  <Unlock className="w-3 h-3" /> Publique
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {room.title}
            </h1>

            <p className="text-xs text-slate-500">
              Créé par <strong className="text-slate-700 dark:text-slate-300">{room.createdBy?.fullname ?? "Inconnu"}</strong> ({room.createdBy?.role}) le {room.createdAt.toLocaleDateString("fr-FR")} à {room.createdAt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>

          {room.accessCode && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-right">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Code d'accès</div>
              <div className="text-lg font-mono font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">
                {room.accessCode}
              </div>
            </div>
          )}
        </div>

        {/* Mini stats du salon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
            <div className="text-slate-400 font-semibold">Questions</div>
            <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{totalQuestions}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
            <div className="text-slate-400 font-semibold">Durée</div>
            <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{room.durationMin} min</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
            <div className="text-slate-400 font-semibold">Participants</div>
            <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{room.attempts.length} ({submittedAttempts.length} finis)</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
            <div className="text-slate-400 font-semibold">Moyenne / Record</div>
            <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
              {avgScore !== null ? `${avgScore}%` : "—"} / {bestScore !== null ? `${bestScore}%` : "—"}
            </div>
          </div>
        </div>
      </div>

      {/* ─── SECTION 1 : TOUTES LES SESSIONS & PARTICIPANTS DE CE SALON ─── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Candidats &amp; Soumissions ({room.attempts.length})
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {inProgressAttempts.length} en cours • {submittedAttempts.length} soumise(s)
          </span>
        </div>

        {room.attempts.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs sm:text-sm">
            Aucun candidat n'a encore rejoint ou démarré ce salon.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="px-4 py-3">Candidat</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3">Score Global</th>
                  <th className="px-4 py-3">Détail Matières</th>
                  <th className="px-4 py-3">Temps Utilisé</th>
                  <th className="px-4 py-3 text-right">Inspection</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {room.attempts.map((attempt, index) => {
                  const isSubmitted = attempt.status !== "IN_PROGRESS";
                  const pct = attempt.percentage ?? 0;
                  const isSuccess = pct >= 50;
                  const scoreBySubject = attempt.scoreBySubject as Record<string, number> | null;

                  return (
                    <tr key={attempt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{attempt.user.fullname}</span>
                          {index === 0 && isSubmitted && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">1er</span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">{attempt.user.code}</div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          attempt.status === "SUBMITTED"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : attempt.status === "IN_PROGRESS"
                              ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        }`}>
                          {attempt.status === "SUBMITTED" ? "Validé" : attempt.status === "IN_PROGRESS" ? "En cours" : "Auto-soumis"}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        {isSubmitted ? (
                          <div>
                            <span className={`font-bold text-sm ${isSuccess ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600"}`}>
                              {attempt.score ?? 0} pts ({Math.round(pct)}%)
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-[11px] text-slate-600 dark:text-slate-300">
                        {scoreBySubject ? (
                          <div className="flex items-center gap-2 flex-wrap">
                            {scoreBySubject.MATH !== undefined && <span>M: <strong>{scoreBySubject.MATH}</strong></span>}
                            {scoreBySubject.FRENCH !== undefined && <span>F: <strong>{scoreBySubject.FRENCH}</strong></span>}
                            {scoreBySubject.ENGLISH !== undefined && <span>EN: <strong>{scoreBySubject.ENGLISH}</strong></span>}
                            {scoreBySubject.GENERAL_CULTURE !== undefined && <span>CG: <strong>{scoreBySubject.GENERAL_CULTURE}</strong></span>}
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                        {attempt.timeUsedSec ? `${Math.floor(attempt.timeUsedSec / 60)}m ${attempt.timeUsedSec % 60}s` : "—"}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        {isSubmitted ? (
                          <Link
                            href={`/exam/${room.id}/correction/${attempt.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 font-bold transition-all text-[11px]"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Voir copie</span>
                          </Link>
                        ) : (
                          <span className="text-slate-400 text-[11px]">En composition</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── SECTION 2 : INSPECTION COMPLÈTE DES QUESTIONS DU SALON ─── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Questions incluses dans cette épreuve ({questions.length})
            </h2>
          </div>
        </div>

        {questions.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs sm:text-sm">
            Aucune question enregistrée pour cette salle.
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((q, qIndex) => {
              const passage = q.passageId ? passagesMap.get(q.passageId) : null;

              return (
                <div
                  key={q.id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-indigo-600 text-white font-bold flex items-center justify-center text-[11px]">
                        Q{qIndex + 1}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white uppercase">{q.subject}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-[10px]">
                        {q.difficulty}
                      </span>
                    </div>

                    {passage && (
                      <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-[11px] flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5" />
                        Texte lié : {passage.title}
                      </span>
                    )}
                  </div>

                  {/* Énoncé */}
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                    {q.statement}
                  </p>

                  {/* Options de réponse */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {q.options.map((opt, optIndex) => {
                      const isCorrect = optIndex === q.answerIndex;
                      return (
                        <div
                          key={optIndex}
                          className={`p-2.5 rounded-lg border flex items-center justify-between gap-2 ${
                            isCorrect
                              ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold"
                              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold shrink-0 ${
                              isCorrect ? "bg-emerald-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                            }`}>
                              {String.fromCharCode(65 + optIndex)}
                            </span>
                            <span className="truncate">{opt}</span>
                          </div>
                          {isCorrect && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>

                  {q.explanation && (
                    <div className="p-2.5 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 text-[11px] text-indigo-900 dark:text-indigo-300">
                      <strong>Explication :</strong> {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
