"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { loginAction } from "@/lib/actions/auth";

const CODE_LENGTH = 14;

function normalizeCandidateCode(value: string) {
  return value.replace(/\D/g, "").slice(0, CODE_LENGTH);
}

export function LoginForm() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const isCodeComplete = code.length === CODE_LENGTH;

  const syncCode = useCallback((value: string) => {
    const normalized = normalizeCandidateCode(value);
    setCode(normalized);
    setError((current) => (current ? "" : current));
    if (inputRef.current && inputRef.current.value !== normalized) {
      inputRef.current.value = normalized;
    }
  }, []);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    const syncFromInput = () => syncCode(input.value);
    input.addEventListener("input", syncFromInput);
    input.addEventListener("change", syncFromInput);
    input.addEventListener("keyup", syncFromInput);
    input.addEventListener("paste", syncFromInput);

    return () => {
      input.removeEventListener("input", syncFromInput);
      input.removeEventListener("change", syncFromInput);
      input.removeEventListener("keyup", syncFromInput);
      input.removeEventListener("paste", syncFromInput);
    };
  }, [syncCode]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const submittedCode = normalizeCandidateCode(inputRef.current?.value ?? code);
    syncCode(submittedCode);

    if (submittedCode.length !== CODE_LENGTH) {
      setError("Le code doit contenir exactement 14 chiffres.");
      return;
    }

    startTransition(async () => {
      const fd = new FormData();
      fd.set("code", submittedCode);
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
          name="code"
          ref={inputRef}
          className={`input${error ? " error" : ""}`}
          type="text"
          inputMode="numeric"
          pattern="[0-9]{14}"
          maxLength={32}
          value={code}
          onChange={(e) => syncCode(e.target.value)}
          onInput={(e) => syncCode(e.currentTarget.value)}
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
            style={{ width: `${Math.min(100, (code.length / CODE_LENGTH) * 100)}%` }}
          />
        </div>
        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 4 }}>
          {code.length}/{CODE_LENGTH} chiffres
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
        disabled={isPending}
        aria-disabled={isPending || !isCodeComplete}
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
