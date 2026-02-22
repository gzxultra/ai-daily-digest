/*
 * UI: Editorial magazine home page
 * - Clean section structure with proper spacing
 * - Featured card spans full width
 * - 2-column grid for remaining cards (3-col on xl)
 * - Subtle section dividers
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
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-xs text-muted-foreground font-medium">
              {lang === "zh" ? "加载中..." : "Loading..."}
            </span>
          </div>
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
        <div className="container pt-8 pb-4">
          {/* Controls section */}
          <div className="space-y-3 mb-8">
            <DateNav
              digests={dateDigests}
              activeDate={activeDate}
              onDateChange={setActiveDate}
            />
            <div className="h-px bg-border" />
            <CategoryFilter
              categories={categories}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />
          </div>

          {/* News section */}
          <div className="space-y-5">
            {/* Featured Card */}
            {featured && <NewsCard item={featured} index={0} featured />}

            {/* Divider between featured and grid */}
            {featured && rest.length > 0 && (
              <div className="flex items-center gap-3 py-2">
                <div className="h-px flex-1 bg-border" />
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                  {lang === "zh" ? "更多资讯" : "More Stories"}
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>
            )}

            {/* Grid of remaining cards */}
            {rest.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {rest.map((item: NewsItem, i: number) => (
                  <NewsCard key={item.id} item={item} index={i + 1} />
                ))}
              </div>
            )}

            {/* Empty state */}
            {filteredNews.length === 0 && (
              <div className="text-center py-20">
                <p className="text-sm text-muted-foreground">
                  {lang === "zh"
                    ? "该分类下暂无新闻"
                    : "No stories in this category"}
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
