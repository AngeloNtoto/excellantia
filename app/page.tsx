import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LoginForm } from "./login-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connexion — PreExcellantia",
};

export default async function HomePage() {
  const session = await getSession();
  if (session) {
    redirect(session.role === "ADMIN" ? "/admin" : "/dashboard");
  }

  return (
    <main className="min-h-[100dvh] relative flex items-center justify-center overflow-hidden bg-[#0c0d12]">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px]" />
        <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-emerald-600/10 blur-[100px]" />
      </div>
      
      {/* Decorative Grid */}
      <div className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none" style={{ backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')" }}></div>
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>

      <div className="relative z-10 w-full max-w-[440px] px-6 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-xl shadow-indigo-500/30 mb-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/20 hover:translate-x-full transition-transform duration-500 ease-in-out -skew-x-12 -ml-4 w-1/2" />
            <span className="text-3xl font-bold text-white tracking-tighter">E</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-3">
            PreExcellantia
          </h1>
          <p className="text-indigo-200/80 text-base font-medium">
            Plateforme de simulation d'épreuves
          </p>
        </div>

        <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-[24px] shadow-2xl ring-1 ring-white/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Accès candidat
          </h2>
          <p className="text-sm text-indigo-200/60 mb-8">
            Saisissez votre identifiant unique à 14 chiffres.
          </p>
          <LoginForm />
        </div>
        
        <p className="text-center mt-10 text-[11px] text-white/40 font-medium tracking-[0.15em] uppercase">
          Code attribué par l'administration
        </p>
      </div>
    </main>
  );
}
