import { useLanguage } from "@/contexts/LanguageContext";

interface Category {
  zh: string;
  en: string;
  color: string;
}

interface CategoryFilterProps {
  categories: Category[];
  activeCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  categoryCounts?: Record<string, number>;
}

export default function CategoryFilter({
  categories,
  activeCategory,
  onCategoryChange,
  categoryCounts,
}: CategoryFilterProps) {
  const { t, lang } = useLanguage();

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
      <button
        onClick={() => onCategoryChange(null)}
        className={`shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200
          ${activeCategory === null
            ? "bg-foreground text-background shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          }`}
        aria-pressed={activeCategory === null}
      >
        {lang === "zh" ? "全部" : "All"}
        {categoryCounts && (
          <span className="ml-1.5 text-[10px] opacity-60">
            {Object.values(categoryCounts).reduce((a, b) => a + b, 0)}
          </span>
        )}
      </button>
      {categories.map((cat) => {
        const isActive = activeCategory === cat.en;
        const count = categoryCounts?.[cat.en];
        return (
          <button
            key={cat.en}
            onClick={() => onCategoryChange(isActive ? null : cat.en)}
            className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200
              ${isActive
                ? "text-foreground bg-secondary shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            aria-pressed={isActive}
          >
            <span
              className="w-2 h-2 rounded-full shrink-0 transition-transform duration-200"
              style={{
                backgroundColor: cat.color,
                transform: isActive ? "scale(1.3)" : "scale(1)",
              }}
            />
            {t(cat)}
            {count !== undefined && (
              <span className="text-[10px] opacity-50">{count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
