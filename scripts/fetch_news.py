#!/usr/bin/env python3
"""
AI Daily Digest - Automated News Collector
==========================================
Fetches today's top AI news from curated newsletter RSS feeds, Hacker News,
and Reddit, then uses OpenAI-compatible LLM to generate bilingual (Chinese/English)
summaries in a structured JSON format for the frontend.

Adapted from giftedunicorn/ai-news-bot's crawler architecture with custom
source list, deduplication, and bilingual output.

Data sources:
  - AlphaSignal (newsletter RSS)
  - Ben's Bites (newsletter RSS)
  - Import AI (newsletter RSS)
  - TLDR AI (newsletter RSS)
  - The Batch / deeplearning.ai (newsletter RSS)
  - Hacker News (Algolia API - AI-filtered)
  - Reddit: r/MachineLearning, r/LocalLLaMA (JSON API)

Usage:
    python scripts/fetch_news.py

Environment variables:
    OPENAI_API_KEY  - Required for generating summaries (OpenAI-compatible)
    OPENAI_BASE_URL - Optional base URL override (default: https://api.openai.com/v1)
    LLM_MODEL       - Optional model name (default: gpt-4.1-mini)
"""

import json
import os
import re
import sys
import hashlib
import time
import logging
import xml.etree.ElementTree as ET
from datetime import datetime, timezone, timedelta
from pathlib import Path
from urllib.request import urlopen, Request
from urllib.error import URLError, HTTPError
from urllib.parse import quote, urlencode
import html

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    stream=sys.stdout,
)
log = logging.getLogger("fetch_news")

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

# Fixed category palette (matches existing frontend data)
CATEGORIES = {
    "Models & APIs":       {"zh": "模型与 API",  "color": "#6366f1"},
    "Research & Papers":   {"zh": "研究与论文",  "color": "#ec4899"},
    "Engineering & Tools": {"zh": "工程与工具",  "color": "#10b981"},
    "Industry & Policy":   {"zh": "行业与政策",  "color": "#8b5cf6"},
    "Community Picks":     {"zh": "社区精选",    "color": "#f59e0b"},
}

# Target: 10-15 high-quality stories per day
MAX_NEWS = 15

DATA_DIR = Path(__file__).resolve().parent.parent / "client" / "public" / "data"

# How many days of history to check for deduplication
DEDUP_DAYS = 7

# ---------------------------------------------------------------------------
# RSS / Newsletter Feeds
# ---------------------------------------------------------------------------

NEWSLETTER_FEEDS = {
    # AlphaSignal
    "AlphaSignal": [
        "https://alphasignal.ai/feed",
        "https://alphasignalai.beehiiv.com/feed",
    ],
    # Ben's Bites
    "Ben's Bites": [
        "https://bensbites.beehiiv.com/feed",
        "https://news.bensbites.com/feed",
        "https://www.bensbites.com/feed",
    ],
    # Import AI
    "Import AI": [
        "https://importai.substack.com/feed",
        "https://jack-clark.net/feed/",
    ],
    # TLDR AI
    "TLDR AI": [
        "https://tldr.tech/ai/rss",
        "https://tldrai.beehiiv.com/feed",
    ],
    # The Batch (deeplearning.ai)
    "The Batch": [
        "https://www.deeplearning.ai/the-batch/feed/",
        "https://www.deeplearning.ai/feed/",
    ],
}

# Supplementary tech RSS feeds for broader coverage
SUPPLEMENTARY_FEEDS = {
    "TechCrunch AI": "https://techcrunch.com/tag/artificial-intelligence/feed/",
    "The Verge AI": "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
    "Ars Technica": "https://feeds.arstechnica.com/arstechnica/technology-lab",
    "VentureBeat AI": "https://venturebeat.com/category/ai/feed/",
    "OpenAI Blog": "https://openai.com/blog/rss/",
    "Google AI Blog": "https://blog.google/technology/ai/rss/",
    "MIT Tech Review": "https://www.technologyreview.com/feed/",
}

# ---------------------------------------------------------------------------
# HTTP helpers
# ---------------------------------------------------------------------------

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; AIDailyDigest/2.0; +https://gzxultra.github.io/ai-daily-digest/)"
}


