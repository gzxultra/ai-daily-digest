/*
 * UI: Refined editorial header
 * - Thin top accent line
 * - Clean brand mark with monospace feel
 * - Minimal controls, generous spacing
 */
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Sun, Moon, Globe } from "lucide-react";
import { motion } from "framer-motion";

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLang } = useLanguage();

  return (
    <>
      {/* Thin accent bar */}
      <div className="h-0.5 bg-gradient-to-r from-primary via-primary/60 to-transparent" />
      <motion.header
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="sticky top-0 z-50 border-b border-border/40 bg-background/90 backdrop-blur-2xl"
      >
        <div className="container flex items-center justify-between h-14">
          {/* Logo / Brand */}
          <a href="." className="flex items-center gap-2.5 group">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-md bg-foreground text-background
                            group-hover:scale-105 transition-transform duration-200">
              <span className="text-sm font-black" style={{ fontFamily: "'Space Grotesk', monospace" }}>AI</span>
            </div>
            <div className="flex flex-col">
              <span
                className="text-[15px] font-bold tracking-tight leading-none"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Daily Digest
              </span>
              <span className="text-[10px] text-muted-foreground font-medium tracking-widest uppercase mt-0.5">
                {lang === "zh" ? "每日 AI 情报" : "Intelligence Brief"}
              </span>
            </div>
          </a>

          {/* Controls */}
          <div className="flex items-center gap-1.5">
            {/* Language Toggle */}
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 h-8 px-3 rounded-md text-xs font-medium
                         text-muted-foreground hover:text-foreground hover:bg-secondary
                         transition-all duration-200"
            >
              <Globe className="w-3.5 h-3.5" />
              {lang === "zh" ? "EN" : "中文"}
            </button>

            {/* Divider */}
            <div className="w-px h-4 bg-border" />

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-8 h-8 rounded-md
                         text-muted-foreground hover:text-foreground hover:bg-secondary
                         transition-all duration-200"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </motion.header>
    </>
  );
}
