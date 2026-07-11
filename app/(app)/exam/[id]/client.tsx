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
  timeMode
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
      else window.location.href = window.location.pathname.replace(attemptId, `correction/${attemptId}`);
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
      <div style={{
        position: "sticky", top: 0, zIndex: 100, background: "rgba(var(--bg-card), 0.9)",
        backdropFilter: "blur(10px)", borderBottom: "1px solid var(--border)",
        padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 700 }}>Excellantia</h2>
          <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
            <span style={{ background: "var(--bg-muted)", padding: "4px 10px", borderRadius: 100 }}>
              {answeredCount} / {questions.length} rep.
            </span>
          </div>
        </div>
        
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          {timeLeft !== null && (
            <div style={{ 
              fontWeight: 700, fontSize: "1.125rem", fontFamily: "var(--font-mono)",
              color: timeLeft < 300 ? "var(--error)" : "var(--text-primary)" 
            }}>
              {formatTime(timeLeft)}
            </div>
          )}
          <button className="btn btn-primary" onClick={() => handleSubmit(false)} disabled={isPending}>
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
