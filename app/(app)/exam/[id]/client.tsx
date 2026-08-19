"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  saveAnswerAction,
  toggleFlagAction,
  submitAttemptAction,
  saveElapsedTimeAction,
  resetTeslaAttemptAction,
} from "@/lib/actions/attempts";
import {
  Subject,
  SUBJECT_LABELS,
  SUBJECT_COLORS,
  TimingRegime,
  ClockMode,
  TIMING_REGIMES,
  SCHRODINGER_CONFIG,
  NewtonTimingConfig,
} from "@/lib/types";
import { PhaseRestScreen } from "./phase-rest-screen";
import { RegimesInfoModal } from "@/app/components/regimes-info-modal";
import {
  Clock,
  Infinity,
  Layers,
  Zap,
  EyeOff,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  LayoutList,
  Maximize2,
  Info,
  Check,
  Star,
  ShieldAlert,
  Volume2,
} from "lucide-react";

/**
 * Synthétiseur de bip audio d'urgence (Web Audio API natif, sans fichier externe)
 */
function playCriticalBeep(frequency = 880, duration = 0.08) {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Ignoré si l'audio n'est pas encore débloqué par une interaction
  }
}

export function ExamClient({
  attemptId,
  roomId,
  accessCode,
  questions,
  passages,
  initialAnswers,
  endsAt,
  durationMin,
  startedAt,
  timingRegime = "EINSTEIN",
  clockMode = "ABSOLUTE",
  schrodingerMode = false,
  timingConfig,
  pausableTimer,
  previousTimeUsedSec,
}: {
  attemptId: string;
  roomId: string;
  accessCode?: string | null;
  questions: Array<{
    id: string;
    subject: Subject;
    statement: string;
    options: [string, string, string, string];
    passageId?: string;
  }>;
  passages: Array<{
    id: string;
    title: string;
    language: string;
    content: string;
  }>;
  initialAnswers: Record<string, { selectedIndex: number | null; flagged: boolean }>;
  endsAt: number | null;
  durationMin: number;
  startedAt: number;
  timingRegime?: TimingRegime;
  clockMode?: ClockMode;
  schrodingerMode?: boolean;
  timingConfig?: NewtonTimingConfig | null;
  pausableTimer?: boolean;
  previousTimeUsedSec: number;
}) {
  const [answers, setAnswers] = useState(initialAnswers);
  const [isPending, startTransition] = useTransition();
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [centiseconds, setCentiseconds] = useState<number>(0);
  const [infoModalOpen, setInfoModalOpen] = useState(false);

  // Einstein display mode preference: "SCROLL" (toutes les questions) ou "PAGINATED" (une question à la fois)
  const [einsteinLayout, setEinsteinLayout] = useState<"SCROLL" | "PAGINATED">("SCROLL");
  const [currentIndex, setCurrentIndex] = useState(0);

  // Schrödinger toast notifications
  const [schrodingerAlert, setSchrodingerAlert] = useState<string | null>(null);
  const notifiedMilestones = useRef<Set<number>>(new Set());

  // Tesla: 60s per-question timer
  const [teslaQuestionTimeLeft, setTeslaQuestionTimeLeft] = useState<number>(60);
  const [teslaReloadWarning, setTeslaReloadWarning] = useState<boolean>(false);

  // Newton: phase tracking
  const newtonPhases = timingConfig?.phases || [];
  const [currentNewtonPhaseIdx, setCurrentNewtonPhaseIdx] = useState(0);
  const [isNewtonResting, setIsNewtonResting] = useState(false);

  const regimeMeta = TIMING_REGIMES[timingRegime] || TIMING_REGIMES.EINSTEIN;
  const subjects: Subject[] = ["MATH", "FRENCH", "ENGLISH", "GENERAL_CULTURE"];

  // ─── 1. PROTECTION & CONFIRMATION SUR VOL / RECHARGE (TESLA) ───────────────
  useEffect(() => {
    if (timingRegime === "TESLA") {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = "Attention ! En mode Tesla, tout rechargement ou départ réinitialise votre progression à zéro. Voulez-vous vraiment quitter ?";
        return e.returnValue;
      };

      window.addEventListener("beforeunload", handleBeforeUnload);

      // Détection de rechargement effectif
      const isReload =
        typeof window !== "undefined" &&
        window.sessionStorage.getItem(`tesla_active_${attemptId}`) === "true";

      if (isReload) {
        setTeslaReloadWarning(true);
        startTransition(async () => {
          await resetTeslaAttemptAction(attemptId);
          setAnswers({});
          setCurrentIndex(0);
          setTeslaQuestionTimeLeft(60);
        });
      } else {
        window.sessionStorage.setItem(`tesla_active_${attemptId}`, "true");
      }

      return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }
  }, [timingRegime, attemptId]);

  // ─── 2. CHRONOMÈTRE PRINCIPAL & GESTION SCHRÖDINGER ─────────────────────────
  useEffect(() => {
    const totalSec = Math.min(durationMin * 60, 5 * 60 * 60);
    const pageOpenedAt = Date.now();

    const interval = setInterval(() => {
      const now = Date.now();
      let remaining = 0;

      if (pausableTimer) {
        const sessionElapsed = Math.floor((now - pageOpenedAt) / 1000);
        const totalElapsed = previousTimeUsedSec + sessionElapsed;
        remaining = Math.max(0, totalSec - totalElapsed);
      } else if (clockMode === "ABSOLUTE" && endsAt) {
        remaining = Math.max(0, Math.floor((endsAt - now) / 1000));
      } else {
        const target = startedAt + totalSec * 1000;
        remaining = Math.max(0, Math.floor((target - now) / 1000));
      }

      setTimeLeft(remaining);

      // État critique audio pour Newton et Einstein (<= 60s)
      if (timingRegime !== "TESLA" && remaining <= 60 && remaining > 0) {
        if (remaining === 60 || remaining === 30 || remaining <= 10) {
          playCriticalBeep(remaining <= 5 ? 1046 : 880, 0.09);
        }
      }

      // Schrödinger Checkpoints (100%->97%, 50%, 25%, <=60s)
      if (schrodingerMode && totalSec > 0) {
        const pctRemaining = (remaining / totalSec) * 100;

        if (pctRemaining <= 50 && !notifiedMilestones.current.has(50)) {
          notifiedMilestones.current.add(50);
          setSchrodingerAlert("Point médian atteint : 50% du temps total écoulé.");
          playCriticalBeep(660, 0.15);
          setTimeout(() => setSchrodingerAlert(null), 7000);
        } else if (pctRemaining <= 25 && !notifiedMilestones.current.has(25)) {
          notifiedMilestones.current.add(25);
          setSchrodingerAlert("Dernier quart : 75% du temps écoulé (25% restant).");
          playCriticalBeep(770, 0.15);
          setTimeout(() => setSchrodingerAlert(null), 7000);
        }
      }

      if (remaining <= 0) {
        clearInterval(interval);
        handleSubmit(true);
      }
    }, 250);

    return () => clearInterval(interval);
  }, [endsAt, startedAt, durationMin, clockMode, pausableTimer, previousTimeUsedSec, schrodingerMode, timingRegime]);

  // Centièmes pour l'état critique (<= 60s)
  useEffect(() => {
    if (timeLeft !== null && timeLeft <= 60 && timeLeft > 0) {
      const msInterval = setInterval(() => {
        setCentiseconds(Math.floor((Date.now() % 1000) / 10));
      }, 30);
      return () => clearInterval(msInterval);
    }
  }, [timeLeft]);

  // ─── 3. CHRONOMÈTRE TESLA (60s / question avec État critique <= 20s) ────────
  useEffect(() => {
    if (timingRegime !== "TESLA") return;

    setTeslaQuestionTimeLeft(60);
    const teslaInterval = setInterval(() => {
      setTeslaQuestionTimeLeft((prev) => {
        // État critique Tesla à <= 20s (bip audio)
        if (prev <= 20 && prev > 1) {
          if (prev === 20 || prev === 10 || prev <= 5) {
            playCriticalBeep(prev <= 3 ? 1200 : 950, 0.08);
          }
        }

        if (prev <= 1) {
          // Temps écoulé pour cette question -> passer à la suivante
          if (currentIndex < questions.length - 1) {
            setCurrentIndex((idx) => idx + 1);
            return 60;
          } else {
            clearInterval(teslaInterval);
            handleSubmit(true);
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(teslaInterval);
  }, [currentIndex, timingRegime, questions.length]);

  // ─── 4. ACTIONS DU CANDIDAT ────────────────────────────────────────────────
  const handleSelect = (qId: string, index: number) => {
    const current = answers[qId]?.selectedIndex;
    const nextIndex = current === index ? null : index;

    setAnswers({
      ...answers,
      [qId]: { ...answers[qId], selectedIndex: nextIndex, flagged: answers[qId]?.flagged || false },
    });

    startTransition(() => {
      saveAnswerAction(attemptId, qId, nextIndex);
    });

    // En Régime Newton, vérifier si toutes les questions de la phase en cours ont été répondues
    if (timingRegime === "NEWTON" && newtonPhases.length > 0) {
      const activePhase = newtonPhases[currentNewtonPhaseIdx];
      if (activePhase) {
        const phaseAnsweredCount = activePhase.questionIds.filter((id) => {
          if (id === qId) return nextIndex !== null;
          return answers[id]?.selectedIndex !== null && answers[id]?.selectedIndex !== undefined;
        }).length;

        if (phaseAnsweredCount === activePhase.questionIds.length) {
          // Toutes les questions de la phase sont répondues -> repos
          setIsNewtonResting(true);
        }
      }
    }
  };

  const handleFlag = (qId: string) => {
    const current = answers[qId]?.flagged || false;
    setAnswers({
      ...answers,
      [qId]: { ...answers[qId], flagged: !current },
    });

    startTransition(() => {
      toggleFlagAction(attemptId, qId);
    });
  };

  const handleSubmit = (auto = false) => {
    if (!auto) {
      const confirm = window.confirm(
        "Êtes-vous sûr de vouloir soumettre votre copie définitivement ?"
      );
      if (!confirm) return;
    }
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(`tesla_active_${attemptId}`);
    }
    startTransition(async () => {
      const res = await submitAttemptAction(attemptId);
      if (res?.error) alert(res.error);
      else window.location.href = `/exam/${roomId}/correction/${attemptId}`;
    });
  };

  // ─── FORMATTAGE DU TEMPS ───────────────────────────────────────────────────
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}h ${m.toString().padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Visibilité Schrödinger
  const totalSec = Math.min(durationMin * 60, 5 * 60 * 60);
  const isSchrodingerInitial = timeLeft !== null && timeLeft >= totalSec * 0.97;
  const isCriticalFinalSprint = timeLeft !== null && timeLeft <= 60;
  const isTimerVisible = !schrodingerMode || isSchrodingerInitial || isCriticalFinalSprint;

  // Filtrage des questions actives selon le régime
  let activeQuestions = questions;
  if (timingRegime === "NEWTON" && newtonPhases.length > 0) {
    const activePhase = newtonPhases[currentNewtonPhaseIdx];
    if (activePhase) {
      activeQuestions = questions.filter((q) => activePhase.questionIds.includes(q.id));
    }
  }

  const answeredCount = Object.values(answers).filter(
    (a: any) => a?.selectedIndex !== null && a?.selectedIndex !== undefined
  ).length;

  // ─── RENDU DU REST SCREEN (NEWTON) ─────────────────────────────────────────
  if (timingRegime === "NEWTON" && isNewtonResting && newtonPhases[currentNewtonPhaseIdx]) {
    const currentPhase = newtonPhases[currentNewtonPhaseIdx];
    const nextPhase = newtonPhases[currentNewtonPhaseIdx + 1];
    const nextPhaseTime = (startedAt || Date.now()) + currentPhase.durationSec * 1000;

    return (
      <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
        <PhaseRestScreen
          completedSubject={currentPhase.subject}
          nextSubject={nextPhase?.subject}
          nextPhaseStartsAt={nextPhaseTime}
          phaseNumber={currentNewtonPhaseIdx + 1}
          totalPhases={newtonPhases.length}
          onPhaseTimeUp={() => {
            setIsNewtonResting(false);
            if (currentNewtonPhaseIdx < newtonPhases.length - 1) {
              setCurrentNewtonPhaseIdx((i) => i + 1);
            } else {
              handleSubmit(true);
            }
          }}
        />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* ─── STICKY HEADER PROFESSIONNEL ─── */}
      <div
        className="sticky top-0 z-[100] bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-white/10 px-4 sm:px-6 py-3 flex flex-col sm:flex-row justify-between items-center gap-3 shadow-sm"
      >
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 w-full sm:w-auto">
          <h2 className="m-0 text-base sm:text-lg font-bold text-gray-900 dark:text-white">
            PreExcellantia
          </h2>

          {/* BADGE PERMANENT DU RÉGIME TEMPOREL */}
          <button
            type="button"
            onClick={() => setInfoModalOpen(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 10px",
              borderRadius: 20,
              background: regimeMeta.bgLight,
              border: `1px solid ${regimeMeta.borderLight}`,
              color: regimeMeta.color,
              fontSize: "0.75rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
            title="Consulter les règles des régimes"
          >
            {timingRegime === "EINSTEIN" && <Infinity className="w-3.5 h-3.5" />}
            {timingRegime === "NEWTON" && <Layers className="w-3.5 h-3.5" />}
            {timingRegime === "TESLA" && <Zap className="w-3.5 h-3.5" />}
            <span>{regimeMeta.name}</span>
            <Info className="w-3 h-3 opacity-60 ml-0.5" />
          </button>

          {/* BADGE SCHRÖDINGER */}
          {schrodingerMode && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "4px 10px",
                borderRadius: 20,
                background: SCHRODINGER_CONFIG.bgLight,
                border: `1px solid ${SCHRODINGER_CONFIG.borderLight}`,
                color: SCHRODINGER_CONFIG.color,
                fontSize: "0.72rem",
                fontWeight: 700,
              }}
            >
              <EyeOff className="w-3 h-3" />
              Schrödinger
            </span>
          )}

          {/* PROGRESSION RÉPONSES */}
          <span className="bg-gray-100 dark:bg-white/10 px-3 py-1.5 rounded-full font-medium text-xs sm:text-sm border border-gray-200 dark:border-white/5">
            {answeredCount} / {questions.length} répondue{answeredCount > 1 ? "s" : ""}
          </span>

          {accessCode && (
            <button
              type="button"
              className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-full font-bold font-mono text-xs border border-indigo-100 dark:border-indigo-500/20"
              onClick={() => {
                navigator.clipboard.writeText(accessCode);
                alert("Code copié !");
              }}
            >
              Code: {accessCode}
            </button>
          )}
        </div>

        {/* CONTROLS RIGHT */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* EINSTEIN LAYOUT TOGGLE */}
          {timingRegime === "EINSTEIN" && (
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setEinsteinLayout("SCROLL")}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  einsteinLayout === "SCROLL"
                    ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                }`}
                title="Toutes les questions en continu (Scroll)"
              >
                <LayoutList className="w-3.5 h-3.5" />
                Défilant
              </button>
              <button
                type="button"
                onClick={() => setEinsteinLayout("PAGINATED")}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  einsteinLayout === "PAGINATED"
                    ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                }`}
                title="Une question à la fois"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                Page par page
              </button>
            </div>
          )}

          <button
            className="btn btn-primary text-sm px-5 py-2 font-bold whitespace-nowrap rounded-xl"
            onClick={() => handleSubmit(false)}
            disabled={isPending}
          >
            {isPending ? "Soumission..." : "Soumettre la copie"}
          </button>
        </div>
      </div>

      {/* ─── TOAST ALERTE SCHRÖDINGER (50%, 25%) ─── */}
      <AnimatePresence>
        {schrodingerAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: "fixed",
              top: 70,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 999,
              background: "#8b5cf6",
              color: "#ffffff",
              padding: "12px 24px",
              borderRadius: 16,
              boxShadow: "0 12px 30px rgba(139, 92, 246, 0.4)",
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontWeight: 700,
              fontSize: "0.9rem",
            }}
          >
            <EyeOff className="w-4 h-4" />
            <span>{schrodingerAlert}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── AVERTISSEMENT RELOAD TESLA ─── */}
      {teslaReloadWarning && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-center text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center justify-center gap-2">
          <ShieldAlert className="w-4 h-4" />
          Régime Tesla : Détection de rechargement de page. Votre progression a été réinitialisée au départ.
        </div>
      )}

      {/* ─── CONTENU PRINCIPAL DE L'ÉPREUVE ─── */}
      <div className="page" style={{ maxWidth: 900, marginTop: 16, flex: 1 }}>
        {/* ========================================================================= */}
        {/* CAS A : EINSTEIN MODE SCROLL (Toutes les questions affichées en direct)   */}
        {/* ========================================================================= */}
        {timingRegime === "EINSTEIN" && einsteinLayout === "SCROLL" && (
          <div>
            {subjects.map((subject) => {
              const subjectQuestions = questions.filter((q) => q.subject === subject);
              if (subjectQuestions.length === 0) return null;

              const passagesGroup = new Map<string | null, typeof subjectQuestions>();
              subjectQuestions.forEach((q) => {
                const pId = q.passageId || null;
                if (!passagesGroup.has(pId)) passagesGroup.set(pId, []);
                passagesGroup.get(pId)!.push(q);
              });

              return (
                <div key={subject} style={{ marginBottom: 48 }}>
                  <div
                    style={{
                      borderBottom: `2px solid ${SUBJECT_COLORS[subject]}`,
                      marginBottom: 20,
                      paddingBottom: 6,
                    }}
                  >
                    <h2
                      style={{
                        fontSize: "1.35rem",
                        fontWeight: 700,
                        margin: 0,
                        color: SUBJECT_COLORS[subject],
                      }}
                    >
                      {SUBJECT_LABELS[subject]}
                    </h2>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    {Array.from(passagesGroup.entries()).map(([pId, pQuestions]) => {
                      const passage = pId ? passages.find((p) => p.id === pId) : null;
                      return (
                        <div key={pId || "no-p"} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                          {passage && (
                            <div
                              style={{
                                background: "var(--bg-muted)",
                                padding: 20,
                                borderRadius: 14,
                                borderLeft: "4px solid var(--accent)",
                                fontSize: "0.9rem",
                                lineHeight: 1.6,
                              }}
                            >
                              <h4 style={{ margin: "0 0 10px 0", fontWeight: 700, fontSize: "1.05rem" }}>
                                {passage.title}
                              </h4>
                              <div style={{ whiteSpace: "pre-wrap", color: "var(--text-secondary)" }}>
                                {passage.content}
                              </div>
                            </div>
                          )}

                          {pQuestions.map((q) => {
                            const overallIndex = questions.findIndex((orig) => orig.id === q.id);
                            return renderQuestionCard(q, overallIndex);
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ========================================================================= */}
        {/* CAS B : SÉQUENTIEL / PAGE PAR PAGE (Tesla, Newton, ou Einstein Paginated)  */}
        {/* ========================================================================= */}
        {((timingRegime === "EINSTEIN" && einsteinLayout === "PAGINATED") ||
          timingRegime === "TESLA" ||
          timingRegime === "NEWTON") && (
          <div>
            {/* Barre de progression Tesla / Newton */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)" }}>
                  Question {currentIndex + 1} sur {activeQuestions.length}
                </span>
                {timingRegime === "TESLA" && (
                  <span
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 800,
                      color: teslaQuestionTimeLeft <= 20 ? "#ef4444" : "#06b6d4",
                      fontFamily: "monospace",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                    className={teslaQuestionTimeLeft <= 20 ? "animate-pulse" : ""}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    {teslaQuestionTimeLeft <= 20 ? "ÉTAT CRITIQUE : " : ""}
                    {teslaQuestionTimeLeft}s
                  </span>
                )}
              </div>

              {/* Progress bar */}
              <div style={{ height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${((currentIndex + 1) / activeQuestions.length) * 100}%`,
                    background: timingRegime === "TESLA" && teslaQuestionTimeLeft <= 20 ? "#ef4444" : regimeMeta.color,
                    transition: "width 0.2s ease, background 0.3s ease",
                  }}
                />
              </div>
            </div>

            {/* Question unique */}
            {activeQuestions[currentIndex] && (
              <div>
                {/* Passage associé si présent */}
                {(() => {
                  const q = activeQuestions[currentIndex];
                  const passage = q.passageId ? passages.find((p) => p.id === q.passageId) : null;
                  if (!passage) return null;
                  return (
                    <div
                      style={{
                        background: "var(--bg-muted)",
                        padding: 20,
                        borderRadius: 14,
                        borderLeft: "4px solid var(--accent)",
                        fontSize: "0.9rem",
                        lineHeight: 1.6,
                        marginBottom: 20,
                      }}
                    >
                      <h4 style={{ margin: "0 0 8px 0", fontWeight: 700, fontSize: "1.05rem" }}>{passage.title}</h4>
                      <div style={{ whiteSpace: "pre-wrap", color: "var(--text-secondary)" }}>{passage.content}</div>
                    </div>
                  );
                })()}

                {renderQuestionCard(activeQuestions[currentIndex], currentIndex)}

                {/* Navigation Buttons (Einstein / Newton) */}
                {timingRegime !== "TESLA" && (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24 }}>
                    <button
                      type="button"
                      onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                      disabled={currentIndex === 0}
                      className="btn btn-ghost"
                      style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px" }}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Précédente
                    </button>

                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", maxWidth: 400, justifyContent: "center" }}>
                      {activeQuestions.map((q, idx) => {
                        const isAns = answers[q.id]?.selectedIndex !== null && answers[q.id]?.selectedIndex !== undefined;
                        const isCurrent = idx === currentIndex;
                        return (
                          <button
                            key={q.id}
                            type="button"
                            onClick={() => setCurrentIndex(idx)}
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              border: isCurrent ? `2px solid ${regimeMeta.color}` : "1px solid var(--border)",
                              background: isCurrent ? regimeMeta.color : isAns ? "rgba(16, 185, 129, 0.15)" : "var(--bg-card)",
                              color: isCurrent ? "#ffffff" : isAns ? "var(--success)" : "var(--text-secondary)",
                              cursor: "pointer",
                            }}
                          >
                            {idx + 1}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={() => setCurrentIndex((i) => Math.min(activeQuestions.length - 1, i + 1))}
                      disabled={currentIndex === activeQuestions.length - 1}
                      className="btn btn-ghost"
                      style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px" }}
                    >
                      Suivante
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── FLOATING TIMER PROFESSIONNEL (ÉTAT CRITIQUE AVEC TIERCE & BIPS) ─── */}
      {timeLeft !== null && (
        <div
          className={`fixed bottom-6 right-6 z-[999] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.15)] border backdrop-blur-md transition-all ${
            isCriticalFinalSprint || (timingRegime === "TESLA" && teslaQuestionTimeLeft <= 20)
              ? "bg-red-600 text-white border-red-400 animate-pulse scale-105 shadow-red-500/40"
              : isTimerVisible
              ? timeLeft < 300
                ? "bg-red-500/90 border-red-400 text-white shadow-red-500/30"
                : "bg-white/95 dark:bg-gray-800/95 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white"
              : "bg-purple-950/90 border-purple-500/30 text-purple-200"
          }`}
        >
          {isCriticalFinalSprint || (timingRegime === "TESLA" && teslaQuestionTimeLeft <= 20) ? (
            <Zap className="w-5 h-5 text-yellow-300 animate-bounce" />
          ) : isTimerVisible ? (
            <Clock className={`w-5 h-5 ${timeLeft < 300 ? "text-white" : "text-indigo-500"}`} />
          ) : (
            <EyeOff className="w-5 h-5 text-purple-400" />
          )}

          {isCriticalFinalSprint ? (
            // DÉCOMPTE ULTRA-PRÉCIS AVEC TIERCES / CENTIÈMES (SOUS LES 60 SECONDES)
            <div className="font-bold text-2xl font-mono tracking-tight flex items-baseline gap-1">
              <span>{timeLeft.toString().padStart(2, "0")}s</span>
              <span className="text-base text-yellow-300">.{centiseconds.toString().padStart(2, "0")}</span>
            </div>
          ) : isTimerVisible ? (
            <span className="font-bold text-xl font-mono tracking-tight">{formatTime(timeLeft)}</span>
          ) : (
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-300">
              Chrono discret (Schrödinger)
            </span>
          )}
        </div>
      )}

      {/* MODAL D'INFORMATION SUR LES RÉGIMES */}
      <RegimesInfoModal
        isOpen={infoModalOpen}
        onClose={() => setInfoModalOpen(false)}
        initialRegime={timingRegime}
      />
    </div>
  );

  // Helper pour rendre la carte d'une question
  function renderQuestionCard(q: (typeof questions)[number], index: number) {
    const isAnswered = answers[q.id]?.selectedIndex !== null && answers[q.id]?.selectedIndex !== undefined;
    const isFlagged = answers[q.id]?.flagged;

    return (
      <motion.div
        key={q.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
        style={{
          padding: 24,
          borderRadius: 18,
          borderLeft: isFlagged
            ? "4px solid var(--warning, #f59e0b)"
            : isAnswered
            ? "4px solid var(--success, #10b981)"
            : "4px solid var(--border, #e2e8f0)",
          background: isFlagged ? "rgba(245, 158, 11, 0.05)" : "var(--bg-card, #ffffff)",
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.03)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div style={{ fontSize: "1.05rem", fontWeight: 600, lineHeight: 1.5, color: "var(--text-primary)" }}>
            <span style={{ color: "var(--text-muted)", marginRight: 8 }}>{index + 1}.</span>
            {q.statement}
          </div>

          <button
            type="button"
            onClick={() => handleFlag(q.id)}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 4,
              color: isFlagged ? "#f59e0b" : "var(--text-muted)",
            }}
            title={isFlagged ? "Retirer le marquage" : "Marquer pour vérification"}
          >
            <Star className={`w-5 h-5 ${isFlagged ? "fill-amber-400 text-amber-500" : ""}`} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {q.options.map((opt: string, optIdx: number) => {
            const isSelected = answers[q.id]?.selectedIndex === optIdx;
            return (
              <button
                key={optIdx}
                type="button"
                onClick={() => handleSelect(q.id, optIdx)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "12px 18px",
                  borderRadius: 12,
                  border: `1.5px solid ${isSelected ? "var(--accent, #6366f1)" : "var(--border, #e2e8f0)"}`,
                  background: isSelected ? "rgba(99, 102, 241, 0.08)" : "var(--bg-muted, #f8fafc)",
                  color: isSelected ? "var(--accent, #6366f1)" : "var(--text-primary)",
                  fontSize: "0.925rem",
                  fontWeight: isSelected ? 600 : 400,
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    flexShrink: 0,
                    background: isSelected ? "var(--accent, #6366f1)" : "var(--bg-card, #ffffff)",
                    color: isSelected ? "#ffffff" : "var(--text-secondary)",
                    border: isSelected ? "none" : "1px solid var(--border)",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                  }}
                >
                  {String.fromCharCode(65 + optIdx)}
                </span>
                <span style={{ flex: 1 }}>{opt}</span>
                {isSelected && <Check className="w-4 h-4 shrink-0" />}
              </button>
            );
          })}
        </div>
      </motion.div>
    );
  }
}
