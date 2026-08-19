"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition, useEffect, useState } from "react";
import { logoutAction } from "@/lib/actions/auth";
import type { SessionUser } from "@/lib/types";
import { useTheme } from "./theme-provider";
import { RegimesInfoModal } from "./regimes-info-modal";
import {
  LogOut,
  Sun,
  Moon,
  LayoutDashboard,
  Building2,
  BookOpen,
  GraduationCap,
  Users,
  Menu,
  X,
  Timer,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface NavbarProps {
  user: SessionUser;
}

const CANDIDATE_LINKS = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/rooms", label: "Salles d'évaluation", icon: Building2 },
  { href: "/training", label: "Entraînement", icon: BookOpen },
];

const ADMIN_LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/salles", label: "Salles", icon: Building2 },
  { href: "/admin/contenus", label: "Contenus & Questions", icon: BookOpen },
  { href: "/admin/candidats", label: "Candidats", icon: Users },
];

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [regimesModalOpen, setRegimesModalOpen] = useState(false);
  const links = user.role === "ADMIN" ? ADMIN_LINKS : CANDIDATE_LINKS;

  useEffect(() => setMounted(true), []);

  // Fermer le menu mobile lors d'un changement d'URL
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 w-full border-b border-slate-200/80 dark:border-white/10 bg-white/85 dark:bg-slate-950/85 backdrop-blur-md transition-all">
      <div className="flex h-16 items-center justify-between px-3 sm:px-6 max-w-7xl mx-auto">
        {/* Logo & Mobile Menu Toggle */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 active:scale-95 transition-all"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menu de navigation"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link
            href={user.role === "ADMIN" ? "/admin" : "/dashboard"}
            className="flex items-center gap-2.5 sm:gap-3 group select-none"
          >
            <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-all duration-300 group-hover:scale-105">
              <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>

            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white">
                PreExcellantia
              </span>
              {user.role === "ADMIN" && (
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  Admin
                </span>
              )}
            </div>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1 bg-slate-100/70 dark:bg-slate-900/70 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-800 absolute left-1/2 -translate-x-1/2">
          {links.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/admin" && link.href !== "/dashboard" && pathname.startsWith(link.href));
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors duration-200 ${
                  isActive
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-active-pill"
                    className="absolute inset-0 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200/80 dark:border-slate-700"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Icon className="w-4 h-4" />
                  {link.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Right Section : Régimes Modal Trigger, Theme Toggle & User Info */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Bouton Guide des Régimes Temporels */}
          <button
            type="button"
            onClick={() => setRegimesModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 border border-indigo-200/60 dark:border-indigo-500/20 transition-all active:scale-95"
            title="Consulter les règles des Régimes et Modes Chrono"
          >
            <Timer className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden sm:inline">Régimes &amp; Chrono</span>
          </button>

          {/* Theme Toggle */}
          {mounted && (
            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Basculer le thème"
              title={theme === "dark" ? "Mode clair" : "Mode sombre"}
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          )}

          <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-800 mx-0.5 hidden sm:block" />

          {/* User Profile Pill */}
          <div className="flex items-center gap-2">
            <div className="hidden lg:flex flex-col items-end text-right">
              <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[140px]">
                {user.fullname}
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {user.role === "ADMIN" ? "Superviseur" : user.code}
              </span>
            </div>

            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-extrabold text-xs shadow-sm">
              {user.fullname.charAt(0).toUpperCase()}
            </div>

            <button
              type="button"
              className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
              disabled={isPending}
              onClick={() => startTransition(() => logoutAction())}
              aria-label="Déconnexion"
              title="Se déconnecter"
            >
              <LogOut className={`w-4 h-4 ${isPending ? "opacity-50 animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ─── MOBILE DRAWER COMPLET & TOUCH-FRIENDLY ─── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-t border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl shadow-xl"
          >
            <div className="px-4 py-4 space-y-4">
              {/* Carte Utilisateur Mobile */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-extrabold text-sm">
                    {user.fullname.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900 dark:text-white">{user.fullname}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {user.role === "ADMIN" ? "Administrateur" : `Code : ${user.code}`}
                    </div>
                  </div>
                </div>

                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                  {user.role}
                </span>
              </div>

              {/* Navigation Links */}
              <div className="space-y-1">
                {links.map((link) => {
                  const isActive = pathname === link.href || (link.href !== "/admin" && link.href !== "/dashboard" && pathname.startsWith(link.href));
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                        isActive
                          ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500"}`} />
                        <span>{link.label}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </Link>
                  );
                })}
              </div>

              {/* Bouton Guide Régimes Temporels Mobile */}
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setRegimesModalOpen(true);
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 font-bold text-xs border border-purple-200/60 dark:border-purple-500/20"
              >
                <div className="flex items-center gap-2.5">
                  <Timer className="w-4 h-4 text-purple-600" />
                  <span>Guide des Régimes &amp; Chrono</span>
                </div>
                <ChevronRight className="w-4 h-4 text-purple-400" />
              </button>

              {/* Action Déconnexion Mobile */}
              <button
                type="button"
                onClick={() => startTransition(() => logoutAction())}
                disabled={isPending}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 font-bold text-xs border border-red-200/60 dark:border-red-500/20 active:scale-95 transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>Se déconnecter</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <RegimesInfoModal
        isOpen={regimesModalOpen}
        onClose={() => setRegimesModalOpen(false)}
      />
    </nav>
  );
}
