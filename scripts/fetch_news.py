#!/usr/bin/env python3
"""
AI Daily Digest - Automated News Collector
==========================================
Fetches today's top AI news from Google News RSS and multiple tech RSS feeds,
then uses OpenAI API to generate bilingual (Chinese/English) summaries.

Usage:
    python scripts/fetch_news.py

Environment variables:
    OPENAI_API_KEY - Required for generating summaries
"""

import json
import os
import re
import sys
import hashlib
import xml.etree.ElementTree as ET
from datetime import datetime, timezone, timedelta
from pathlib import Path
from urllib.request import urlopen, Request
from urllib.error import URLError
from urllib.parse import quote
import html

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

# RSS feeds to scrape for AI news
RSS_FEEDS = [
    # Google News - AI topic
    "https://news.google.com/rss/search?q=artificial+intelligence+when:1d&hl=en-US&gl=US&ceid=US:en",
    "https://news.google.com/rss/search?q=AI+startup+OR+AI+model+OR+AI+regulation+when:1d&hl=en-US&gl=US&ceid=US:en",
    # TechCrunch AI
    "https://techcrunch.com/category/artificial-intelligence/feed/",
    # The Verge AI
    "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
    # Ars Technica AI
    "https://feeds.arstechnica.com/arstechnica/technology-lab",
    # VentureBeat
    "https://venturebeat.com/category/ai/feed/",
    # MIT Technology Review
    "https://www.technologyreview.com/feed/",
]

# Category color mapping
CATEGORY_COLORS = {
    "Global Governance": "#0066FF",
    "Investment": "#F59E0B",
    "AI Safety": "#10B981",
    "Industry Views": "#06B6D4",
    "Security Breach": "#EF4444",
    "AI Ethics": "#8B5CF6",
    "AI Agents": "#F97316",
    "Policy & Regulation": "#3B82F6",
    "Product Launch": "#22C55E",
    "Research": "#A855F7",
    "Business": "#EC4899",
    "Technology": "#14B8A6",
    "General": "#6B7280",
}

MAX_NEWS = 9
DATA_DIR = Path(__file__).resolve().parent.parent / "client" / "public" / "data"

# ---------------------------------------------------------------------------
# RSS Fetching
# ---------------------------------------------------------------------------

def fetch_rss(url: str, timeout: int = 15) -> list[dict]:
    """Fetch and parse an RSS feed, returning a list of article dicts."""
    articles = []
    headers = {
        "User-Agent": "Mozilla/5.0 (compatible; AIDailyDigest/1.0)"
    }
    try:
        req = Request(url, headers=headers)
        with urlopen(req, timeout=timeout) as resp:
            data = resp.read()
        root = ET.fromstring(data)
    except Exception as e:
        print(f"  [WARN] Failed to fetch {url}: {e}", file=sys.stderr)
        return []

    # Handle both RSS 2.0 and Atom feeds
    ns = {"atom": "http://www.w3.org/2005/Atom"}

    # RSS 2.0
    for item in root.findall(".//item"):
        title_el = item.find("title")
        link_el = item.find("link")
        desc_el = item.find("description")
        pub_el = item.find("pubDate")
        source_el = item.find("source")

        title = title_el.text.strip() if title_el is not None and title_el.text else ""
        link = link_el.text.strip() if link_el is not None and link_el.text else ""
        desc = desc_el.text.strip() if desc_el is not None and desc_el.text else ""
        source = source_el.text.strip() if source_el is not None and source_el.text else ""

        # Clean HTML from description
        desc = re.sub(r"<[^>]+>", "", html.unescape(desc))[:500]

        if title and link:
            articles.append({
                "title": title,
                "link": link,
                "description": desc,
                "source": source,
            })

    # Atom
    for entry in root.findall(".//atom:entry", ns):
        title_el = entry.find("atom:title", ns)
        link_el = entry.find("atom:link", ns)
        summary_el = entry.find("atom:summary", ns) or entry.find("atom:content", ns)

        title = title_el.text.strip() if title_el is not None and title_el.text else ""
        link = link_el.get("href", "").strip() if link_el is not None else ""
        desc = summary_el.text.strip() if summary_el is not None and summary_el.text else ""
        desc = re.sub(r"<[^>]+>", "", html.unescape(desc))[:500]

        if title and link:
            articles.append({
                "title": title,
                "link": link,
                "description": desc,
                "source": "",
            })

    return articles


