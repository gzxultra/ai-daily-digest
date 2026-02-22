export interface NewsItem {
  id: string;
  category: {
    zh: string;
    en: string;
    color: string;
  };
  title: {
    zh: string;
    en: string;
  };
  summary: {
    zh: string;
    en: string;
  };
  source: string;
  sourceUrl: string;
  date: string;
}

export interface CrawlLog {
  fetchedAt: string;        // ISO 8601 UTC timestamp
  elapsedSeconds: number;  // total run time
  rawArticles: number;     // articles fetched before any filter
  afterFilter: number;     // after AI-relevance filter
  afterDedup: number;      // after deduplication
  dedupRemoved: number;    // how many were removed as duplicates
  finalStories: number;    // stories in this digest
  model: string;           // LLM model used
  sourceBreakdown: Record<string, number>; // source → story count
}

export interface DailyDigest {
  date: string;
  dateLabel: {
    zh: string;
    en: string;
  };
  crawlLog?: CrawlLog;
  news: NewsItem[];
}

export interface DigestIndex {
  dates: string[];
  latest: string;
}

const BASE = import.meta.env.BASE_URL ?? "/";

export async function fetchIndex(): Promise<DigestIndex> {
  const res = await fetch(`${BASE}data/index.json`);
  if (!res.ok) throw new Error("Failed to load index");
  return res.json();
}

export async function fetchDigest(date: string): Promise<DailyDigest> {
  const res = await fetch(`${BASE}data/${date}.json`);
  if (!res.ok) throw new Error(`Failed to load digest for ${date}`);
  return res.json();
}
