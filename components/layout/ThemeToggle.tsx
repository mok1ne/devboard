"use client";

import { useEffect } from "react";
import { useUIStore } from "@/store/board.store";

export function ThemeToggle() {
  const { theme, toggleTheme } = useUIStore();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <button
      className="topbar__icon-btn"
      onClick={toggleTheme}
      title="Toggle theme"
      style={{ fontSize: 16 }}
    >
      {theme === "dark" ? "☀" : "◑"}
    </button>
  );
}