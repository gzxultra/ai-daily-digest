/*
 * Design: Editorial Magazine Style
 * - Space Grotesk for brand title
 * - Compact sticky header with blur backdrop
 * - Theme & language toggles as pill buttons
 */
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Sun, Moon, Globe, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLang } = useLanguage();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl"
    >
      <div className="container flex items-center justify-between h-16">
        {/* Logo / Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-primary-foreground">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h1
              className="text-lg font-bold tracking-tight leading-none"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              AI Daily Digest
            </h1>
            <p className="text-[11px] text-muted-foreground tracking-wide uppercase">
              {lang === "zh" ? "每日 AI 情报简报" : "Daily Intelligence Briefing"}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                       bg-secondary text-secondary-foreground hover:bg-accent
                       transition-colors duration-200"
          >
            <Globe className="w-3.5 h-3.5" />
            {lang === "zh" ? "EN" : "中文"}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-8 h-8 rounded-full
                       bg-secondary text-secondary-foreground hover:bg-accent
                       transition-colors duration-200"
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
  );
}