def http_get(url: str, timeout: int = 15, accept: str = "*/*") -> bytes:
    """Fetch URL with retries."""
    headers = {**HEADERS, "Accept": accept}
    for attempt in range(3):
        try:
            req = Request(url, headers=headers)
            with urlopen(req, timeout=timeout) as resp:
                return resp.read()
        except (URLError, HTTPError, TimeoutError) as e:
            if attempt < 2:
                time.sleep(2 ** attempt)
            else:
                raise
    return b""


def http_get_json(url: str, timeout: int = 15) -> dict:
    """Fetch URL and parse JSON."""
    data = http_get(url, timeout=timeout, accept="application/json")
    return json.loads(data)


# ---------------------------------------------------------------------------
# RSS Fetching (adapted from ai-news-bot/src/news/fetcher.py)
# ---------------------------------------------------------------------------

def parse_rss(raw_xml: bytes) -> list[dict]:
    """Parse RSS 2.0 or Atom XML into article dicts."""
    articles = []
    try:
        root = ET.fromstring(raw_xml)
    except ET.ParseError:
        return []

    ns = {"atom": "http://www.w3.org/2005/Atom"}

    # RSS 2.0
    for item in root.findall(".//item"):
        title_el = item.find("title")
        link_el = item.find("link")
        desc_el = item.find("description")
        pub_el = item.find("pubDate")
        source_el = item.find("source")

        title = (title_el.text or "").strip() if title_el is not None else ""
        link = (link_el.text or "").strip() if link_el is not None else ""
        desc = (desc_el.text or "").strip() if desc_el is not None else ""
        source = (source_el.text or "").strip() if source_el is not None else ""
        pub = (pub_el.text or "").strip() if pub_el is not None else ""

        desc = re.sub(r"<[^>]+>", "", html.unescape(desc))[:600]

        if title and link:
            articles.append({
                "title": title,
                "link": link,
                "description": desc,
                "rss_source": source,
                "published": pub,
            })

    # Atom
    for entry in root.findall(".//atom:entry", ns):
        title_el = entry.find("atom:title", ns)
        link_el = entry.find("atom:link", ns)
        summary_el = entry.find("atom:summary", ns) or entry.find("atom:content", ns)
        updated_el = entry.find("atom:updated", ns)

        title = (title_el.text or "").strip() if title_el is not None else ""
        link = (link_el.get("href", "") if link_el is not None else "").strip()
        desc = (summary_el.text or "").strip() if summary_el is not None else ""
        pub = (updated_el.text or "").strip() if updated_el is not None else ""
        desc = re.sub(r"<[^>]+>", "", html.unescape(desc))[:600]

        if title and link:
            articles.append({
                "title": title,
                "link": link,
                "description": desc,
                "rss_source": "",
                "published": pub,
            })

    return articles


def fetch_newsletter_feeds(max_per_source: int = 10) -> list[dict]:
    """Fetch articles from all newsletter RSS feeds."""
    all_articles = []

    for source_name, feed_urls in NEWSLETTER_FEEDS.items():
        fetched = False
        for feed_url in feed_urls:
            try:
                log.info(f"  Fetching {source_name}: {feed_url[:80]}...")
                raw = http_get(feed_url)
                articles = parse_rss(raw)
                if articles:
                    for a in articles[:max_per_source]:
                        a["source"] = source_name
                    all_articles.extend(articles[:max_per_source])
                    log.info(f"    -> {len(articles[:max_per_source])} articles")
                    fetched = True
                    break  # Got articles from this source, skip alternates
            except Exception as e:
                log.warning(f"    -> Failed: {e}")
                continue

        if not fetched:
            log.warning(f"  Could not fetch any feed for {source_name}")

    return all_articles


def fetch_supplementary_feeds(max_per_source: int = 5) -> list[dict]:
    """Fetch articles from supplementary tech RSS feeds."""
    all_articles = []

    for source_name, feed_url in SUPPLEMENTARY_FEEDS.items():
        try:
            log.info(f"  Fetching {source_name}: {feed_url[:80]}...")
            raw = http_get(feed_url)
            articles = parse_rss(raw)
            for a in articles[:max_per_source]:
                a["source"] = source_name
            all_articles.extend(articles[:max_per_source])
            log.info(f"    -> {len(articles[:max_per_source])} articles")
        except Exception as e:
            log.warning(f"    -> Failed: {e}")

    return all_articles


