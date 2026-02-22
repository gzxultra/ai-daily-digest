/*
 * Design: Editorial Magazine Style
 * - Minimal footer with source attribution
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

          <p className="text-xs text-muted-foreground text-center max-w-md">
            {lang === "zh"
              ? "数据来源：AlphaSignal · Ben's Bites · Import AI · TLDR AI · The Batch · Hacker News"
              : "Sources: AlphaSignal · Ben's Bites · Import AI · TLDR AI · The Batch · Hacker News"}
          </p>

          <p className="text-xs text-muted-foreground">
            &copy; 2026 AI Daily Digest
          </p>
        </div>
      </div>
    </footer>
  );
}
