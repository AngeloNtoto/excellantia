"use client";

import { useState, useTransition } from "react";
import { loginAction } from "@/lib/actions/auth";

export function LoginForm() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const isCodeComplete = code.length === 14;

  function normalizeCode(value: string) {
    return value.replace(/\D/g, "").slice(0, 14);
  }

  function handleCodeInput(value: string) {
    setCode(normalizeCode(value));
    if (error) setError("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isCodeComplete) {
      setError("Le code doit contenir exactement 14 chiffres.");
      return;
    }
    startTransition(async () => {
      const fd = new FormData();
      fd.set("code", code);
      const result = await loginAction(fd);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <label
          htmlFor="code-input"
          style={{
            display: "block",
            fontSize: "0.8125rem",
            fontWeight: 500,
            color: "var(--text-secondary)",
            marginBottom: 6,
          }}
        >
          Code candidat
        </label>
        <input
          id="code-input"
          className={`input${error ? " error" : ""}`}
          type="tel"
          inputMode="numeric"
          pattern="[0-9]{14}"
          maxLength={14}
          value={code}
          onChange={(e) => handleCodeInput(e.target.value)}
          onInput={(e) => handleCodeInput(e.currentTarget.value)}
          autoComplete="off"
          autoFocus
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "1.125rem",
            letterSpacing: "0.12em",
          }}
        />
        {/* Barre de progression (14 chiffres) */}
        <div className="progress-bar" style={{ marginTop: 8 }}>
          <div
            className="progress-fill"
            style={{ width: `${Math.min(100, (code.length / 14) * 100)}%` }}
          />
        </div>
        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 4 }}>
          {code.length}/14 chiffres
        </p>
      </div>

      {error && (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: "var(--radius-sm)",
            background: "var(--error-light)",
            color: "var(--error)",
            fontSize: "0.875rem",
            border: "1px solid rgba(220,38,38,0.2)",
          }}
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        className="btn btn-primary"
        disabled={isPending || !isCodeComplete}
        style={{ height: 44, fontSize: "0.9375rem" }}
      >
        {isPending ? (
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="loader" style={{ width: 16, height: 16 }} />
            Connexion…
          </span>
        ) : (
          "Se connecter"
        )}
      </button>
    </form>
  );
}
