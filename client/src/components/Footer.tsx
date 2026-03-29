import { useLanguage } from "@/contexts/LanguageContext";
import { Github, Rss, ArrowUpRight } from "lucide-react";

export default function Footer() {
  const { lang } = useLanguage();

  const sources = [
    { name: "AlphaSignal", url: "https://alphasignal.ai" },
    { name: "Ben's Bites", url: "https://bensbites.beehiiv.com" },
    { name: "Import AI", url: "https://importai.substack.com" },
    { name: "TLDR AI", url: "https://tldr.tech/ai" },
    { name: "The Batch", url: "https://www.deeplearning.ai/the-batch/" },
    { name: "Hacker News", url: "https://news.ycombinator.com" },
  ];

  return (
    <footer className="border-t border-border mt-12 bg-secondary/30">
      <div className="container py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-foreground text-background">
                <span className="text-[9px] font-black" style={{ fontFamily: "'Space Grotesk', monospace" }}>AI</span>
              </div>
              <span className="text-sm font-bold text-foreground tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Daily Digest
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              {lang === "zh"
                ? "每日自动聚合来自顶级 AI 媒体的最新资讯，由 AI 辅助整理，提供中英双语阅读体验。"
                : "Automatically curated daily from top AI media sources. AI-assisted bilingual digest for staying ahead in artificial intelligence."}
            </p>
            <div className="flex items-center gap-2 pt-1">
              <a
                href="https://github.com/gzxultra/ai-daily-digest"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://gzxultra.github.io/ai-daily-digest/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                aria-label="RSS Feed"
              >
                <Rss className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Sources */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
              {lang === "zh" ? "数据来源" : "Data Sources"}
            </h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              {sources.map((source) => (
                <a
                  key={source.name}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 group"
                >
                  {source.name}
                  <ArrowUpRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ))}
            </div>
          </div>

          {/* About */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
              {lang === "zh" ? "关于" : "About"}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {lang === "zh"
                ? "本站通过 GitHub Actions 每日自动运行，使用 Python 脚本抓取 RSS 源和社区热帖，再由 LLM 生成中英双语摘要。完全开源，欢迎贡献。"
                : "Powered by GitHub Actions running daily. A Python script fetches RSS feeds and community posts, then an LLM generates bilingual summaries. Fully open source — contributions welcome."}
            </p>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground/60">
              <span>React 19</span>
              <span>·</span>
              <span>Tailwind CSS 4</span>
              <span>·</span>
              <span>Vite</span>
              <span>·</span>
              <span>GitHub Pages</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[11px] text-muted-foreground">
            &copy; {new Date().getFullYear()} AI Daily Digest.{" "}
            {lang === "zh" ? "内容由 AI 辅助整理，仅供参考。" : "AI-assisted curation, for reference only."}
          </p>
          <p className="text-[11px] text-muted-foreground/50">
            {lang === "zh" ? "使用 ⌘K 快速搜索" : "Press ⌘K to search"}
          </p>
        </div>
      </div>
    </footer>
  );
}
