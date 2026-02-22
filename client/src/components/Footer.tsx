/*
 * Design: Editorial Magazine Style
 * - Minimal footer with subtle border top
 */
import { useLanguage } from "@/contexts/LanguageContext";
import { Zap } from "lucide-react";

export default function Footer() {
  const { lang } = useLanguage();

  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary text-primary-foreground">
              <Zap className="w-4 h-4" />
            </div>
            <span
              className="text-sm font-bold text-foreground"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              AI Daily Digest
            </span>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            {lang === "zh"
              ? "由 AI 精选整理 · 所有新闻摘要均基于公开报道 · 仅供参考"
              : "AI-curated news digest · Based on public reports · For reference only"}
          </p>

          <p className="text-xs text-muted-foreground">
            &copy; 2026 AI Daily Digest
          </p>
        </div>
      </div>
    </footer>
  );
}
