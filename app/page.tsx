import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LoginForm } from "./login-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connexion — Excellantia",
};

export default async function HomePage() {
  const session = await getSession();
  if (session) {
    redirect(session.role === "ADMIN" ? "/admin" : "/dashboard");
  }

  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
        padding: "24px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Logo / Titre */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: "var(--accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              fontSize: 24,
              color: "#fff",
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            E
          </div>
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              color: "var(--text-primary)",
              marginBottom: 8,
            }}
          >
            Excellantia
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem" }}>
            Plateforme de simulation d&apos;épreuves
          </p>
        </div>

        {/* Carte connexion */}
        <div className="card" style={{ padding: 32 }}>
          <h2
            style={{
              fontSize: "1.125rem",
              fontWeight: 600,
              marginBottom: 6,
              color: "var(--text-primary)",
            }}
          >
            Se connecter
          </h2>
          <p
            style={{
              fontSize: "0.875rem",
              color: "var(--text-secondary)",
              marginBottom: 24,
            }}
          >
            Entrez votre code candidat à 14 chiffres.
          </p>
          <LoginForm />
        </div>

        <p
          style={{
            textAlign: "center",
            marginTop: 24,
            fontSize: "0.8125rem",
            color: "var(--text-muted)",
          }}
        >
          Votre code vous a été attribué par un administrateur.
        </p>
      </div>
    </main>
  );
}
