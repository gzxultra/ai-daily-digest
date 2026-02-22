/*
 * Design: Editorial Magazine Style
 * - Left color accent bar per category
 * - Hover lift animation
 * - Space Grotesk for titles, Inter for body
 */
import { useLanguage } from "@/contexts/LanguageContext";
import type { NewsItem } from "@/data/news";
import { ExternalLink } from "lucide-react";
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
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="group relative overflow-hidden rounded-2xl bg-card border border-border
                   hover:shadow-xl hover:shadow-primary/5 transition-all duration-500"
      >
        {/* Top color bar */}
        <div
          className="h-1.5 w-full"
          style={{ backgroundColor: item.category.color }}
        />

        <div className="p-6 sm:p-8">
          {/* Category Badge */}
          <div className="flex items-center gap-3 mb-4">
            <span
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white"
              style={{ backgroundColor: item.category.color }}
            >
              {t(item.category)}
            </span>
            <span className="text-xs text-muted-foreground">
              {item.source}
            </span>
          </div>

          {/* Title */}
          <h2
            className="text-xl sm:text-2xl font-bold text-card-foreground leading-tight mb-4
                       group-hover:text-primary transition-colors duration-300"
            style={{ fontFamily: "'Space Grotesk', 'Noto Sans SC', sans-serif" }}
          >
            {t(item.title)}
          </h2>

          {/* Summary */}
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-6">
            {t(item.summary)}
          </p>

          {/* Source Link */}
          <a
            href={item.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary
                       hover:underline underline-offset-4 transition-all duration-200"
          >
            {lang === "zh" ? "阅读原文" : "Read More"}
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 + index * 0.06 }}
      className="group relative overflow-hidden rounded-xl bg-card border border-border
                 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5
                 transition-all duration-400"
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
        style={{ backgroundColor: item.category.color }}
      />

      <div className="p-5 pl-6">
        {/* Category + Source Row */}
        <div className="flex items-center gap-2 mb-3">
          <span
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-white"
            style={{ backgroundColor: item.category.color }}
          >
            {t(item.category)}
          </span>
          <span className="text-[11px] text-muted-foreground font-medium">
            {item.source}
          </span>
        </div>

        {/* Title */}
        <h3
          className="text-base font-bold text-card-foreground leading-snug mb-2.5
                     group-hover:text-primary transition-colors duration-300"
          style={{ fontFamily: "'Space Grotesk', 'Noto Sans SC', sans-serif" }}
        >
          {t(item.title)}
        </h3>

        {/* Summary */}
        <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">
          {t(item.summary)}
        </p>

        {/* Source Link */}
        <a
          href={item.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary
                     hover:underline underline-offset-4 transition-all duration-200"
        >
          {lang === "zh" ? "阅读原文" : "Read More"}
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </motion.article>
  );
}
