"use client";

import { useState, useEffect, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { saveAnswerAction, toggleFlagAction, submitAttemptAction } from "@/lib/actions/attempts";
import { SUBJECT_LABELS, SUBJECT_COLORS } from "@/lib/types";

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
  accessCode
}: any) {
  const [answers, setAnswers] = useState(initialAnswers);
  const [isPending, startTransition] = useTransition();
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Group questions by subject
  const subjects = ["MATH", "FRENCH", "ENGLISH", "GENERAL_CULTURE"];
  
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      let target = 0;
      
      if (timeMode === "ABSOLUTE" && endsAt) {
        target = endsAt;
      } else {
        target = startedAt + (durationMin * 60 * 1000);
      }
      
      const diff = Math.max(0, Math.floor((target - now) / 1000));
      setTimeLeft(diff);
      
      if (diff === 0) {
        clearInterval(timer);
        handleSubmit(true);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [endsAt, startedAt, durationMin, timeMode]);

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
          {timeLeft !== null && (
            <div className={`font-bold text-lg font-mono ${timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-gray-900 dark:text-white'}`}>
              {formatTime(timeLeft)}
            </div>
          )}
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
                {subjectQuestions.map((q: any, i: number) => {
                  const passage = q.passageId ? passages.find((p: any) => p.id === q.passageId) : null;
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
                      {passage && (
                        <div style={{ 
                          background: "var(--bg-muted)", padding: 20, borderRadius: "var(--radius-sm)", 
                          marginBottom: 20, fontSize: "0.9375rem", lineHeight: 1.6
                        }}>
                          <h4 style={{ margin: "0 0 12px 0", fontWeight: 600 }}>{passage.title}</h4>
                          <div style={{ whiteSpace: "pre-wrap", color: "var(--text-secondary)" }}>{passage.content}</div>
                        </div>
                      )}
                      
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
