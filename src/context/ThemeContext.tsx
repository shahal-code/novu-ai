import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

interface ThemeContextType {
  darkMode: boolean;
  toggleTheme: () => void;
  setTheme: (theme: "dark" | "light" | "system") => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem("chat.theme");
    if (savedTheme) return savedTheme === "dark";
    return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches || false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    document.documentElement.style.colorScheme = darkMode ? "dark" : "light";
    localStorage.setItem("chat.theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === "chat.theme" && event.newValue) {
        setDarkMode(event.newValue === "dark");
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const toggleTheme = useCallback(() => {
    setDarkMode((prev) => !prev);
  }, []);

  const setTheme = useCallback((theme: "dark" | "light" | "system") => {
    if (theme === "system") {
      setDarkMode(window.matchMedia?.("(prefers-color-scheme: dark)")?.matches || false);
      return;
    }
    setDarkMode(theme === "dark");
  }, []);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
};