# ---------------------------------------------------------------------------
# Hacker News (Algolia API)
# ---------------------------------------------------------------------------

def fetch_hacker_news(max_items: int = 15) -> list[dict]:
    """Fetch top AI-related stories from Hacker News via Algolia API."""
    articles = []
    queries = [
        "AI", "LLM", "GPT", "Claude", "machine learning",
        "artificial intelligence", "deep learning",
    ]

    seen_ids = set()
    for query in queries:
        try:
            url = (
                f"https://hn.algolia.com/api/v1/search?"
                f"query={quote(query)}&tags=story&hitsPerPage=10"
                f"&numericFilters=created_at_i>{int(time.time()) - 86400 * 2}"
            )
            log.info(f"  HN search: {query}")
            data = http_get_json(url)
            for hit in data.get("hits", []):
                obj_id = hit.get("objectID", "")
                if obj_id in seen_ids:
                    continue
                seen_ids.add(obj_id)

                points = hit.get("points", 0) or 0
                num_comments = hit.get("num_comments", 0) or 0

                # Quality filter: require minimum engagement
                if points < 20:
                    continue

                title = hit.get("title", "")
                link = hit.get("url", "") or f"https://news.ycombinator.com/item?id={obj_id}"

                articles.append({
                    "title": title,
                    "link": link,
                    "description": f"[{points} points, {num_comments} comments on HN] {title}",
                    "source": "Hacker News",
                    "rss_source": "",
                    "published": hit.get("created_at", ""),
                    "hn_points": points,
                })
        except Exception as e:
            log.warning(f"    -> HN search failed for '{query}': {e}")

    # Sort by points descending, take top items
    articles.sort(key=lambda x: x.get("hn_points", 0), reverse=True)
    return articles[:max_items]


# ---------------------------------------------------------------------------
# Reddit
# ---------------------------------------------------------------------------

def fetch_reddit(subreddit: str, max_items: int = 10) -> list[dict]:
    """Fetch top posts from a subreddit via RSS feed."""
    articles = []
    try:
        url = f"https://www.reddit.com/r/{subreddit}/hot/.rss?limit={max_items}"
        log.info(f"  Reddit r/{subreddit} (RSS)...")
        raw = http_get(url)
        parsed = parse_rss(raw)

        for a in parsed[:max_items]:
            a["source"] = "Reddit"
            a["rss_source"] = f"r/{subreddit}"
            if a.get("description"):
                a["description"] = f"[r/{subreddit}] {a['description'][:400]}"
            else:
                a["description"] = f"[r/{subreddit}] {a['title']}"
            articles.append(a)

        log.info(f"    -> {len(articles)} posts")
    except Exception as e:
        log.warning(f"    -> Reddit r/{subreddit} failed: {e}")

    return articles


# ---------------------------------------------------------------------------
# Deduplication
# ---------------------------------------------------------------------------

def normalize_title(title: str) -> str:
    """Normalize a title for dedup comparison."""
    t = title.lower().strip()
    t = re.sub(r"[^\w\s]", "", t)
    t = re.sub(r"\s+", " ", t)
    return t


def title_fingerprint(title: str) -> str:
    """Create a short hash fingerprint of a normalized title."""
    return hashlib.md5(normalize_title(title).encode()).hexdigest()[:12]


def load_historical_titles(data_dir: Path, days: int = DEDUP_DAYS) -> set[str]:
    """Load title fingerprints from the last N days of data."""
    fingerprints = set()
    today = datetime.now(timezone.utc).date()

    for i in range(1, days + 1):
        d = today - timedelta(days=i)
        fpath = data_dir / f"{d.isoformat()}.json"
        if fpath.exists():
            try:
                with open(fpath, "r", encoding="utf-8") as f:
                    data = json.load(f)
                for item in data.get("news", []):
                    # Fingerprint both EN and ZH titles
                    en_title = item.get("title", {}).get("en", "")
                    zh_title = item.get("title", {}).get("zh", "")
                    if en_title:
                        fingerprints.add(title_fingerprint(en_title))
                    if zh_title:
                        fingerprints.add(title_fingerprint(zh_title))
                    # Also add source URLs for URL-based dedup
                    url = item.get("sourceUrl", "")
                    if url:
                        fingerprints.add(hashlib.md5(url.encode()).hexdigest()[:12])
            except Exception:
                pass

    log.info(f"  Loaded {len(fingerprints)} historical fingerprints from {days} days")
    return fingerprints


