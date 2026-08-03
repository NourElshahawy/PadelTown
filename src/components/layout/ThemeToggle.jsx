"use client";
import { useTheme } from "@/hooks/useTheme";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="تبديل المظهر">
      <i className={`fa-solid ${theme === "dark" ? "fa-sun" : "fa-moon"}`}></i>{" "}
    </button>
  );
}
