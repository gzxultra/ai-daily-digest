import { useState, useMemo, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import DateNav from "@/components/DateNav";
import CategoryFilter from "@/components/CategoryFilter";
import NewsCard from "@/components/NewsCard";
import Footer from "@/components/Footer";
import CrawlLogPanel from "@/components/CrawlLogPanel";
import BackToTop from "@/components/BackToTop";
import ReadingProgress from "@/components/ReadingProgress";
import { fetchIndex, fetchDigest, type DailyDigest, type DigestIndex, type NewsItem } from "@/data/news";
import { useLanguage } from "@/contexts/LanguageContext";
import { Loader2, SearchX } from "lucide-react";

export default function Home() {
  const { lang } = useLanguage();
  const [index, setIndex] = useState<DigestIndex | null>(null);
  const [activeDate, setActiveDate] = useState<string>("");
  const [digest, setDigest] = useState<DailyDigest | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Load index on mount
  useEffect(() => {
    fetchIndex()
      .then((idx) => {
        setIndex(idx);
        setActiveDate(idx.latest);
      })
      .catch(console.error);
  }, []);

  // Load digest when activeDate changes
  useEffect(() => {
    if (!activeDate) return;
    setLoading(true);
    fetchDigest(activeDate)
      .then((d) => {
        setDigest(d);
        setActiveCategory(null);
        setSearchQuery("");
      })
      .catch(console.error)
      .finally(() => setLoading(false));
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

  // Category counts
  const categoryCounts = useMemo(() => {
    if (!digest) return {};
    const counts: Record<string, number> = {};
    digest.news.forEach((n: NewsItem) => {
      counts[n.category.en] = (counts[n.category.en] || 0) + 1;
    });
    return counts;
  }, [digest]);

  // Filter by category and search
  const filteredNews = useMemo(() => {
    if (!digest) return [];
    let items = digest.news;

    if (activeCategory) {
      items = items.filter((n: NewsItem) => n.category.en === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      items = items.filter((n: NewsItem) => {
        const titleMatch = n.title.en.toLowerCase().includes(q) || n.title.zh.toLowerCase().includes(q);
        const summaryMatch = n.summary.en.toLowerCase().includes(q) || n.summary.zh.toLowerCase().includes(q);
        const sourceMatch = n.source.toLowerCase().includes(q);
        const categoryMatch = n.category.en.toLowerCase().includes(q) || n.category.zh.toLowerCase().includes(q);
        return titleMatch || summaryMatch || sourceMatch || categoryMatch;
      });
    }

    return items;
  }, [digest, activeCategory, searchQuery]);

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

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  if (!index || loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header onSearch={handleSearch} />
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
      <ReadingProgress />
      <Header onSearch={handleSearch} />

      <HeroSection
        newsCount={digest?.news.length ?? 0}
        date={
          digest
            ? lang === "zh"
              ? digest.dateLabel.zh
              : digest.dateLabel.en
            : ""
        }
        crawlLog={digest?.crawlLog}
      />

      <main id="main-content" className="flex-1">
        <div className="container pt-6 pb-4">
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
              categoryCounts={categoryCounts}
            />
          </div>

          {/* Search results indicator */}
          {searchQuery && (
            <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground animate-fade-in-up" style={{ animationDuration: "0.2s" }}>
              <span>
                {lang === "zh"
                  ? `搜索 "${searchQuery}" — ${filteredNews.length} 条结果`
                  : `Searching "${searchQuery}" — ${filteredNews.length} result${filteredNews.length !== 1 ? "s" : ""}`}
              </span>
            </div>
          )}

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
              <div className="text-center py-20 animate-fade-in-up">
                <SearchX className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-sm text-muted-foreground font-medium mb-1">
                  {searchQuery
                    ? lang === "zh"
                      ? `未找到与 "${searchQuery}" 相关的新闻`
                      : `No stories matching "${searchQuery}"`
                    : lang === "zh"
                      ? "该分类下暂无新闻"
                      : "No stories in this category"}
                </p>
                <p className="text-xs text-muted-foreground/60">
                  {lang === "zh" ? "试试其他关键词或分类" : "Try a different keyword or category"}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Crawl log panel */}
      {digest?.crawlLog && (
        <div className="container pb-4">
          <CrawlLogPanel log={digest.crawlLog} />
        </div>
      )}

      <Footer />
      <BackToTop />
    </div>
  );
}
