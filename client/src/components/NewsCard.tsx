import { useLanguage } from "@/contexts/LanguageContext";
import type { NewsItem } from "@/data/news";
import { ArrowUpRight, Share2, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface NewsCardProps {
  item: NewsItem;
  index: number;
  featured?: boolean;
}

export default function NewsCard({ item, index, featured = false }: NewsCardProps) {
  const { t, lang } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLElement>(null);

  // Intersection observer for lazy animation
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "50px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const shareData = {
      title: t(item.title),
      text: t(item.summary),
      url: item.sourceUrl,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(item.sourceUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // User cancelled share
    }
  };

  // Estimate reading time (rough: 200 words/min for EN, 300 chars/min for ZH)
  const readingTime = (() => {
    const text = t(item.summary);
    if (lang === "zh") {
      return Math.max(1, Math.ceil(text.length / 300));
    }
    return Math.max(1, Math.ceil(text.split(/\s+/).length / 200));
  })();

  if (featured) {
    return (
      <article
        ref={cardRef}
        className={`group relative bg-card rounded-xl border border-border overflow-hidden card-hover
                   ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
        style={{ animationDelay: "0.05s" }}
      >
        <div className="h-1 w-full" style={{ backgroundColor: item.category.color }} />
        <div className="p-6 sm:p-8 lg:p-10">
          <div className="flex items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-3">
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider"
                style={{ color: item.category.color, backgroundColor: `${item.category.color}12` }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.category.color }} />
                {t(item.category)}
              </span>
              <span className="text-xs text-muted-foreground">
                via <span className="font-semibold text-foreground/60">{item.source}</span>
              </span>
              <span className="text-[11px] text-muted-foreground/60">
                {readingTime} {lang === "zh" ? "分钟" : "min read"}
              </span>
            </div>
            <button
              onClick={handleShare}
              className="flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all opacity-0 group-hover:opacity-100"
              aria-label={lang === "zh" ? "分享" : "Share"}
              title={lang === "zh" ? "分享" : "Share"}
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>

          <h2
            className="text-xl sm:text-2xl lg:text-[1.65rem] font-extrabold text-card-foreground leading-tight mb-4 group-hover:text-primary transition-colors duration-300"
            style={{ fontFamily: "'Space Grotesk', 'Noto Sans SC', sans-serif" }}
          >
            <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:underline decoration-primary/30 underline-offset-4">
              {t(item.title)}
            </a>
          </h2>

          <p className="text-[15px] text-muted-foreground leading-[1.75] mb-6 max-w-3xl">
            {t(item.summary)}
          </p>

          <a
            href={item.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2.5 transition-all duration-200 group/link"
          >
            {lang === "zh" ? "阅读原文" : "Read Article"}
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
          </a>
        </div>
      </article>
    );
  }

  return (
    <article
      ref={cardRef}
      className={`group relative bg-card rounded-xl border border-border overflow-hidden card-hover
                 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
      style={{ animationDelay: `${0.05 + index * 0.04}s` }}
    >
      <div className="h-0.5 w-full" style={{ backgroundColor: item.category.color }} />
      <div className="p-5 sm:p-6 flex flex-col h-full">
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <div className="flex items-center gap-2.5">
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider"
              style={{ color: item.category.color, backgroundColor: `${item.category.color}10` }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.category.color }} />
              {t(item.category)}
            </span>
            <span className="text-[11px] text-muted-foreground">
              via <span className="font-semibold text-foreground/55">{item.source}</span>
            </span>
          </div>
          <button
            onClick={handleShare}
            className="flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-all opacity-0 group-hover:opacity-100 shrink-0"
            aria-label={lang === "zh" ? "分享" : "Share"}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Share2 className="w-3.5 h-3.5" />}
          </button>
        </div>

        <h3
          className="text-[15px] sm:text-base font-bold text-card-foreground leading-snug mb-3 group-hover:text-primary transition-colors duration-300"
          style={{ fontFamily: "'Space Grotesk', 'Noto Sans SC', sans-serif" }}
        >
          <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:underline decoration-primary/30 underline-offset-2">
            {t(item.title)}
          </a>
        </h3>

        <p className="text-[13px] text-muted-foreground leading-[1.7] mb-4 flex-1 line-clamp-4">
          {t(item.summary)}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <a
            href={item.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:gap-2 transition-all duration-200 group/link"
          >
            {lang === "zh" ? "阅读原文" : "Read Article"}
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
          </a>
          <span className="text-[10px] text-muted-foreground/50">
            {readingTime} {lang === "zh" ? "分钟" : "min"}
          </span>
        </div>
      </div>
    </article>
  );
}
