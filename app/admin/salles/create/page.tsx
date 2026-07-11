import { getSession } from "@/lib/session";
import { CreateRoomForm } from "./form";

export const metadata = { title: "Créer une salle" };

export default async function CreateRoomPage() {
  await getSession(); // Guarded by layout

  return (
    <main className="page">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 4 }}>Créer une nouvelle salle</h1>
        <p style={{ color: "var(--text-secondary)" }}>Configurez les paramètres de l'épreuve et la répartition des questions.</p>
      </div>

      <div className="card" style={{ padding: 32, maxWidth: 800, margin: "0 auto" }}>
        <CreateRoomForm />
      </div>
    </main>
  );
}