def deduplicate_articles(
    articles: list[dict],
    historical_fps: set[str],
) -> list[dict]:
    """Remove duplicate articles (within batch and against history)."""
    seen = set()
    result = []

    for a in articles:
        fp = title_fingerprint(a["title"])
        url_fp = hashlib.md5(a["link"].encode()).hexdigest()[:12] if a["link"] else ""

        # Skip if seen in this batch or in history
        if fp in seen or fp in historical_fps:
            continue
        if url_fp and (url_fp in seen or url_fp in historical_fps):
            continue

        seen.add(fp)
        if url_fp:
            seen.add(url_fp)
        result.append(a)

    log.info(f"  Dedup: {len(articles)} -> {len(result)} articles")
    return result


# ---------------------------------------------------------------------------
# AI keyword filter
# ---------------------------------------------------------------------------

AI_KEYWORDS = [
    "ai", "artificial intelligence", "machine learning", "deep learning",
    "llm", "large language model", "chatgpt", "gpt", "openai", "anthropic",
    "claude", "gemini", "deepmind", "neural", "generative", "transformer",
    "ai agent", "ai safety", "ai regulation", "ai model", "diffusion",
    "copilot", "midjourney", "stable diffusion", "nvidia", "gpu",
    "foundation model", "fine-tuning", "rag", "retrieval augmented",
    "multimodal", "vision model", "language model", "reasoning",
    "reinforcement learning", "rlhf", "alignment", "benchmark",
    "open source model", "hugging face", "ollama", "llama", "mistral",
    "deepseek", "qwen", "embedding", "vector database", "inference",
]


def is_ai_related(article: dict) -> bool:
    """Check if an article is AI-related."""
    text = (article["title"] + " " + article.get("description", "")).lower()
    return any(kw in text for kw in AI_KEYWORDS)


# ---------------------------------------------------------------------------
# OpenAI / LLM Integration
# ---------------------------------------------------------------------------

def call_llm(prompt: str, system_prompt: str = "", max_tokens: int = 8000) -> str:
    """Call OpenAI-compatible chat completions API with retry logic."""
    api_key = os.environ.get("OPENAI_API_KEY", "")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY environment variable is not set")

    base_url = os.environ.get("OPENAI_BASE_URL", "https://api.openai.com/v1").rstrip("/")
    model = os.environ.get("LLM_MODEL", "gpt-4.1-mini")

    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})

    payload = json.dumps({
        "model": model,
        "messages": messages,
        "temperature": 0.3,
        "max_tokens": max_tokens,
    }).encode()

    url = f"{base_url}/chat/completions"
    last_error = None

    for attempt in range(3):
        try:
            req = Request(
                url,
                data=payload,
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {api_key}",
                },
                method="POST",
            )
            log.info(f"  Calling LLM ({model}) ... (attempt {attempt + 1})")
            with urlopen(req, timeout=180) as resp:
                result = json.loads(resp.read())

            # Defensive: handle missing 'content' key (e.g. Gemini finish_reason=length)
            choice = result["choices"][0]
            message = choice.get("message", {})
            content = message.get("content") or ""
            finish_reason = choice.get("finish_reason", "unknown")

            if not content:
                raise RuntimeError(
                    f"LLM returned empty content (finish_reason={finish_reason}). "
                    f"Response: {json.dumps(result)[:300]}"
                )

            log.info(f"  LLM response: {len(content)} chars (finish={finish_reason})")
            return content

        except HTTPError as e:
            body = ""
            try:
                body = e.read().decode(errors="replace")[:300]
            except Exception:
                pass
            last_error = RuntimeError(f"HTTP {e.code} from LLM API: {body}")
            log.warning(f"  LLM attempt {attempt + 1} failed: HTTP {e.code} — {body}")
            if e.code in (429, 500, 502, 503, 504):
                time.sleep(5 * (attempt + 1))
                continue
            raise last_error  # 4xx errors (except 429) are not retryable

        except (URLError, TimeoutError) as e:
            last_error = e
            log.warning(f"  LLM attempt {attempt + 1} failed: {e}")
            time.sleep(5 * (attempt + 1))
            continue

        except RuntimeError:
            raise

    raise last_error or RuntimeError("LLM call failed after 3 attempts")


