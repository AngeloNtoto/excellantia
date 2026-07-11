"use client";

import { useState, useTransition } from "react";
import { grantRoomAccessAction } from "@/lib/actions/rooms";

export function AccessCodeForm({ roomId }: { roomId: string }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const normalizedCode = code.trim().toUpperCase();
    if (!normalizedCode) return;
    
    startTransition(async () => {
      const fd = new FormData();
      fd.set("code", normalizedCode);
      fd.set("roomId", roomId);
      const res = await grantRoomAccessAction(fd);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="access-code-form">
      <input
        type="text"
        className="input"
        placeholder="Code d'accès"
        value={code}
        onChange={(e) => {
          setCode(e.target.value.trimStart().toUpperCase());
          setError("");
        }}
      />
      <button type="submit" className="btn btn-primary" disabled={isPending || !code.trim()}>
        {isPending ? "..." : "Valider"}
      </button>
      {error && <div style={{ color: "var(--error)", fontSize: "0.875rem", marginTop: 8, width: "100%" }}>{error}</div>}
    </form>
  );
}
