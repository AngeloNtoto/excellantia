"use client";

import { useState, useEffect, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { saveAnswerAction, toggleFlagAction, submitAttemptAction, saveElapsedTimeAction } from "@/lib/actions/attempts";
import { SUBJECT_LABELS, SUBJECT_COLORS } from "@/lib/types";
import { Clock } from "lucide-react";

export function ExamClient({
  attemptId,
  questions,
  passages,
  initialAnswers,
  endsAt,
  durationMin,
  startedAt,
  timeMode,
  roomId,
  accessCode,
  pausableTimer,
  previousTimeUsedSec
}: any) {
  const [answers, setAnswers] = useState(initialAnswers);
  const [isPending, startTransition] = useTransition();
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Group questions by subject
  const subjects = ["MATH", "FRENCH", "ENGLISH", "GENERAL_CULTURE"];
  
  useEffect(() => {
    const totalSec = durationMin * 60;
    // Track how many seconds have been "used" since we opened this page
    const pageOpenedAt = Date.now();

    const timer = setInterval(() => {
      const now = Date.now();
      let remaining = 0;

      if (pausableTimer) {
        // PAUSABLE: elapsed = previousTimeUsedSec + time spent on this page load
        const sessionElapsed = Math.floor((now - pageOpenedAt) / 1000);
        const totalElapsed = previousTimeUsedSec + sessionElapsed;
        remaining = Math.max(0, totalSec - totalElapsed);
      } else if (timeMode === "ABSOLUTE" && endsAt) {
        // ABSOLUTE: server-set end time
        remaining = Math.max(0, Math.floor((endsAt - now) / 1000));
      } else {
        // RELATIVE (strict): based on startedAt
        const target = startedAt + totalSec * 1000;
        remaining = Math.max(0, Math.floor((target - now) / 1000));
      }

      setTimeLeft(remaining);

      if (remaining === 0) {
        clearInterval(timer);
        handleSubmit(true);
      }
    }, 1000);

    // PAUSABLE: save elapsed time to server every 15 seconds
    let saveTimer: ReturnType<typeof setInterval> | null = null;
    if (pausableTimer) {
      saveTimer = setInterval(() => {
        const sessionElapsed = Math.floor((Date.now() - pageOpenedAt) / 1000);
        const totalElapsed = previousTimeUsedSec + sessionElapsed;
        saveElapsedTimeAction(attemptId, totalElapsed);
      }, 15000);
    }

    // PAUSABLE: save on page unload
    const handleBeforeUnload = () => {
      if (pausableTimer) {
        const sessionElapsed = Math.floor((Date.now() - pageOpenedAt) / 1000);
        const totalElapsed = previousTimeUsedSec + sessionElapsed;
        // Use sendBeacon for reliability on page close
        const data = JSON.stringify({ attemptId, timeUsedSec: totalElapsed });
        navigator.sendBeacon?.("/api/save-time", data);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(timer);
      if (saveTimer) clearInterval(saveTimer);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      // Save one final time on unmount
      if (pausableTimer) {
        const sessionElapsed = Math.floor((Date.now() - pageOpenedAt) / 1000);
        const totalElapsed = previousTimeUsedSec + sessionElapsed;
        saveElapsedTimeAction(attemptId, totalElapsed);
      }
    };
  }, [endsAt, startedAt, durationMin, timeMode, pausableTimer, previousTimeUsedSec]);

  const handleSelect = (qId: string, index: number) => {
    const current = answers[qId]?.selectedIndex;
    const nextIndex = current === index ? null : index; // Toggle
    
    setAnswers({
      ...answers,
      [qId]: { ...answers[qId], selectedIndex: nextIndex }
    });
    
    startTransition(() => {
      saveAnswerAction(attemptId, qId, nextIndex);
    });
  };

  const handleFlag = (qId: string) => {
    const current = answers[qId]?.flagged || false;
    setAnswers({
      ...answers,
      [qId]: { ...answers[qId], flagged: !current }
    });
    
    startTransition(() => {
      toggleFlagAction(attemptId, qId);
    });
  };

  const handleSubmit = (auto = false) => {
    if (!auto) {
      const confirm = window.confirm("Êtes-vous sûr de vouloir soumettre ? Vous ne pourrez plus modifier vos réponses.");
      if (!confirm) return;
    }
    startTransition(async () => {
      const res = await submitAttemptAction(attemptId);
      if (res?.error) alert(res.error);
      else window.location.href = `/exam/${roomId}/correction/${attemptId}`;
    });
  };

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.values(answers).filter((a: any) => a.selectedIndex !== null && a.selectedIndex !== undefined).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Sticky Header */}
      <div className="sticky top-0 z-[100] bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-white/10 px-4 sm:px-6 py-3 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 w-full sm:w-auto">
          <h2 className="m-0 text-base sm:text-lg font-bold text-gray-900 dark:text-white hidden sm:block">PreExcellantia</h2>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            <span className="bg-gray-100 dark:bg-white/10 px-3 py-1.5 rounded-full font-medium border border-gray-200 dark:border-white/5">
              {answeredCount} / {questions.length} <span className="hidden sm:inline">répondues</span><span className="sm:hidden">rep.</span>
            </span>
            {accessCode && (
              <button 
                type="button"
                className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-full font-bold font-mono border border-indigo-100 dark:border-indigo-500/20 hover:bg-indigo-100 dark:hover:bg-indigo-500/30 transition-colors"
                onClick={() => {
                  navigator.clipboard.writeText(accessCode);
                  alert("Code copié ! Envoyez-le à un ami pour un duel.");
                }}
                title="Cliquez pour copier"
              >
                Code: {accessCode}
              </button>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex-1" /> {/* Spacer pour pousser le bouton à droite si besoin */}
          <button className="btn btn-primary text-sm px-4 py-2 whitespace-nowrap" onClick={() => handleSubmit(false)} disabled={isPending}>
            {isPending ? "Soumission..." : "Soumettre la copie"}
          </button>
        </div>
      </div>

      <div className="page" style={{ maxWidth: 900, marginTop: 16 }}>
        {subjects.map(subject => {
          const subjectQuestions = questions.filter((q: any) => q.subject === subject);
          if (subjectQuestions.length === 0) return null;
          
          return (
            <div key={subject} style={{ marginBottom: 64 }}>
              <div style={{ 
                borderBottom: `2px solid ${SUBJECT_COLORS[subject as keyof typeof SUBJECT_COLORS]}`,
                marginBottom: 24, paddingBottom: 8
              }}>
                <h2 style={{ 
                  fontSize: "1.5rem", fontWeight: 700, margin: 0,
                  color: SUBJECT_COLORS[subject as keyof typeof SUBJECT_COLORS] 
                }}>
                  {SUBJECT_LABELS[subject as keyof typeof SUBJECT_LABELS]}
                </h2>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                {(() => {
                  const passagesGroup = new Map<string | null, typeof subjectQuestions>();
                  subjectQuestions.forEach((q: any) => {
                    const pId = q.passageId || null;
                    if (!passagesGroup.has(pId)) passagesGroup.set(pId, []);
                    passagesGroup.get(pId)!.push(q);
                  });

                  return Array.from(passagesGroup.entries()).map(([passageId, pQuestions]) => {
                    const passage = passageId ? passages.find((p: any) => p.id === passageId) : null;
                    return (
                      <div key={passageId || "no-passage"} style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                        {passage && (
                          <div style={{ 
                            background: "var(--bg-muted)", padding: 24, borderRadius: "var(--radius-md)", 
                            borderLeft: "4px solid var(--accent)", fontSize: "0.9375rem", lineHeight: 1.6
                          }}>
                            <h4 style={{ margin: "0 0 16px 0", fontWeight: 700, fontSize: "1.125rem" }}>{passage.title}</h4>
                            <div style={{ whiteSpace: "pre-wrap", color: "var(--text-secondary)" }}>{passage.content}</div>
                          </div>
                        )}
                        {pQuestions.map((q: any) => {
                          const i = subjectQuestions.findIndex((orig: any) => orig.id === q.id);
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
                                borderLeft: isFlagged ? "4px solid var(--warning)" : isAnswered ? "4px solid var(--success)" : "4px solid var(--border)",
                                background: isFlagged ? "var(--warning-light)" : "var(--bg-card)"
                              }}
                            >
                      
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                        <div style={{ fontSize: "1.0625rem", fontWeight: 500, lineHeight: 1.5 }}>
                          <span style={{ color: "var(--text-muted)", marginRight: 8 }}>{i + 1}.</span>
                          {q.statement}
                        </div>
                        <button 
                          onClick={() => handleFlag(q.id)}
                          style={{ 
                            background: "none", border: "none", cursor: "pointer", 
                            color: isFlagged ? "var(--warning)" : "var(--text-muted)",
                            fontSize: "1.5rem", padding: "0 8px"
                          }}
                          title="Marquer à revoir"
                        >
                          ★
                        </button>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {q.options.map((opt: string, optIdx: number) => {
                          const isSelected = answers[q.id]?.selectedIndex === optIdx;
                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleSelect(q.id, optIdx)}
                              style={{
                                display: "flex", alignItems: "flex-start", gap: 12,
                                padding: "12px 16px", borderRadius: "var(--radius-sm)",
                                border: `1.5px solid ${isSelected ? "var(--accent)" : "var(--border)"}`,
                                background: isSelected ? "var(--accent-light)" : "transparent",
                                color: isSelected ? "var(--accent)" : "var(--text-primary)",
                                fontSize: "0.9375rem", textAlign: "left", cursor: "pointer",
                                transition: "all 0.15s"
                              }}
                            >
                              <span style={{ 
                                display: "inline-flex", alignItems: "center", justifyContent: "center",
                                width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                                background: isSelected ? "var(--accent)" : "var(--bg-muted)",
                                color: isSelected ? "#fff" : "var(--text-secondary)",
                                fontSize: "0.75rem", fontWeight: 600
                              }}>
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span style={{ paddingTop: 2 }}>{opt}</span>
                            </button>
                          );
                        })}
                      </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          );
        })}
      </div>

      {/* FLOATING TIMER */}
      {timeLeft !== null && (
        <div className={`fixed bottom-6 right-6 z-[999] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border backdrop-blur-md transition-colors ${
          timeLeft < 300 
            ? 'bg-red-500/90 border-red-400 text-white animate-pulse shadow-red-500/30' 
            : 'bg-white/90 dark:bg-gray-800/90 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white'
        }`}>
          <Clock className={`w-5 h-5 ${timeLeft < 300 ? 'text-white' : 'text-indigo-500 dark:text-indigo-400'}`} />
          <span className="font-bold text-xl font-mono tracking-tight">
            {formatTime(timeLeft)}
          </span>
        </div>
      )}
    </div>
  );
}
