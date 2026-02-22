/*
 * Design: Editorial Magazine Style
 * - Horizontal scrollable date pills
 * - Active date highlighted with primary color
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide"
    >
      <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
      {digests.map((digest) => (
        <button
          key={digest.date}
          onClick={() => onDateChange(digest.date)}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
            ${
              activeDate === digest.date
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "bg-secondary text-secondary-foreground hover:bg-accent"
            }`}
        >
          {t(digest.dateLabel)}
        </button>
      ))}
    </motion.div>
  );
}
