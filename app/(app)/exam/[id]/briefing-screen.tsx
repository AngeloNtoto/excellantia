"use client";

import { useState } from "react";
import {
  TIMING_REGIMES,
  CHRONO_MODES,
  TimingRegime,
  ChronoMode,
  Subject,
  SUBJECT_LABELS,
} from "@/lib/types";
import { RegimesInfoModal } from "@/app/components/regimes-info-modal";
import {
  Infinity,
  Layers,
  Zap,
  EyeOff,
  Eye,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  Info,
  Shield,
  FileQuestion,
  Sparkles,
  Timer,
} from "lucide-react";

export function BriefingScreen({
  roomTitle,
  timingRegime = "EINSTEIN",
  chronoMode = "GALILEE",
  durationMin,
  totalQuestions,
  bySubject,
  onStartExam,
}: {
  roomTitle: string;
  timingRegime?: TimingRegime;
  chronoMode?: ChronoMode;
  durationMin: number;
  totalQuestions: number;
  bySubject?: Record<Subject, number>;
  onStartExam: () => void;
}) {
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const regimeMeta = TIMING_REGIMES[timingRegime] || TIMING_REGIMES.EINSTEIN;
  const chronoMeta = CHRONO_MODES[chronoMode] || CHRONO_MODES.GALILEE;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-app, #f8fafc)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 680,
          background: "var(--bg-card, #ffffff)",
          border: "1px solid var(--border, #e2e8f0)",
          borderRadius: 24,
          padding: "32px",
          boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.08)",
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        {/* Header with Title & Room Name */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 14px",
              borderRadius: 20,
              background: "rgba(99, 102, 241, 0.1)",
              border: "1px solid rgba(99, 102, 241, 0.2)",
              color: "var(--accent, #6366f1)",
              fontSize: "0.8rem",
              fontWeight: 700,
              marginBottom: 12,
            }}
          >
            <Shield className="w-3.5 h-3.5" />
            Consignes & Protocole d'Épreuve
          </div>

          <h1 style={{ margin: "0 0 6px", fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary, #0f172a)" }}>
            {roomTitle}
          </h1>
          <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--text-muted, #64748b)" }}>
            Veuillez lire attentivement les spécificités du régime temporel avant de débuter l'évaluation.
          </p>
        </div>

        {/* Highlight Regime Card */}
        <div
          style={{
            background: regimeMeta.bgLight,
            border: `1.5px solid ${regimeMeta.borderLight}`,
            borderRadius: 18,
            padding: "20px 22px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: regimeMeta.color,
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 8px 16px -4px ${regimeMeta.color}66`,
                }}
              >
                {timingRegime === "EINSTEIN" && <Infinity className="w-5 h-5" />}
                {timingRegime === "NEWTON" && <Layers className="w-5 h-5" />}
                {timingRegime === "TESLA" && <Zap className="w-5 h-5" />}
              </div>

              <div>
                <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: regimeMeta.color }}>
                  Régime Temporel Appliqué
                </div>
                <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text-primary)" }}>
                  {regimeMeta.name} — <span style={{ color: regimeMeta.color }}>{regimeMeta.subtitle}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setInfoModalOpen(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                background: "var(--bg-card, #ffffff)",
                border: `1px solid ${regimeMeta.borderLight}`,
                borderRadius: 10,
                padding: "6px 12px",
                fontSize: "0.78rem",
                fontWeight: 600,
                color: regimeMeta.color,
                cursor: "pointer",
              }}
            >
              <Info className="w-3.5 h-3.5" />
              Détails complets
            </button>
          </div>

          <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
            {regimeMeta.summary}
          </p>
        </div>

        {/* Chrono Display Mode Banner */}
        {chronoMode !== "GALILEE" && (
          <div
            style={{
              background: chronoMeta.bgLight,
              border: `1.5px solid ${chronoMeta.borderLight}`,
              borderRadius: 16,
              padding: "14px 18px",
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: chronoMeta.color,
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {chronoMode === "HEISENBERG" ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </div>
            <div>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: chronoMeta.color }}>
                {chronoMeta.name} ({chronoMeta.subtitle})
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: 2 }}>
                {chronoMode === "HEISENBERG"
                  ? "Le chronomètre apparaît uniquement lors des fenêtres clés (100-95%, 75-70%, 55-50%, 25-20%) puis en continu sous 60s."
                  : "Le chronomètre est 100% masqué. Vous disposez de 2 jokers 'Ouvrir la boîte' (5s de visibilité). Révélation d'urgence automatique sous les 60 secondes."}
              </div>
            </div>
          </div>
        )}

        {/* Summary Stats Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 12,
          }}
        >
          <div
            style={{
              background: "var(--bg-muted, #f8fafc)",
              border: "1px solid var(--border, #e2e8f0)",
              borderRadius: 14,
              padding: "12px 16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600 }}>
              <FileQuestion className="w-3.5 h-3.5" />
              Volume
            </div>
            <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)", marginTop: 4 }}>
              {totalQuestions} <span style={{ fontSize: "0.8rem", fontWeight: 500 }}>questions</span>
            </div>
          </div>

          <div
            style={{
              background: "var(--bg-muted, #f8fafc)",
              border: "1px solid var(--border, #e2e8f0)",
              borderRadius: 14,
              padding: "12px 16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600 }}>
              <Timer className="w-3.5 h-3.5" />
              Durée globale
            </div>
            <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)", marginTop: 4 }}>
              {durationMin} <span style={{ fontSize: "0.8rem", fontWeight: 500 }}>minutes</span>
            </div>
          </div>

          <div
            style={{
              background: "var(--bg-muted, #f8fafc)",
              border: "1px solid var(--border, #e2e8f0)",
              borderRadius: 14,
              padding: "12px 16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600 }}>
              <Clock className="w-3.5 h-3.5" />
              Rythme
            </div>
            <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)", marginTop: 4 }}>
              {timingRegime === "TESLA" ? "1 min/q" : `${Math.round((durationMin * 60) / Math.max(1, totalQuestions))} s/q`}
            </div>
          </div>
        </div>

        {/* Concrete Rules Checklist */}
        <div>
          <h4 style={{ fontSize: "0.85rem", fontWeight: 700, margin: "0 0 10px", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>
            Règles applicables pour cette épreuve
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {regimeMeta.rules.map((rule, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 8,
                  fontSize: "0.825rem",
                  color: "var(--text-secondary)",
                }}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: regimeMeta.color, marginTop: 1 }} />
                <span>{rule}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
          <button
            type="button"
            onClick={onStartExam}
            className="btn btn-primary"
            style={{
              padding: "14px 28px",
              fontSize: "1rem",
              fontWeight: 700,
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              background: `linear-gradient(135deg, ${regimeMeta.color}, var(--accent, #6366f1))`,
              boxShadow: `0 10px 25px -5px ${regimeMeta.color}55`,
            }}
          >
            <Play className="w-5 h-5 fill-current" />
            J'ai compris les consignes — Commencer l'épreuve
          </button>
        </div>
      </div>

      <RegimesInfoModal
        isOpen={infoModalOpen}
        onClose={() => setInfoModalOpen(false)}
        initialRegime={timingRegime}
      />
    </div>
  );
}
