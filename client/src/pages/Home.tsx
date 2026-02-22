/*
 * Design: Editorial Magazine Style — Home Page
 * - Hero section with generated AI background
 * - Date navigation for daily updates
 * - Category filter pills
 * - Magazine-style grid: featured card + smaller cards
 * - Data loaded from JSON files (updated daily by GitHub Actions)
 */
import { useState, useMemo, useEffect } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import DateNav from "@/components/DateNav";
import CategoryFilter from "@/components/CategoryFilter";
import NewsCard from "@/components/NewsCard";
import Footer from "@/components/Footer";
import { fetchIndex, fetchDigest, type DailyDigest, type DigestIndex, type NewsItem } from "@/data/news";
import { useLanguage } from "@/contexts/LanguageContext";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { lang } = useLanguage();
  const [index, setIndex] = useState<DigestIndex | null>(null);
  const [activeDate, setActiveDate] = useState<string>("");
  const [digest, setDigest] = useState<DailyDigest | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load index on mount
  useEffect(() => {
    fetchIndex().then((idx) => {
      setIndex(idx);
      setActiveDate(idx.latest);
    }).catch(console.error);
  }, []);

  // Load digest when activeDate changes
  useEffect(() => {
    if (!activeDate) return;
    setLoading(true);
    fetchDigest(activeDate).then((d) => {
      setDigest(d);
      setActiveCategory(null);
    }).catch(console.error).finally(() => setLoading(false));
  }, [activeDate]);

  const categories = useMemo(() => {
    if (!digest) return [];
    const seen = new Set<string>();
    return digest.news
      .map((n: NewsItem) => n.category)
      .filter((c: { en: string }) => {
        if (seen.has(c.en)) return false;
        seen.add(c.en);
        return true;
      });
  }, [digest]);

  const filteredNews = useMemo(() => {
    if (!digest) return [];
    if (!activeCategory) return digest.news;
    return digest.news.filter((n: NewsItem) => n.category.en === activeCategory);
  }, [digest, activeCategory]);

  const featured = filteredNews[0];
  const rest = filteredNews.slice(1);

  // Build date list for DateNav
  const dateDigests = useMemo(() => {
    if (!index) return [];
    return index.dates.map((d: string) => ({
      date: d,
      dateLabel: {
        zh: d.replace(/(\d{4})-(\d{2})-(\d{2})/, "$1年$2月$3日"),
        en: new Date(d + "T00:00:00").toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      },
      news: [],
    }));
  }, [index]);

  if (!index || loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <HeroSection
        newsCount={digest?.news.length ?? 0}
        date={
          digest
            ? lang === "zh"
              ? digest.dateLabel.zh
              : digest.dateLabel.en
            : ""
        }
      />

      <main className="flex-1">
        <div className="container py-8 space-y-6">
          {/* Date Navigation */}
          <DateNav
            digests={dateDigests}
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
                {rest.map((item: NewsItem, i: number) => (
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