def collect_articles() -> list[dict]:
    """Collect articles from all RSS feeds and deduplicate."""
    all_articles = []
    seen_titles = set()

    for feed_url in RSS_FEEDS:
        print(f"  Fetching: {feed_url[:80]}...")
        articles = fetch_rss(feed_url)
        for a in articles:
            # Simple dedup by normalized title
            norm = re.sub(r"\s+", " ", a["title"].lower().strip())
            if norm not in seen_titles:
                seen_titles.add(norm)
                all_articles.append(a)

    print(f"  Total unique articles collected: {len(all_articles)}")
    return all_articles


def filter_ai_articles(articles: list[dict]) -> list[dict]:
    """Filter articles that are actually about AI."""
    ai_keywords = [
        "ai", "artificial intelligence", "machine learning", "deep learning",
        "llm", "large language model", "chatgpt", "gpt", "openai", "anthropic",
        "claude", "gemini", "deepmind", "neural", "generative", "transformer",
        "ai agent", "ai safety", "ai regulation", "ai model", "ai startup",
        "copilot", "midjourney", "stable diffusion", "nvidia", "gpu",
    ]
    filtered = []
    for a in articles:
        text = (a["title"] + " " + a["description"]).lower()
        if any(kw in text for kw in ai_keywords):
            filtered.append(a)
    print(f"  AI-related articles: {len(filtered)}")
    return filtered


# ---------------------------------------------------------------------------
# OpenAI Integration
# ---------------------------------------------------------------------------

def call_openai(prompt: str, model: str = "gpt-4o-mini") -> str:
    """Call OpenAI Chat Completions API."""
    api_key = os.environ.get("OPENAI_API_KEY", "")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY environment variable is not set")

    payload = json.dumps({
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.3,
        "max_tokens": 4096,
    }).encode()

    req = Request(
        "https://api.openai.com/v1/chat/completions",
        data=payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        },
        method="POST",
    )

    with urlopen(req, timeout=60) as resp:
        result = json.loads(resp.read())

    return result["choices"][0]["message"]["content"]


def generate_digest(articles: list[dict], target_date: str) -> list[dict]:
    """Use OpenAI to select top stories and generate bilingual summaries."""

    # Prepare article list for the prompt
    article_list = ""
    for i, a in enumerate(articles[:30], 1):  # Send top 30 to OpenAI
        article_list += f"\n{i}. Title: {a['title']}\n   Source: {a.get('source', 'Unknown')}\n   URL: {a['link']}\n   Description: {a['description'][:300]}\n"

    prompt = f"""You are an AI news editor. Today is {target_date}.

Below are today's AI-related news articles. Please:

1. Select the {MAX_NEWS} MOST IMPORTANT and DIVERSE stories (cover different topics/categories)
2. For each selected story, provide:
   - A category (choose from: Global Governance, Investment, AI Safety, Industry Views, Security Breach, AI Ethics, AI Agents, Policy & Regulation, Product Launch, Research, Business, Technology)
   - The category name in Chinese
   - An English title (concise, news-style)
   - A Chinese title (concise, news-style)
   - An English summary (2-3 sentences, informative)
   - A Chinese summary (2-3 sentences, informative, natural Chinese writing)
   - The source name
   - The source URL

ARTICLES:
{article_list}

Respond in valid JSON format ONLY (no markdown, no code fences). Use this exact structure:
[
  {{
    "category_en": "Category Name",
    "category_zh": "分类名称",
    "title_en": "English Title",
    "title_zh": "中文标题",
    "summary_en": "English summary in 2-3 sentences.",
    "summary_zh": "中文摘要，2-3句话。",
    "source": "Source Name",
    "sourceUrl": "https://..."
  }}
]

Important:
- Select stories that represent the MOST significant AI developments today
- Ensure diversity across categories
- Chinese summaries should read naturally, not like translations
- Do NOT use smart quotes (curly quotes) in any field - use only straight quotes or Chinese brackets 「」
- Return EXACTLY {MAX_NEWS} items"""

    print("  Calling OpenAI for digest generation...")
    response = call_openai(prompt)

    # Parse JSON from response (handle potential markdown wrapping)
    response = response.strip()
    if response.startswith("```"):
        response = re.sub(r"^```(?:json)?\s*", "", response)
        response = re.sub(r"\s*```$", "", response)

    items = json.loads(response)

    # Convert to our format
    news_items = []
    for i, item in enumerate(items, 1):
        cat_en = item.get("category_en", "General")
        color = CATEGORY_COLORS.get(cat_en, "#6B7280")
        news_items.append({
            "id": str(i),
            "category": {
                "zh": item.get("category_zh", "综合"),
                "en": cat_en,
                "color": color,
            },
            "title": {
                "zh": item.get("title_zh", ""),
                "en": item.get("title_en", ""),
            },
            "summary": {
                "zh": item.get("summary_zh", ""),
                "en": item.get("summary_en", ""),
            },
            "source": item.get("source", ""),
            "sourceUrl": item.get("sourceUrl", ""),
            "date": target_date,
        })

    return news_items


