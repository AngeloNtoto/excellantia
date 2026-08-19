"use client";

import { useEffect, useState } from "react";
import { Clock, ShieldCheck, RefreshCw, CheckCircle2, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface WaitingRoomProps {
  roomTitle: string;
  endsAt: string | null;
  durationMin: number;
}

export function WaitingRoom({ roomTitle, endsAt, durationMin }: WaitingRoomProps) {
  const router = useRouter();
  const [timeLeftSec, setTimeLeftSec] = useState<number>(() => {
    if (!endsAt) return 0;
    const diff = Math.floor((new Date(endsAt).getTime() - Date.now()) / 1000);
    return Math.max(0, diff);
  });
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!endsAt) return;

    const interval = setInterval(() => {
      const diff = Math.floor((new Date(endsAt).getTime() - Date.now()) / 1000);
      if (diff <= 0) {
        setTimeLeftSec(0);
        setIsReady(true);
        clearInterval(interval);
        // Refresh page automatically to reveal results
        setTimeout(() => {
          router.refresh();
        }, 1500);
      } else {
        setTimeLeftSec(diff);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endsAt, router]);

  const hours = Math.floor(timeLeftSec / 3600);
  const minutes = Math.floor((timeLeftSec % 3600) / 60);
  const seconds = timeLeftSec % 60;

  return (
    <main className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6">
      <div
        className="card w-full max-w-xl text-center p-8 sm:p-12 shadow-2xl relative overflow-hidden"
        style={{
          border: "1px solid var(--border)",
          background: "var(--bg-card)",
          borderRadius: 28,
        }}
      >
        {/* Top Glow bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: isReady
              ? "linear-gradient(90deg, #10b981, #059669)"
              : "linear-gradient(90deg, #6366f1, #a855f7)",
          }}
        />

        {/* Status Icon */}
        <div className="flex justify-center mb-6">
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 24,
              background: isReady ? "rgba(16, 185, 129, 0.12)" : "rgba(99, 102, 241, 0.12)",
              color: isReady ? "var(--success, #10b981)" : "var(--accent, #6366f1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: isReady
                ? "0 10px 25px -5px rgba(16, 185, 129, 0.3)"
                : "0 10px 25px -5px rgba(99, 102, 241, 0.3)",
            }}
          >
            {isReady ? <CheckCircle2 className="w-10 h-10" /> : <Clock className="w-10 h-10 animate-pulse" />}
          </div>
        </div>

        {/* Headings */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          Copie enregistrée
        </div>

        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: "0 0 8px", color: "var(--text-primary)" }}>
          {isReady ? "L'épreuve est terminée !" : "Épreuve collective en cours"}
        </h1>

        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: 28, lineHeight: 1.6 }}>
          {isReady ? (
            "Le temps réglementaire est écoulé. Vos résultats, votre rang et le corrigé détaillé sont prêts."
          ) : (
            <>
              Votre copie pour <strong style={{ color: "var(--text-primary)" }}>{roomTitle}</strong> a bien été transmise. Pour préserver l'intégrité du concours, les scores et corrections seront débloqués pour tous les candidats simultanément.
            </>
          )}
        </p>

        {/* Live Countdown Box */}
        {!isReady && endsAt && (
          <div
            style={{
              background: "var(--bg-muted)",
              border: "1px solid var(--border)",
              borderRadius: 20,
              padding: "20px 24px",
              marginBottom: 28,
            }}
          >
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
              Révélation des résultats dans :
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono, monospace)",
                fontSize: "2.5rem",
                fontWeight: 900,
                color: "var(--accent, #6366f1)",
                letterSpacing: "0.05em",
                display: "flex",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {hours > 0 && <span>{String(hours).padStart(2, "0")}:</span>}
              <span>{String(minutes).padStart(2, "0")}:</span>
              <span>{String(seconds).padStart(2, "0")}</span>
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 6 }}>
              Durée officielle de la salle : {durationMin} min
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {isReady ? (
            <button
              type="button"
              onClick={() => router.refresh()}
              className="btn btn-primary"
              style={{ padding: "14px 24px", fontSize: "1rem", fontWeight: 700, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              Afficher mes résultats & le corrigé
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => router.refresh()}
              className="btn btn-ghost"
              style={{ padding: "12px 20px", fontSize: "0.875rem", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              <RefreshCw className="w-4 h-4" />
              Actualiser le statut
            </button>
          )}

          <a
            href="/dashboard"
            style={{ fontSize: "0.85rem", color: "var(--text-muted)", textDecoration: "none", marginTop: 6 }}
          >
            ← Retourner au tableau de bord
          </a>
        </div>
      </div>
    </main>
  );
}
