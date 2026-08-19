"use client";

import { useState, useTransition } from "react";
import { deleteRoomAction, deleteManyRoomsAction } from "@/lib/actions/rooms";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ─── Types attendus depuis le server component ────────────────────────────────
export type RoomRow = {
  id: string;
  title: string;
  status: string;
  statusLabel: string;
  visibility: "PUBLIC" | "PRIVATE";
  accessCode: string | null;
  durationMin: number;
  timingRegime?: string;
  clockMode?: string;
  schrodingerMode?: boolean;
  startsAt: string | null;
  creatorName: string;
  totalQuestions: number;
  submittedAttempts: number;
  totalAttempts: number;
};

// ─── Styles constants ─────────────────────────────────────────────────────────
const STATUS_CLASSES: Record<string, string> = {
  RUNNING: "badge-success",
  SCHEDULED: "badge-accent",
  WAITING: "badge-muted",
  CLOSED: "badge-muted",
  CANCELLED: "badge-muted",
};

// ─── Composant principal ──────────────────────────────────────────────────────
export function RoomsTable({ rooms }: { rooms: RoomRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");

  // ── Sélection ──────────────────────────────────────────────────────────────
  const allIds = rooms.map((r) => r.id);
  const allSelected = allIds.length > 0 && allIds.every((id) => selected.has(id));
  const someSelected = selected.size > 0;

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(allIds));
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // ── Suppression individuelle ───────────────────────────────────────────────
  function handleDeleteOne(roomId: string) {
    if (!confirm("Supprimer cette salle et toutes ses données (tentatives, réponses) ? Cette action est irréversible.")) return;
    setError("");
    startTransition(async () => {
      const res = await deleteRoomAction(roomId);
      if (res.error) {
        setError(res.error);
      } else {
        setSelected((prev) => { const n = new Set(prev); n.delete(roomId); return n; });
        router.refresh();
      }
    });
  }

  // ── Suppression en lot ─────────────────────────────────────────────────────
  function handleDeleteMany() {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    if (!confirm(`Supprimer ${ids.length} salle(s) et toutes leurs données ? Cette action est irréversible.`)) return;
    setError("");
    startTransition(async () => {
      const res = await deleteManyRoomsAction(ids);
      if (res.error) {
        setError(res.error);
      } else {
        setSelected(new Set());
        router.refresh();
      }
    });
  }

  if (rooms.length === 0) {
    return (
      <div style={{ padding: 48, textAlign: "center", color: "var(--text-muted)" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🏫</div>
        <p style={{ fontWeight: 600, marginBottom: 4 }}>Aucune salle créée pour le moment.</p>
        <p style={{ fontSize: "0.875rem" }}>Créez votre première salle d'examen pour démarrer.</p>
      </div>
    );
  }

  return (
    <>
      {/* ── Barre d'actions de sélection ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 20px",
          borderBottom: "1px solid var(--border-subtle)",
          minHeight: 56,
          background: someSelected ? "rgba(239,68,68,0.04)" : "transparent",
          transition: "background 0.2s ease",
        }}
      >
        {someSelected ? (
          <>
            <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)" }}>
              {selected.size} salle{selected.size > 1 ? "s" : ""} sélectionnée{selected.size > 1 ? "s" : ""}
            </span>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button
                onClick={() => setSelected(new Set())}
                style={{
                  fontSize: "0.8125rem",
                  padding: "6px 14px",
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                  background: "var(--bg-muted)",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                Désélectionner
              </button>
              <button
                onClick={handleDeleteMany}
                disabled={isPending}
                style={{
                  fontSize: "0.8125rem",
                  padding: "6px 16px",
                  borderRadius: 10,
                  border: "none",
                  background: "var(--danger, #ef4444)",
                  color: "#fff",
                  cursor: isPending ? "not-allowed" : "pointer",
                  fontWeight: 600,
                  opacity: isPending ? 0.6 : 1,
                  transition: "opacity 0.15s",
                }}
              >
                {isPending ? "Suppression…" : `🗑 Supprimer (${selected.size})`}
              </button>
            </div>
          </>
        ) : (
          <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)", fontStyle: "italic" }}>
            Cochez une ou plusieurs salles pour les supprimer en lot.
          </span>
        )}
      </div>

      {/* ── Message d'erreur ── */}
      {error && (
        <div
          style={{
            margin: "12px 20px",
            padding: "10px 16px",
            borderRadius: 10,
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.25)",
            color: "var(--danger, #ef4444)",
            fontSize: "0.875rem",
            fontWeight: 600,
          }}
        >
          {error}
        </div>
      )}

      {/* ── Tableau ── */}
      <div style={{ overflowX: "auto" }}>
        <table className="table" style={{ tableLayout: "auto" }}>
          <thead>
            <tr>
              {/* Checkbox tout sélectionner */}
              <th style={{ width: 44, textAlign: "center" }}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  aria-label="Sélectionner toutes les salles"
                  style={{ width: 16, height: 16, cursor: "pointer", accentColor: "var(--accent, #6366f1)" }}
                />
              </th>
              <th>Titre</th>
              <th>Créateur</th>
              <th>Statut</th>
              <th>Visibilité</th>
              <th>Durée</th>
              <th>Début</th>
              <th title="Questions au total dans la salle">Questions</th>
              <th title="Tentatives soumises / total participants">Participations</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => {
              const isChecked = selected.has(room.id);
              return (
                <tr
                  key={room.id}
                  style={{
                    background: isChecked ? "rgba(99,102,241,0.06)" : undefined,
                    transition: "background 0.15s ease",
                  }}
                >
                  {/* Checkbox sélection */}
                  <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleOne(room.id)}
                      aria-label={`Sélectionner ${room.title}`}
                      style={{ width: 16, height: 16, cursor: "pointer", accentColor: "var(--accent, #6366f1)" }}
                    />
                  </td>

                  {/* Titre */}
                  <td style={{ fontWeight: 500, maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {room.title}
                  </td>

                  {/* Créateur */}
                  <td style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {/* Avatar initiales */}
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 26,
                          height: 26,
                          borderRadius: "50%",
                          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                          color: "#fff",
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {room.creatorName.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
                      </span>
                      <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 130 }}>
                        {room.creatorName}
                      </span>
                    </div>
                  </td>

                  {/* Statut */}
                  <td>
                    <span className={`badge ${STATUS_CLASSES[room.status] ?? "badge-muted"}`}>
                      {room.statusLabel}
                    </span>
                  </td>

                  {/* Visibilité */}
                  <td>
                    {room.visibility === "PRIVATE" ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--warning)", fontSize: "0.875rem", fontWeight: 500, whiteSpace: "nowrap" }}>
                        🔒 Privée
                        {room.accessCode && (
                          <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-secondary)", fontSize: "0.8rem" }}>
                            ({room.accessCode})
                          </span>
                        )}
                      </span>
                    ) : (
                      <span style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>🌍 Publique</span>
                    )}
                  </td>

                  {/* Durée & Régime */}
                  <td style={{ whiteSpace: "nowrap" }}>
                    <div style={{ fontWeight: 600 }}>{room.durationMin} min</div>
                    <div style={{ fontSize: "0.72rem", display: "flex", gap: 4, alignItems: "center", marginTop: 2 }}>
                      <span style={{ color: room.timingRegime === "TESLA" ? "#06b6d4" : room.timingRegime === "NEWTON" ? "#f59e0b" : "#6366f1", fontWeight: 700 }}>
                        {room.timingRegime === "TESLA" ? "⚡ Tesla" : room.timingRegime === "NEWTON" ? "⚙️ Newton" : "🌌 Einstein"}
                      </span>
                      {room.schrodingerMode && (
                        <span style={{ color: "#8b5cf6", fontWeight: 600 }}>+ Sch.</span>
                      )}
                    </div>
                  </td>

                  {/* Date de début */}
                  <td style={{ color: "var(--text-secondary)", fontSize: "0.875rem", whiteSpace: "nowrap" }}>
                    {room.startsAt ?? "—"}
                  </td>

                  {/* Nombre de questions */}
                  <td style={{ textAlign: "center", fontWeight: 600 }}>
                    {room.totalQuestions > 0 ? (
                      <span
                        style={{
                          padding: "2px 10px",
                          borderRadius: 20,
                          background: "rgba(99,102,241,0.1)",
                          color: "#6366f1",
                          fontSize: "0.82rem",
                          fontWeight: 700,
                        }}
                      >
                        {room.totalQuestions} q.
                      </span>
                    ) : (
                      <span style={{ color: "var(--text-muted)" }}>—</span>
                    )}
                  </td>

                  {/* Participations : X terminées / Y total */}
                  <td style={{ textAlign: "center" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                      <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>
                        {room.submittedAttempts}
                        <span style={{ color: "var(--text-muted)", fontWeight: 400, fontSize: "0.8rem" }}>
                          /{room.totalAttempts}
                        </span>
                      </span>
                      {/* Barre de progression */}
                      {room.totalAttempts > 0 && (
                        <div
                          style={{
                            width: 56,
                            height: 4,
                            background: "var(--bg-muted)",
                            borderRadius: 2,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${Math.round((room.submittedAttempts / room.totalAttempts) * 100)}%`,
                              background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
                              borderRadius: 2,
                              transition: "width 0.4s ease",
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td>
                    <div style={{ display: "flex", gap: 8 }}>
                      <Link
                        href={`/admin/salles/${room.id}`}
                        className="btn btn-ghost"
                        style={{ padding: "4px 10px", fontSize: "0.75rem", whiteSpace: "nowrap" }}
                      >
                        Gérer
                      </Link>
                      <button
                        onClick={() => handleDeleteOne(room.id)}
                        disabled={isPending}
                        className="btn btn-ghost"
                        style={{ padding: "4px 10px", fontSize: "0.75rem", color: "var(--danger, #ef4444)", whiteSpace: "nowrap" }}
                      >
                        {isPending ? "…" : "Supprimer"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