# ---------------------------------------------------------------------------
# Fallback: Generate digest without OpenAI
# ---------------------------------------------------------------------------

def generate_digest_fallback(articles: list[dict], target_date: str) -> list[dict]:
    """Generate a basic digest without OpenAI (fallback mode)."""
    print("  [FALLBACK] Generating digest without OpenAI...")
    news_items = []
    for i, a in enumerate(articles[:MAX_NEWS], 1):
        title = a["title"]
        desc = a["description"][:200] if a["description"] else title
        source = a.get("source", "") or "Web"
        # Extract domain as source name if empty
        if not source or source == "Web":
            from urllib.parse import urlparse
            parsed = urlparse(a["link"])
            source = parsed.netloc.replace("www.", "")

        news_items.append({
            "id": str(i),
            "category": {
                "zh": "综合",
                "en": "General",
                "color": "#6B7280",
            },
            "title": {
                "zh": title,  # English title as fallback
                "en": title,
            },
            "summary": {
                "zh": desc,
                "en": desc,
            },
            "source": source,
            "sourceUrl": a["link"],
            "date": target_date,
        })

    return news_items


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    # Determine target date (UTC)
    target_date = os.environ.get("TARGET_DATE", "")
    if not target_date:
        target_date = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    print(f"=== AI Daily Digest: {target_date} ===")

    # 1. Collect articles
    print("\n[1/3] Collecting articles from RSS feeds...")
    articles = collect_articles()

    # 2. Filter AI-related
    print("\n[2/3] Filtering AI-related articles...")
    ai_articles = filter_ai_articles(articles)

    if len(ai_articles) < 3:
        print("  [WARN] Very few AI articles found, using all articles")
        ai_articles = articles[:30]

    # 3. Generate digest
    print("\n[3/3] Generating bilingual digest...")
    try:
        news_items = generate_digest(ai_articles, target_date)
    except Exception as e:
        print(f"  [ERROR] OpenAI failed: {e}", file=sys.stderr)
        print("  Falling back to basic digest...")
        news_items = generate_digest_fallback(ai_articles, target_date)

    if not news_items:
        print("[ERROR] No news items generated!", file=sys.stderr)
        sys.exit(1)

    # 4. Build date label
    dt = datetime.strptime(target_date, "%Y-%m-%d")
    date_label = {
        "zh": f"{dt.year}年{dt.month}月{dt.day}日",
        "en": dt.strftime("%B %d, %Y"),
    }

    # 5. Write JSON
    digest = {
        "date": target_date,
        "dateLabel": date_label,
        "news": news_items,
    }

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    output_path = DATA_DIR / f"{target_date}.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(digest, f, ensure_ascii=False, indent=2)
    print(f"\n  Written: {output_path}")

    # 6. Update index.json
    index_path = DATA_DIR / "index.json"
    if index_path.exists():
        with open(index_path, "r", encoding="utf-8") as f:
            index = json.load(f)
    else:
        index = {"dates": [], "latest": ""}

    if target_date not in index["dates"]:
        index["dates"].append(target_date)
        index["dates"].sort(reverse=True)

    # Keep only last 30 days
    index["dates"] = index["dates"][:30]
    index["latest"] = index["dates"][0]

    with open(index_path, "w", encoding="utf-8") as f:
        json.dump(index, f, ensure_ascii=False, indent=2)
    print(f"  Updated: {index_path}")

    print(f"\n=== Done! {len(news_items)} stories for {target_date} ===")


if __name__ == "__main__":
    main()
