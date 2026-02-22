/*
 * UI: Premium editorial news card
 * - Featured: full-width with large type, left color accent
 * - Regular: clean card with top color line, clear hierarchy
 * - Expanded summaries (3-5 sentences) shown with proper line clamping
 * - "via Source" shown as inline label
 * - Hover: subtle lift + border color shift
 */
import { useLanguage } from "@/contexts/LanguageContext";
import type { NewsItem } from "@/data/news";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

interface NewsCardProps {
  item: NewsItem;
  index: number;
  featured?: boolean;
}

export default function NewsCard({ item, index, featured = false }: NewsCardProps) {
  const { t, lang } = useLanguage();

  if (featured) {
    return (
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="group relative bg-card rounded-lg border border-border overflow-hidden
                   hover:border-border/80 hover:shadow-lg hover:shadow-black/[0.03] dark:hover:shadow-black/20
                   transition-all duration-300"
      >
        {/* Top color accent */}
        <div className="h-1 w-full" style={{ backgroundColor: item.category.color }} />

        <div className="p-6 sm:p-8 lg:p-10">
          {/* Meta row */}
          <div className="flex items-center gap-3 mb-5">
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider"
              style={{
                color: item.category.color,
                backgroundColor: `${item.category.color}12`,
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: item.category.color }}
              />
              {t(item.category)}
            </span>
            <span className="text-xs text-muted-foreground">
              via <span className="font-semibold text-foreground/60">{item.source}</span>
            </span>
          </div>

          {/* Title */}
          <h2
            className="text-xl sm:text-2xl lg:text-[1.65rem] font-extrabold text-card-foreground leading-tight mb-4
                       group-hover:text-primary transition-colors duration-300"
            style={{ fontFamily: "'Space Grotesk', 'Noto Sans SC', sans-serif" }}
          >
            {t(item.title)}
          </h2>

          {/* Summary - show full for featured */}
          <p className="text-[15px] text-muted-foreground leading-[1.75] mb-6 max-w-3xl">
            {t(item.summary)}
          </p>

          {/* Read more link */}
          <a
            href={item.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary
                       hover:gap-2.5 transition-all duration-200"
          >
            {lang === "zh" ? "阅读原文" : "Read Article"}
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.08 + index * 0.04 }}
      className="group relative bg-card rounded-lg border border-border overflow-hidden
                 hover:border-border/80 hover:shadow-md hover:shadow-black/[0.03] dark:hover:shadow-black/20
                 hover:-translate-y-px transition-all duration-300"
    >
      {/* Top color line */}
      <div className="h-0.5 w-full" style={{ backgroundColor: item.category.color }} />

      <div className="p-5 sm:p-6 flex flex-col h-full">
        {/* Meta row */}
        <div className="flex items-center gap-2.5 mb-3.5">
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
            style={{
              color: item.category.color,
              backgroundColor: `${item.category.color}10`,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: item.category.color }}
            />
            {t(item.category)}
          </span>
          <span className="text-[11px] text-muted-foreground">
            via <span className="font-semibold text-foreground/55">{item.source}</span>
          </span>
        </div>

        {/* Title */}
        <h3
          className="text-[15px] sm:text-base font-bold text-card-foreground leading-snug mb-3
                     group-hover:text-primary transition-colors duration-300"
          style={{ fontFamily: "'Space Grotesk', 'Noto Sans SC', sans-serif" }}
        >
          {t(item.title)}
        </h3>

        {/* Summary - clamped to 4 lines for regular cards */}
        <p className="text-[13px] text-muted-foreground leading-[1.7] mb-4 flex-1 line-clamp-4">
          {t(item.summary)}
        </p>

        {/* Read more link */}
        <a
          href={item.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary
                     hover:gap-2 transition-all duration-200 mt-auto"
        >
          {lang === "zh" ? "阅读原文" : "Read Article"}
          <ArrowUpRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </motion.article>
  );
}
