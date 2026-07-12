"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface CollapsibleSectionProps {
  title: string;
  count: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function CollapsibleSection({ title, count, children, defaultOpen = true }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div style={{ marginBottom: 32 }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          width: "100%", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between", 
          padding: "16px 20px", 
          background: "var(--bg-muted)", 
          border: "none",
          borderRadius: isOpen ? "var(--radius-md) var(--radius-md) 0 0" : "var(--radius-md)", 
          cursor: "pointer",
          textAlign: "left",
          transition: "all 0.2s"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)" }}>{title}</span>
          <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)", background: "var(--bg-card)", padding: "2px 8px", borderRadius: 12, fontWeight: 600 }}>
            {count} question{count > 1 ? 's' : ''}
          </span>
        </div>
        <div style={{ color: "var(--text-secondary)" }}>
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </button>
      
      {isOpen && (
        <div style={{ padding: "24px 0", display: "flex", flexDirection: "column", gap: 32 }}>
          {children}
        </div>
      )}
    </div>
  );
}
