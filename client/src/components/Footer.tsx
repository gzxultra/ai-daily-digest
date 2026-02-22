/*
 * UI: Minimal editorial footer
 * - Clean divider, subtle branding
 * - Source attribution as inline text
 */
import { useLanguage } from "@/contexts/LanguageContext";

export default function Footer() {
  const { lang } = useLanguage();

  return (
    <footer className="border-t border-border mt-12">
      <div className="container py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-6 h-6 rounded bg-foreground text-background">
              <span className="text-[9px] font-black" style={{ fontFamily: "'Space Grotesk', monospace" }}>AI</span>
            </div>
            <span
              className="text-sm font-bold text-foreground tracking-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Daily Digest
            </span>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed max-w-lg">
            {lang === "zh"
              ? "数据来源：AlphaSignal · Ben's Bites · Import AI · TLDR AI · The Batch · Hacker News。内容由 AI 辅助整理，仅供参考。"
              : "Sources: AlphaSignal · Ben's Bites · Import AI · TLDR AI · The Batch · Hacker News. AI-assisted curation, for reference only."}
          </p>

          <p className="text-[11px] text-muted-foreground">
            &copy; 2026
          </p>
        </div>
      </div>
    </footer>
  );
}
