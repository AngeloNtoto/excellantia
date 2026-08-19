"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children, defaultTheme = "dark" }: { children: React.ReactNode; defaultTheme?: Theme }) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("theme");
    const initialTheme = storedTheme === "light" || storedTheme === "dark" ? storedTheme : defaultTheme;
    setThemeState(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, [defaultTheme]);

  function setTheme(nextTheme: Theme) {
    setThemeState(nextTheme);
    window.localStorage.setItem("theme", nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  }

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
}
