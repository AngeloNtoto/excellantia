import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { Navbar } from "@/app/components/navbar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/");

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <Navbar user={session} />
      {children}
    </div>
  );
}
