/*
 * UI: Minimal date navigation
 * - Horizontal scroll with clean pill buttons
 * - Active state uses underline accent, not filled bg
 */
import { useLanguage } from "@/contexts/LanguageContext";
import type { DailyDigest } from "@/data/news";
import { Calendar } from "lucide-react";
import { motion } from "framer-motion";

interface DateNavProps {
  digests: DailyDigest[];
  activeDate: string;
  onDateChange: (date: string) => void;
}

export default function DateNav({ digests, activeDate, onDateChange }: DateNavProps) {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.15 }}
      className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide"
    >
      <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
      <div className="flex items-center gap-1">
        {digests.map((digest) => {
          const isActive = activeDate === digest.date;
          return (
            <button
              key={digest.date}
              onClick={() => onDateChange(digest.date)}
              className={`relative shrink-0 px-3.5 py-1.5 rounded-md text-sm font-medium transition-all duration-200
                ${isActive
                  ? "text-primary bg-primary/8"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
            >
              {t(digest.dateLabel)}
              {isActive && (
                <motion.div
                  layoutId="date-indicator"
                  className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