def build_article_list_text(articles: list[dict]) -> str:
    """Format articles into a numbered text list for the LLM prompt."""
    lines = []
    for i, a in enumerate(articles, 1):
        source = a.get("source", "Unknown")
        lines.append(
            f"{i}. [{source}] {a['title']}\n"
            f"   URL: {a['link']}\n"
            f"   {a.get('description', '')[:400]}"
        )
    return "\n\n".join(lines)


def generate_digest(articles: list[dict], target_date: str) -> list[dict]:
    """
    Two-stage LLM pipeline (adapted from ai-news-bot):
      Stage 1: Select 10-15 most important stories
      Stage 2: Generate bilingual structured JSON output
    """

    article_text = build_article_list_text(articles)

    # ── Stage 1: Selection ──────────────────────────────────────────────
    stage1_prompt = f"""Below are {len(articles)} AI-related news articles collected today ({target_date}) from curated sources including AlphaSignal, Ben's Bites, Import AI, TLDR AI, The Batch, Hacker News, and Reddit.

{article_text}

## YOUR TASK — STAGE 1: NEWS SELECTION

You are a senior AI industry analyst with extremely high standards. Select exactly 10-15 of the MOST IMPORTANT stories. Pursue a HIGH signal-to-noise ratio.

### SELECTION CRITERIA (strict):
- Groundbreaking research or technical breakthroughs (new models, new methods, SOTA results)
- Major product launches or significant updates from leading AI companies
- Important policy changes, regulations, or governance developments
- Large funding rounds (>$50M) or significant M&A
- Open-source releases with real impact
- Balanced coverage across categories: Models, Research, Engineering, Industry, Community

### REJECT:
- Minor updates, routine announcements, or incremental improvements
- Clickbait, opinion pieces without substance, or speculative articles
- Duplicate coverage of the same story from different sources (keep the best one)
- Multiple articles about the same event/announcement (pick ONE best article per topic)
- Articles older than 2 days
- Promotional content or company blog posts without real news value

### OUTPUT FORMAT:
Return ONLY a JSON array of the article numbers you selected. Example:
[1, 5, 8, 12, 15, 18, 22, 25, 30, 33, 36, 40]

Select 10-15 items. Ensure DIVERSITY: no two items should cover the same topic/event. No explanations."""

    stage1_response = call_llm(stage1_prompt)

    # Parse selected indices
    json_match = re.search(r'\[[\s\S]*?\]', stage1_response)
    if json_match:
        try:
            selected_indices = json.loads(json_match.group(0))
            selected_indices = [int(i) for i in selected_indices if isinstance(i, (int, float)) and 1 <= int(i) <= len(articles)]
        except (json.JSONDecodeError, ValueError):
            selected_indices = list(range(1, min(16, len(articles) + 1)))
    else:
        selected_indices = list(range(1, min(16, len(articles) + 1)))

    # Clamp to 10-12 (fewer = safer for LLM token limits)
    if len(selected_indices) < 8:
        remaining = [i for i in range(1, len(articles) + 1) if i not in selected_indices]
        selected_indices.extend(remaining[:12 - len(selected_indices)])
    elif len(selected_indices) > 12:
        selected_indices = selected_indices[:12]

    selected_articles = [articles[i - 1] for i in selected_indices if i <= len(articles)]
    log.info(f"  Stage 1: selected {len(selected_articles)} articles")

    # ── Stage 2: Bilingual structured output ────────────────────────────
    categories_desc = "\n".join(
        f'  - "{en}" (Chinese: "{info["zh"]}", color: "{info["color"]}")'
        for en, info in CATEGORIES.items()
    )

    # Generate in two batches of ~6 to avoid token-limit truncation
    mid = len(selected_articles) // 2
    batch1 = selected_articles[:mid]
    batch2 = selected_articles[mid:]

    all_items_raw = []
    for batch_num, batch in enumerate([batch1, batch2], 1):
        if not batch:
            continue
        batch_text = build_article_list_text(batch)
        batch_prompt = f"""You are a senior AI industry analyst. Create a bilingual (English + Chinese) news digest for the {len(batch)} pre-selected stories below.

Today's date: {target_date}

{batch_text}

## OUTPUT FORMAT

Return a JSON array. Each element must have this EXACT structure:

{{
  "id": "short-kebab-case-id",
  "category_en": "Category Name",
  "category_zh": "分类名称",
  "category_color": "#hex",
  "title_en": "Concise English headline",
  "title_zh": "简洁中文标题",
  "summary_en": "English analytical summary (3-5 sentences, ~400-600 chars). Self-contained: include all key facts, numbers, and context. Cover: what happened, technical details/metrics, why it matters.",
  "summary_zh": "中文分析摘要（3-5句，约150-250字）。必须自包含：包含所有关键事实、数据和背景。涵盖：发生了什么、技术细节/指标、为什么重要。",
  "source": "Source Name",
  "sourceUrl": "https://..."
}}

## AVAILABLE CATEGORIES (use ONLY these):
{categories_desc}

## QUALITY REQUIREMENTS:
- id: short, descriptive, kebab-case (e.g., "gpt5-release", "eu-ai-act-update")
- Summaries must be SELF-CONTAINED
- Chinese summaries should read naturally, use 「」for quotes
- Include ALL {len(batch)} stories — do not skip any
- source: use the newsletter/platform name
- sourceUrl: use the article's actual URL

## IMPORTANT:
- Return ONLY the JSON array, no markdown fences, no explanations
- Do NOT use smart/curly quotes — use only straight quotes
- Ensure valid JSON"""

        log.info(f"  Stage 2 batch {batch_num}/{2 if batch2 else 1}: {len(batch)} articles")
        raw = call_llm(batch_prompt, max_tokens=8000)
        raw = raw.strip()
        if raw.startswith("```"):
            raw = re.sub(r"^```(?:json)?\s*", "", raw)
            raw = re.sub(r"\s*```$", "", raw)

        # Attempt to recover truncated JSON by finding the last complete object
        try:
            batch_items = json.loads(raw)
        except json.JSONDecodeError:
            log.warning(f"  Batch {batch_num} JSON truncated, attempting recovery...")
            # Find the last complete JSON object ending with }}
            last_brace = raw.rfind("}")
            if last_brace > 0:
                recovered = raw[:last_brace + 1] + "]"
                # Ensure it starts with [
                if not recovered.lstrip().startswith("["):
                    recovered = "[" + recovered
                try:
                    batch_items = json.loads(recovered)
                    log.info(f"  Recovered {len(batch_items)} items from truncated response")
                except json.JSONDecodeError as e2:
                    log.error(f"  Recovery failed: {e2}")
                    batch_items = []
            else:
                batch_items = []

        all_items_raw.extend(batch_items)

    items = all_items_raw

    # Convert to frontend format
    news_items = []
    for item in items:
        cat_en = item.get("category_en", "Community Picks")
        cat_info = CATEGORIES.get(cat_en, CATEGORIES["Community Picks"])

        news_items.append({
            "id": item.get("id", f"news-{len(news_items)+1}"),
            "category": {
                "zh": item.get("category_zh", cat_info["zh"]),
                "en": cat_en,
                "color": item.get("category_color", cat_info["color"]),
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
# Main
# ---------------------------------------------------------------------------

def main():
    run_start = time.time()

    # Determine target date (UTC)
    target_date = os.environ.get("TARGET_DATE", "")
    if not target_date:
        target_date = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    log.info(f"{'=' * 60}")
    log.info(f"AI Daily Digest: {target_date}")
    log.info(f"{'=' * 60}")

    # ── Step 1: Collect articles from all sources ───────────────────────
    log.info("\n[1/5] Collecting articles from newsletter feeds...")
    newsletter_articles = fetch_newsletter_feeds(max_per_source=10)

    log.info("\n[2/5] Collecting from supplementary feeds...")
    supplementary_articles = fetch_supplementary_feeds(max_per_source=5)

    log.info("\n[3/5] Collecting from Hacker News...")
    hn_articles = fetch_hacker_news(max_items=15)

    log.info("\n[3/5] Collecting from Reddit...")
    reddit_articles = []
    for sub in ["MachineLearning", "LocalLLaMA"]:
        reddit_articles.extend(fetch_reddit(sub, max_items=10))

    # Combine all
    all_articles = newsletter_articles + hn_articles + reddit_articles + supplementary_articles
    raw_count = len(all_articles)
    log.info(f"\nTotal raw articles: {raw_count}")

    # Track per-source counts (raw)
    source_counts_raw: dict[str, int] = {}
    for a in all_articles:
        src = a.get("source", "Unknown")
        source_counts_raw[src] = source_counts_raw.get(src, 0) + 1

    # ── Step 2: Filter AI-related ───────────────────────────────────────
    # Newsletter articles are assumed AI-related; filter supplementary
    ai_articles = []
    for a in all_articles:
        if a.get("source") in NEWSLETTER_FEEDS or is_ai_related(a):
            ai_articles.append(a)

    filtered_count = len(ai_articles)
    log.info(f"AI-related articles: {filtered_count}")

    # ── Step 3: Deduplicate against history ─────────────────────────────
    log.info("\n[4/5] Deduplicating...")
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    historical_fps = load_historical_titles(DATA_DIR, DEDUP_DAYS)
    before_dedup = len(ai_articles)
    ai_articles = deduplicate_articles(ai_articles, historical_fps)
    dedup_removed = before_dedup - len(ai_articles)
    after_dedup_count = len(ai_articles)

    if after_dedup_count < 5:
        log.warning("Very few articles after dedup. Skipping update — no new content.")
        print("SKIP_UPDATE=true")
        sys.exit(0)

    # ── Step 4: Generate digest via LLM ─────────────────────────────────
    log.info(f"\n[5/5] Generating bilingual digest from {after_dedup_count} articles...")
    try:
        news_items = generate_digest(ai_articles, target_date)
    except Exception as e:
        log.error(f"LLM generation failed: {e}", exc_info=True)
        sys.exit(1)

    if not news_items:
        log.error("No news items generated!")
        sys.exit(1)

    final_count = len(news_items)
    log.info(f"Generated {final_count} news items")

    elapsed_seconds = round(time.time() - run_start)

    # Build per-source breakdown from final news items
    source_counts_final: dict[str, int] = {}
    for item in news_items:
        src = item.get("source", "Unknown")
        source_counts_final[src] = source_counts_final.get(src, 0) + 1

    # Build crawl_log
    crawl_log = {
        "fetchedAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "elapsedSeconds": elapsed_seconds,
        "rawArticles": raw_count,
        "afterFilter": filtered_count,
        "afterDedup": after_dedup_count,
        "dedupRemoved": dedup_removed,
        "finalStories": final_count,
        "model": os.environ.get("LLM_MODEL", "gpt-4.1-mini"),
        "sourceBreakdown": source_counts_final,
    }

    # ── Step 5: Write output ────────────────────────────────────────────
    dt = datetime.strptime(target_date, "%Y-%m-%d")
    date_label = {
        "zh": f"{dt.year}年{dt.month}月{dt.day}日",
        "en": dt.strftime("%B %d, %Y"),
    }

    digest = {
        "date": target_date,
        "dateLabel": date_label,
        "crawlLog": crawl_log,
        "news": news_items,
    }

    output_path = DATA_DIR / f"{target_date}.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(digest, f, ensure_ascii=False, indent=2)
    log.info(f"Written: {output_path}")

    # Update index.json
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
    log.info(f"Updated: {index_path}")

    log.info(f"\n{'=' * 60}")
    log.info(f"Done! {len(news_items)} stories for {target_date}")
    log.info(f"{'=' * 60}")


if __name__ == "__main__":
    main()
