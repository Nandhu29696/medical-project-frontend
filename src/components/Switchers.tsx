import { Languages, Moon, Sun } from "lucide-react";

import { LANGUAGES, useI18n, type Language } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      className="btn-ghost btn-sm h-9 w-9 !px-0"
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      title={theme === "dark" ? "Light mode" : "Dark mode"}
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}

export function LanguageSwitcher() {
  const { language, setLanguage } = useI18n();
  return (
    <label className="flex items-center gap-1 rounded-lg px-2 text-slate-500 hover:bg-slate-100">
      <Languages size={15} aria-hidden="true" />
      <span className="sr-only">Language</span>
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
        className="h-9 cursor-pointer bg-transparent pr-1 text-xs font-medium text-slate-600 focus:outline-none"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
    </label>
  );
}
