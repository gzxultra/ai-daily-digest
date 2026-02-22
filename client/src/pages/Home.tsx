/*
 * Design: Editorial Magazine Style — Home Page
 * - Hero section with generated AI background
 * - Date navigation for future daily updates
 * - Category filter pills
 * - Magazine-style grid: featured card + smaller cards
 */
import { useState, useMemo } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import DateNav from "@/components/DateNav";
import CategoryFilter from "@/components/CategoryFilter";
import NewsCard from "@/components/NewsCard";
import Footer from "@/components/Footer";
import { digests } from "@/data/news";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Home() {
  const { lang } = useLanguage();
  const [activeDate, setActiveDate] = useState(digests[0]?.date ?? "");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const currentDigest = useMemo(
    () => digests.find((d) => d.date === activeDate) ?? digests[0],
    [activeDate]
  );

  const categories = useMemo(() => {
    if (!currentDigest) return [];
    const seen = new Set<string>();
    return currentDigest.news
      .map((n) => n.category)
      .filter((c) => {
        if (seen.has(c.en)) return false;
        seen.add(c.en);
        return true;
      });
  }, [currentDigest]);

  const filteredNews = useMemo(() => {
    if (!currentDigest) return [];
    if (!activeCategory) return currentDigest.news;
    return currentDigest.news.filter((n) => n.category.en === activeCategory);
  }, [currentDigest, activeCategory]);

  const featured = filteredNews[0];
  const rest = filteredNews.slice(1);

  if (!currentDigest) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <HeroSection
        newsCount={currentDigest.news.length}
        date={lang === "zh" ? currentDigest.dateLabel.zh : currentDigest.dateLabel.en}
      />

      <main className="flex-1">
        <div className="container py-8 space-y-6">
          {/* Date Navigation */}
          <DateNav
            digests={digests}
            activeDate={activeDate}
            onDateChange={setActiveDate}
          />

          {/* Category Filter */}
          <CategoryFilter
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />

          {/* News Grid */}
          <div className="space-y-6">
            {/* Featured Card */}
            {featured && <NewsCard item={featured} index={0} featured />}

            {/* Grid of remaining cards */}
            {rest.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {rest.map((item, i) => (
                  <NewsCard key={item.id} item={item} index={i + 1} />
                ))}
              </div>
            )}

            {/* Empty state */}
            {filteredNews.length === 0 && (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-sm">
                  {lang === "zh"
                    ? "该分类下暂无新闻"
                    : "No news in this category"}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
