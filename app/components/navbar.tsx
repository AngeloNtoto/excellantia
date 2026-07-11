"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition, useEffect, useState } from "react";
import { logoutAction } from "@/lib/actions/auth";
import type { SessionUser } from "@/lib/types";
import { useTheme } from "next-themes";
import { LogOut, Sun, Moon, LayoutDashboard, Building2, BookOpen, GraduationCap, Users } from "lucide-react";
import { motion } from "framer-motion";

interface NavbarProps {
  user: SessionUser;
}

const CANDIDATE_LINKS = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/rooms", label: "Salles", icon: Building2 },
  { href: "/training", label: "Entraînement", icon: BookOpen },
];

const ADMIN_LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/salles", label: "Salles", icon: Building2 },
  { href: "/admin/candidats", label: "Candidats", icon: Users },
];

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const links = user.role === "ADMIN" ? ADMIN_LINKS : CANDIDATE_LINKS;

  useEffect(() => setMounted(true), []);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 dark:border-white/5 bg-white/70 dark:bg-black/50 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-6 max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link
            href={user.role === "ADMIN" ? "/admin" : "/dashboard"}
            className="flex items-center gap-3 text-lg font-bold text-gray-900 dark:text-white tracking-tight group"
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-all duration-300">
              <GraduationCap className="w-5 h-5" />
            </div>
            Excellantia
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-2 bg-gray-100/50 dark:bg-white/5 p-1 rounded-2xl border border-gray-200/50 dark:border-white/5">
            {links.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200 ${
                    isActive 
                      ? "text-indigo-600 dark:text-white" 
                      : "text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-white dark:bg-white/10 rounded-xl shadow-sm border border-gray-200/50 dark:border-white/5"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-xl text-gray-500 dark:text-white/70 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          )}
          
          <div className="w-[1px] h-6 bg-gray-200 dark:bg-white/10 mx-1" />

          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[150px]">
                {user.fullname}
              </span>
              {user.role === "ADMIN" && (
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-400/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Admin
                </span>
              )}
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-500/20 dark:to-purple-500/20 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-sm border border-indigo-200/50 dark:border-indigo-500/30">
              {user.fullname.charAt(0)}
            </div>
            
            <button
              className="p-2 text-gray-500 dark:text-white/50 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors ml-1"
              disabled={isPending}
              onClick={() => startTransition(() => logoutAction())}
              aria-label="Logout"
            >
              <LogOut className={`w-5 h-5 ${isPending ? 'opacity-50' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
