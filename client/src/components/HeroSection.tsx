import { useLanguage } from "@/contexts/LanguageContext";
import type { CrawlLog } from "@/data/news";
import { Newspaper, Clock, Layers, Zap } from "lucide-react";

const SOURCES = [
  "AlphaSignal", "Ben's Bites", "Import AI",
  "TLDR AI", "The Batch", "Hacker News"
];

interface HeroSectionProps {
  newsCount: number;
  date: string;
  crawlLog?: CrawlLog;
}

export default function HeroSection({ newsCount, date, crawlLog }: HeroSectionProps) {
  const { lang } = useLanguage();

  const stats = [
    {
      icon: Newspaper,
      value: newsCount,
      label: lang === "zh" ? "精选资讯" : "Stories",
    },
    {
      icon: Layers,
      value: crawlLog?.rawArticles ?? "—",
      label: lang === "zh" ? "来源文章" : "Sources Scanned",
    },
    {
      icon: Zap,
      value: crawlLog ? `${Math.round(crawlLog.elapsedSeconds)}s` : "—",
      label: lang === "zh" ? "处理耗时" : "Processing",
    },
    {
      icon: Clock,
      value: crawlLog
        ? new Date(crawlLog.fetchedAt).toLocaleTimeString(lang === "zh" ? "zh-CN" : "en-US", {
            hour: "2-digit",
            minute: "2-digit",
            timeZoneName: "short",
          })
        : "—",
      label: lang === "zh" ? "更新时间" : "Last Updated",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-foreground text-background" role="banner">
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Decorative gradient orbs */}
      <div className="absolute -right-32 -top-32 w-96 h-96 rounded-full bg-primary/20 blur-[120px]" />
      <div className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full bg-primary/10 blur-[80px]" />

      <div className="relative container py-10 sm:py-14 lg:py-16">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
          {/* Left: Main content */}
          <div className="max-w-2xl animate-fade-in-up">
            {/* Edition label */}
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 max-w-[40px] bg-primary" />
              <span className="text-xs font-semibold text-primary tracking-widest uppercase">
                {lang === "zh" ? "每日精选" : "Daily Edition"}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-dot" />
                LIVE
              </span>
            </div>

            {/* Date as main headline */}
            <h1
              className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-[1.1] mb-4 tracking-tight"
              style={{ fontFamily: "'Space Grotesk', 'Noto Sans SC', sans-serif" }}
            >
              {date}
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-base text-background/55 leading-relaxed mb-6 max-w-xl">
              {lang === "zh"
                ? `${newsCount} 条精选硬核 AI 资讯 — 聚焦技术突破、开源项目、模型发布与开发者工具。`
                : `${newsCount} curated high-signal AI stories — technical breakthroughs, open source, model releases & dev tools.`}
            </p>

            {/* Source list */}
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-background/40">
              <span className="font-medium text-background/50 mr-1">
                {lang === "zh" ? "来源" : "Sources"}:
              </span>
              {SOURCES.map((src, i) => (
                <span key={src}>
                  <span className="text-background/55 font-medium">{src}</span>
                  {i < SOURCES.length - 1 && <span className="text-background/25 mx-0.5">·</span>}
                </span>
              ))}
            </div>
          </div>

          {/* Right: Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 lg:gap-2.5 lg:w-56 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col gap-1 px-3.5 py-3 rounded-lg bg-background/[0.06] border border-background/[0.08] backdrop-blur-sm"
              >
                <div className="flex items-center gap-1.5">
                  <stat.icon className="w-3 h-3 text-primary" />
                  <span className="text-[10px] text-background/45 font-medium uppercase tracking-wider">
                    {stat.label}
                  </span>
                </div>
                <span className="text-lg font-bold text-background/90 leading-none" style={{ fontFamily: "'Space Grotesk', monospace" }}>
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
