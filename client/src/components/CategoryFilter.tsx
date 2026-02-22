/*
 * Design: Editorial Magazine Style
 * - Horizontal scrollable category pills
 * - Color-coded to match news categories
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide"
    >
      <button
        onClick={() => onCategoryChange(null)}
        className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-300
          ${
            activeCategory === null
              ? "bg-foreground text-background shadow-sm"
              : "bg-secondary text-secondary-foreground hover:bg-accent"
          }`}
      >
        {lang === "zh" ? "全部" : "All"}
      </button>
      {categories.map((cat) => (
        <button
          key={cat.en}
          onClick={() =>
            onCategoryChange(activeCategory === cat.en ? null : cat.en)
          }
          className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-300
            ${
              activeCategory === cat.en
                ? "text-white shadow-sm"
                : "bg-secondary text-secondary-foreground hover:bg-accent"
            }`}
          style={
            activeCategory === cat.en
              ? { backgroundColor: cat.color }
              : undefined
          }
        >
          {t(cat)}
        </button>
      ))}
    </motion.div>
  );
}
