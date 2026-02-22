/*
 * UI: Clean editorial hero
 * - Full-width with subtle gradient, no heavy background image
 * - Large bold date + story count
 * - Source list as inline text, not badges
 * - Asymmetric layout with decorative element
 */
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

const SOURCES = [
  "AlphaSignal", "Ben's Bites", "Import AI",
  "TLDR AI", "The Batch", "Hacker News"
];

interface HeroSectionProps {
  newsCount: number;
  date: string;
}

export default function HeroSection({ newsCount, date }: HeroSectionProps) {
  const { lang } = useLanguage();

  return (
    <section className="relative overflow-hidden bg-foreground text-background">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* Decorative gradient orb */}
      <div className="absolute -right-32 -top-32 w-96 h-96 rounded-full bg-primary/20 blur-[120px]" />
      <div className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full bg-primary/10 blur-[80px]" />

      <div className="relative container py-12 sm:py-16 lg:py-20">
        <div className="max-w-3xl">
          {/* Edition label */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="h-px flex-1 max-w-[40px] bg-primary" />
            <span className="text-xs font-semibold text-primary tracking-widest uppercase">
              {lang === "zh" ? "每日精选" : "Daily Edition"}
            </span>
          </motion.div>

          {/* Date as main headline */}
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-[1.1] mb-5 tracking-tight"
            style={{ fontFamily: "'Space Grotesk', 'Noto Sans SC', sans-serif" }}
          >
            {date}
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-background/60 leading-relaxed mb-8 max-w-xl"
          >
            {lang === "zh"
              ? `${newsCount} 条精选硬核 AI 资讯 — 聚焦技术突破、开源项目、模型发布与开发者工具。`
              : `${newsCount} curated high-signal AI stories — technical breakthroughs, open source, model releases & dev tools.`}
          </motion.p>

          {/* Source list */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-background/40"
          >
            <span className="font-medium text-background/50 mr-1">
              {lang === "zh" ? "来源" : "Sources"}:
            </span>
            {SOURCES.map((src, i) => (
              <span key={src}>
                <span className="text-background/55 font-medium hover:text-primary transition-colors duration-200">
                  {src}
                </span>
                {i < SOURCES.length - 1 && <span className="text-background/25 mx-0.5">·</span>}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
