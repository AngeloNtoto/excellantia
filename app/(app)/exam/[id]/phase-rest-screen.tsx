"use client";

import { useEffect, useState } from "react";
import { Subject, SUBJECT_LABELS, SUBJECT_COLORS } from "@/lib/types";
import { Layers, Clock, CheckCircle2, ArrowRight, Sparkles, Coffee } from "lucide-react";

export function PhaseRestScreen({
  completedSubject,
  nextSubject,
  nextPhaseStartsAt,
  phaseNumber,
  totalPhases,
  onPhaseTimeUp,
}: {
  completedSubject: Subject;
  nextSubject?: Subject;
  nextPhaseStartsAt: number; // timestamp in ms
  phaseNumber: number;
  totalPhases: number;
  onPhaseTimeUp: () => void;
}) {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    return Math.max(0, Math.floor((nextPhaseStartsAt - Date.now()) / 1000));
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.floor((nextPhaseStartsAt - Date.now()) / 1000));
      setSecondsRemaining(remaining);
      if (remaining <= 0) {
        clearInterval(timer);
        onPhaseTimeUp();
      }
    }, 500);

    return () => clearInterval(timer);
  }, [nextPhaseStartsAt, onPhaseTimeUp]);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "75vh",
        padding: "32px 16px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 560,
          background: "var(--bg-card, #ffffff)",
          border: "1px solid var(--border, #e2e8f0)",
          borderRadius: 24,
          padding: "36px 28px",
          boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.08)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
        }}
      >
        {/* Phase Badge & Icon */}
        <div
          style={{
            width: 54,
            height: 54,
            borderRadius: 16,
            background: "linear-gradient(135deg, #f59e0b, #d97706)",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 10px 20px -5px rgba(245, 158, 11, 0.4)",
          }}
        >
          <Coffee className="w-6 h-6" />
        </div>

        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 12px",
              borderRadius: 20,
              background: "rgba(245, 158, 11, 0.1)",
              border: "1px solid rgba(245, 158, 11, 0.25)",
              color: "#f59e0b",
              fontSize: "0.75rem",
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            <Layers className="w-3.5 h-3.5" />
            Régime Newton — Phase {phaseNumber} / {totalPhases}
          </div>

          <h2 style={{ margin: "0 0 6px", fontSize: "1.35rem", fontWeight: 800, color: "var(--text-primary)" }}>
            Phase {SUBJECT_LABELS[completedSubject]} terminée !
          </h2>
          <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--text-secondary)", maxWidth: 420 }}>
            Vous avez répondu à toutes les questions de cette matière en avance. Profitez de cet intervalle de repos avant le lancement de la phase suivante.
          </p>
        </div>

        {/* Large Countdown */}
        <div
          style={{
            background: "var(--bg-muted, #f8fafc)",
            border: "1px solid var(--border, #e2e8f0)",
            borderRadius: 18,
            padding: "20px 32px",
            width: "100%",
            maxWidth: 320,
          }}
        >
          <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Lancement de la phase suivante dans
          </div>
          <div
            style={{
              fontSize: "2.8rem",
              fontWeight: 900,
              fontFamily: "monospace",
              color: "#f59e0b",
              marginTop: 4,
            }}
          >
            {formatCountdown(secondsRemaining)}
          </div>
        </div>

        {/* Next Subject Banner */}
        {nextSubject && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 18px",
              background: "rgba(99, 102, 241, 0.08)",
              border: "1px solid rgba(99, 102, 241, 0.2)",
              borderRadius: 12,
              fontSize: "0.85rem",
              color: "var(--text-primary)",
            }}
          >
            <ArrowRight className="w-4 h-4 text-indigo-500" />
            <span>
              Prochaine matière : <strong style={{ color: SUBJECT_COLORS[nextSubject] }}>{SUBJECT_LABELS[nextSubject]}</strong>
            </span>
          </div>
        )}

        <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
          La transition vers la suite se fera automatiquement dès l'expiration du décompte.
        </div>
      </div>
    </div>
  );
}
