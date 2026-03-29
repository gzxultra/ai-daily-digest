import { useLanguage } from "@/contexts/LanguageContext";
import type { DailyDigest } from "@/data/news";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useEffect, useState } from "react";

interface DateNavProps {
  digests: DailyDigest[];
  activeDate: string;
  onDateChange: (date: string) => void;
}

export default function DateNav({ digests, activeDate, onDateChange }: DateNavProps) {
  const { t, lang } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  // Scroll active date into view
  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [activeDate]);

  // Check scroll overflow
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const checkOverflow = () => {
      setShowLeft(el.scrollLeft > 10);
      setShowRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
    };
    checkOverflow();
    el.addEventListener("scroll", checkOverflow);
    window.addEventListener("resize", checkOverflow);
    return () => {
      el.removeEventListener("scroll", checkOverflow);
      window.removeEventListener("resize", checkOverflow);
    };
  }, [digests]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });
  };

  // Navigate to prev/next date
  const currentIndex = digests.findIndex((d) => d.date === activeDate);
  const hasPrev = currentIndex < digests.length - 1;
  const hasNext = currentIndex > 0;

  const formatShortDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    if (lang === "zh") {
      return `${d.getMonth() + 1}/${d.getDate()}`;
    }
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="flex items-center gap-2 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
      {/* Prev/Next arrows for quick navigation */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => hasPrev && onDateChange(digests[currentIndex + 1].date)}
          disabled={!hasPrev}
          className="flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          aria-label={lang === "zh" ? "前一天" : "Previous day"}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => hasNext && onDateChange(digests[currentIndex - 1].date)}
          disabled={!hasNext}
          className="flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          aria-label={lang === "zh" ? "后一天" : "Next day"}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />

      {/* Scrollable date pills */}
      <div className="relative flex-1 overflow-hidden">
        {/* Left fade */}
        {showLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-r from-background to-transparent flex items-center"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        )}

        <div
          ref={scrollRef}
          className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-0.5"
        >
          {digests.map((digest) => {
            const isActive = activeDate === digest.date;
            const isToday = digest.date === digests[0]?.date;
            return (
              <button
                key={digest.date}
                ref={isActive ? activeRef : undefined}
                onClick={() => onDateChange(digest.date)}
                className={`relative shrink-0 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200
                  ${isActive
                    ? "text-primary bg-primary/8 font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                aria-current={isActive ? "date" : undefined}
              >
                <span className="flex items-center gap-1.5">
                  {isToday && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-dot" />
                  )}
                  {formatShortDate(digest.date)}
                </span>
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right fade */}
        {showRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-l from-background to-transparent flex items-center justify-end"
          >
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        )}
      </div>
    </div>
  );
}
