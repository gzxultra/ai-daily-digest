/*
 * UI: Refined category filter
 * - Small colored dot indicator instead of full colored bg
 * - Clean pill design with subtle active state
 */
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

interface Category {
  zh: string;
  en: string;
  color: string;
}

interface CategoryFilterProps {
  categories: Category[];
  activeCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

export default function CategoryFilter({
  categories,
  activeCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  const { t, lang } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.25 }}
      className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide"
    >
      <button
        onClick={() => onCategoryChange(null)}
        className={`shrink-0 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all duration-200
          ${activeCategory === null
            ? "bg-foreground text-background"
            : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          }`}
      >
        {lang === "zh" ? "全部" : "All"}
      </button>
      {categories.map((cat) => {
        const isActive = activeCategory === cat.en;
        return (
          <button
            key={cat.en}
            onClick={() => onCategoryChange(isActive ? null : cat.en)}
            className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all duration-200
              ${isActive
                ? "text-foreground bg-secondary"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: cat.color }}
            />
            {t(cat)}
          </button>
        );
      })}
    </motion.div>
  );
}
