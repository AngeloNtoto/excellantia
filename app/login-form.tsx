"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { loginAction } from "@/lib/actions/auth";
import { motion, AnimatePresence } from "framer-motion";
import { KeyRound, ArrowRight, Loader2, AlertCircle } from "lucide-react";

const CODE_LENGTH = 14;

function normalizeCandidateCode(value: string) {
  return value.replace(/\D/g, "").slice(0, CODE_LENGTH);
}

export function LoginForm() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isFocused, setIsFocused] = useState(false);
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

  const progress = (code.length / CODE_LENGTH) * 100;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="relative">
        <label
          htmlFor="code-input"
          className="flex items-center gap-2 text-sm font-medium text-indigo-100/80 mb-3"
        >
          <KeyRound className="w-4 h-4 text-indigo-400" />
          Code candidat
        </label>
        
        <div className={`relative flex items-center transition-all duration-300 rounded-xl bg-black/20 border ${isFocused ? 'border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : error ? 'border-red-500/50' : 'border-white/10'} backdrop-blur-sm overflow-hidden group`}>
          <input
            id="code-input"
            name="code"
            ref={inputRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]{14}"
            maxLength={32}
            value={code}
            onChange={(e) => syncCode(e.target.value)}
            onInput={(e) => syncCode(e.currentTarget.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            autoComplete="off"
            autoFocus
            placeholder="00000000000000"
            className="w-full bg-transparent px-4 py-4 text-[1.3rem] tracking-[0.25em] font-mono text-white placeholder-white/20 outline-none transition-all text-center"
          />
        </div>
        
        {/* Animated Progress Bar */}
        <div className="absolute -bottom-4 left-0 right-0">
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              className={`h-full rounded-full ${isCodeComplete ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-indigo-500'}`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          </div>
          <div className="flex justify-between items-center mt-2 px-1">
            <span className="text-[10px] font-medium text-white/40 tracking-widest uppercase">
              Progression
            </span>
            <span className={`text-[11px] font-mono font-medium ${isCodeComplete ? 'text-emerald-400' : 'text-indigo-300'}`}>
              {code.length} / {CODE_LENGTH}
            </span>
          </div>
        </div>
      </div>

      <div className="min-h-[44px] mt-6">
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium"
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button
        type="submit"
        disabled={isPending}
        aria-disabled={isPending || !isCodeComplete}
        className={`group relative flex items-center justify-center gap-3 w-full py-4 px-6 rounded-xl text-[15px] font-semibold transition-all duration-300 overflow-hidden ${
          isCodeComplete && !isPending
            ? 'bg-white text-indigo-950 hover:bg-indigo-50 hover:scale-[1.02] shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]'
            : 'bg-white/5 text-white/30 border border-white/5 cursor-not-allowed'
        }`}
      >
        {isPending ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Authentification...</span>
          </>
        ) : (
          <>
            <span>Accéder à l'examen</span>
            <ArrowRight className={`w-5 h-5 transition-transform duration-300 ${isCodeComplete ? 'group-hover:translate-x-1' : ''}`} />
          </>
        )}
        
        {/* Button Hover Glow Effect */}
        {isCodeComplete && !isPending && (
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
        )}
      </button>
    </form>
  );
}
