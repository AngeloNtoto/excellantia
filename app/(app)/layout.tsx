import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { Navbar } from "@/app/components/navbar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/");

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <Navbar user={session} />
      <div className="flex-1 pt-16">
        {children}
      </div>
    </div>
  );
}
