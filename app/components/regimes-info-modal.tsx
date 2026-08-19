"use client";

import { useState } from "react";
import { TIMING_REGIMES, CHRONO_MODES, TimingRegime, ChronoMode } from "@/lib/types";
import {
  Infinity,
  Layers,
  Zap,
  EyeOff,
  Eye,
  Clock,
  CheckCircle2,
  X,
  Timer,
  Sparkles,
} from "lucide-react";

export function RegimesInfoModal({
  isOpen,
  onClose,
  initialRegime = "EINSTEIN",
}: {
  isOpen: boolean;
  onClose: () => void;
  initialRegime?: TimingRegime;
}) {
  const [activeTab, setActiveTab] = useState<TimingRegime | ChronoMode>(initialRegime);

  if (!isOpen) return null;

  const regimesList: TimingRegime[] = ["EINSTEIN", "NEWTON", "TESLA"];
  const chronoModesList: ChronoMode[] = ["GALILEE", "HEISENBERG", "SCHRODINGER"];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--bg-card, #ffffff)",
          border: "1px solid var(--border, #e2e8f0)",
          borderRadius: 20,
          width: "100%",
          maxWidth: 780,
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          color: "var(--text-primary, #0f172a)",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid var(--border, #e2e8f0)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "linear-gradient(135deg, #6366f1, #3b82f6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
              }}
            >
              <Timer className="w-5 h-5" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700 }}>
                Régimes Temporels &amp; Modes d'Affichage
              </h2>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted, #64748b)" }}>
                Guide officiel des règles de chronométrage et de progression d'Excellantia
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 6,
              borderRadius: 8,
              color: "var(--text-muted, #64748b)",
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div
          style={{
            display: "flex",
            gap: 6,
            padding: "12px 20px 0",
            borderBottom: "1px solid var(--border, #e2e8f0)",
            background: "var(--bg-muted, #f8fafc)",
            overflowX: "auto",
          }}
        >
          {/* Section 1 : Régimes Temporels */}
          {regimesList.map((rKey) => {
            const meta = TIMING_REGIMES[rKey];
            const isActive = activeTab === rKey;
            return (
              <button
                key={rKey}
                type="button"
                onClick={() => setActiveTab(rKey)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 14px",
                  fontSize: "0.825rem",
                  fontWeight: isActive ? 700 : 500,
                  border: "none",
                  borderBottom: `2px solid ${isActive ? meta.color : "transparent"}`,
                  background: "transparent",
                  color: isActive ? meta.color : "var(--text-secondary, #475569)",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s ease",
                }}
              >
                {rKey === "EINSTEIN" && <Infinity className="w-3.5 h-3.5" />}
                {rKey === "NEWTON" && <Layers className="w-3.5 h-3.5" />}
                {rKey === "TESLA" && <Zap className="w-3.5 h-3.5" />}
                <span>{meta.name}</span>
              </button>
            );
          })}

          <div style={{ width: 1, height: 20, background: "var(--border)", alignSelf: "center", margin: "0 4px" }} />

          {/* Section 2 : Modes Chronomètre */}
          {chronoModesList.map((cKey) => {
            const meta = CHRONO_MODES[cKey];
            const isActive = activeTab === cKey;
            return (
              <button
                key={cKey}
                type="button"
                onClick={() => setActiveTab(cKey)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 14px",
                  fontSize: "0.825rem",
                  fontWeight: isActive ? 700 : 500,
                  border: "none",
                  borderBottom: `2px solid ${isActive ? meta.color : "transparent"}`,
                  background: "transparent",
                  color: isActive ? meta.color : "var(--text-secondary, #475569)",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s ease",
                }}
              >
                {cKey === "GALILEE" && <Clock className="w-3.5 h-3.5" />}
                {cKey === "HEISENBERG" && <Eye className="w-3.5 h-3.5" />}
                {cKey === "SCHRODINGER" && <EyeOff className="w-3.5 h-3.5" />}
                <span>{meta.name}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
          {(() => {
            const isRegime = regimesList.includes(activeTab as TimingRegime);
            const meta = isRegime
              ? TIMING_REGIMES[activeTab as TimingRegime]
              : CHRONO_MODES[activeTab as ChronoMode];

            return (
              <>
                {/* Hero Card */}
                <div
                  style={{
                    background: meta.bgLight,
                    border: `1px solid ${meta.borderLight}`,
                    borderRadius: 16,
                    padding: 20,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: meta.color,
                          color: "#ffffff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {activeTab === "EINSTEIN" && <Infinity className="w-4 h-4" />}
                        {activeTab === "NEWTON" && <Layers className="w-4 h-4" />}
                        {activeTab === "TESLA" && <Zap className="w-4 h-4" />}
                        {activeTab === "GALILEE" && <Clock className="w-4 h-4" />}
                        {activeTab === "HEISENBERG" && <Eye className="w-4 h-4" />}
                        {activeTab === "SCHRODINGER" && <EyeOff className="w-4 h-4" />}
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)" }}>
                          {meta.name} — <span style={{ color: meta.color }}>{meta.subtitle}</span>
                        </h3>
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        padding: "3px 10px",
                        borderRadius: 20,
                        background: meta.color,
                        color: "#ffffff",
                      }}
                    >
                      {isRegime ? "Régime Temporel" : "Mode Chronomètre"}
                    </span>
                  </div>

                  <p style={{ margin: "6px 0 0", fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                    {meta.description}
                  </p>
                </div>

                {/* Rules list */}
                <div>
                  <h4 style={{ fontSize: "0.85rem", fontWeight: 700, margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>
                    Règles &amp; Spécificités d'application
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {meta.rules.map((rule, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 10,
                          padding: "10px 14px",
                          background: "var(--bg-muted, #f8fafc)",
                          border: "1px solid var(--border, #e2e8f0)",
                          borderRadius: 10,
                          fontSize: "0.85rem",
                        }}
                      >
                        <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: meta.color, marginTop: 2 }} />
                        <span style={{ color: "var(--text-primary)" }}>{rule}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            );
          })()}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid var(--border, #e2e8f0)",
            display: "flex",
            justifyContent: "flex-end",
            background: "var(--bg-muted, #f8fafc)",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="btn btn-primary"
            style={{ padding: "8px 20px", fontSize: "0.875rem", borderRadius: 10 }}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
