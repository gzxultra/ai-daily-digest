import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Sun, Moon, Globe, Search, X, Github } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface HeaderProps {
  onSearch?: (query: string) => void;
}

export default function Header({ onSearch }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLang } = useLanguage();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setSearchQuery("");
        onSearch?.("");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onSearch]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  const clearSearch = () => {
    setSearchQuery("");
    onSearch?.("");
    setSearchOpen(false);
  };

  return (
    <>
      <div className="h-[2px] bg-gradient-to-r from-primary via-primary/60 to-transparent" />
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="container flex items-center justify-between h-14">
          <a href="." className="flex items-center gap-2.5 group shrink-0">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-foreground text-background group-hover:scale-105 transition-transform duration-200">
              <span className="text-sm font-black" style={{ fontFamily: "'Space Grotesk', monospace" }}>AI</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[15px] font-bold tracking-tight leading-none" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Daily Digest
              </span>
              <span className="text-[10px] text-muted-foreground font-medium tracking-widest uppercase mt-0.5">
                {lang === "zh" ? "每日 AI 情报" : "Intelligence Brief"}
              </span>
            </div>
          </a>

          <div className="flex-1 flex justify-center px-4">
            {searchOpen && (
              <div className="relative w-full max-w-md animate-fade-in-up" style={{ animationDuration: "0.2s" }}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder={lang === "zh" ? "搜索新闻..." : "Search stories..."}
                  className="w-full h-9 pl-9 pr-9 rounded-lg bg-secondary/80 border border-border/60 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
                />
                {searchQuery && (
                  <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => searchOpen ? clearSearch() : setSearchOpen(true)}
              className="flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200"
              aria-label={lang === "zh" ? "搜索" : "Search"}
              title={`${lang === "zh" ? "搜索" : "Search"} (⌘K)`}
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200"
              aria-label={lang === "zh" ? "Switch to English" : "切换到中文"}
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{lang === "zh" ? "EN" : "中文"}</span>
            </button>
            <div className="w-px h-4 bg-border mx-0.5" />
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <a
              href="https://github.com/gzxultra/ai-daily-digest"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200"
              aria-label="GitHub Repository"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>
    </>
  );
}
