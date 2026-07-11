"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition } from "react";
import { logoutAction } from "@/lib/actions/auth";
import type { SessionUser } from "@/lib/types";

interface NavbarProps {
  user: SessionUser;
}

const CANDIDATE_LINKS = [
  { href: "/dashboard", label: "Tableau de bord" },
  { href: "/rooms", label: "Salles" },
  { href: "/training", label: "Entraînement" },
];

const ADMIN_LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/salles", label: "Salles" },
  { href: "/admin/candidats", label: "Candidats" },
];

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const links = user.role === "ADMIN" ? ADMIN_LINKS : CANDIDATE_LINKS;

  return (
    <nav className="navbar">
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <Link
          href={user.role === "ADMIN" ? "/admin" : "/dashboard"}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontWeight: 700,
            fontSize: "1rem",
            color: "var(--text-primary)",
            letterSpacing: "-0.02em",
          }}
        >
          <span
            style={{
              width: 28,
              height: 28,
              borderRadius: 7,
              background: "var(--accent)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            E
          </span>
          Excellantia
        </Link>

        {/* Nav links */}
        <div style={{ display: "flex", gap: 4 }}>
          {links.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: "6px 12px",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: isActive ? "var(--accent)" : "var(--text-secondary)",
                  background: isActive ? "var(--accent-light)" : "transparent",
                  transition: "all 0.15s",
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* User + déconnexion */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {user.role === "ADMIN" && (
          <span className="badge badge-warning" style={{ fontSize: "0.7rem" }}>
            ADMIN
          </span>
        )}
        <span
          style={{
            fontSize: "0.875rem",
            fontWeight: 500,
            color: "var(--text-secondary)",
            maxWidth: 160,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {user.fullname.split(" ")[0]}
        </span>
        <button
          className="btn btn-ghost"
          style={{ padding: "6px 12px", fontSize: "0.8125rem" }}
          disabled={isPending}
          onClick={() => startTransition(() => logoutAction())}
        >
          {isPending ? "…" : "Déconnexion"}
        </button>
      </div>
    </nav>
  );
}
