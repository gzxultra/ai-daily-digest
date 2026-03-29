# AI Daily Digest

> 每日 AI 情报简报 | Daily AI Intelligence Briefing

[![Daily Update](https://github.com/gzxultra/ai-daily-digest/actions/workflows/daily-news.yml/badge.svg)](https://github.com/gzxultra/ai-daily-digest/actions/workflows/daily-news.yml)
[![Deploy](https://github.com/gzxultra/ai-daily-digest/actions/workflows/daily-update.yml/badge.svg)](https://github.com/gzxultra/ai-daily-digest/actions/workflows/daily-update.yml)

A modern, bilingual (Chinese/English) AI news digest website that automatically curates and publishes the most important AI news every day. Fully automated with GitHub Actions, powered by LLM-based summarization.

**Live Site**: [gzxultra.github.io/ai-daily-digest](https://gzxultra.github.io/ai-daily-digest/)

## Features

- **Daily Auto-Update**: GitHub Actions runs daily to fetch and publish new AI stories
- **Bilingual**: Full Chinese/English toggle with browser language auto-detection
- **Dark/Light Mode**: Theme switching with system preference detection
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Category Filtering**: Color-coded categories with story counts
- **Date Navigation**: Browse historical digests with prev/next navigation
- **Full-text Search**: Search across titles, summaries, sources, and categories (⌘K)
- **Share**: Share stories via Web Share API or copy link
- **Reading Progress**: Visual progress bar while scrolling
- **Pipeline Transparency**: Expandable crawl log showing data collection stats
- **SEO Optimized**: Open Graph, Twitter Cards, structured data, sitemap
- **PWA Ready**: Web app manifest for installable experience
- **Accessibility**: Skip navigation, ARIA labels, keyboard shortcuts, reduced motion support
- **Performance**: CSS animations, intersection observer lazy loading, code splitting

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19 + TypeScript + Vite 7 |
| Styling | Tailwind CSS 4 + custom CSS animations |
| UI Components | Radix UI primitives + Lucide icons |
| Data | Static JSON files |
| News Collection | Python + RSS feeds + LLM summarization |
| CI/CD | GitHub Actions (daily cron + deploy on push) |
| Hosting | GitHub Pages |

## How It Works

1. **GitHub Actions** triggers daily at UTC 15:00 (or manually)
2. **Python script** (`scripts/fetch_news.py`) fetches AI news from RSS feeds, Hacker News, and Reddit
3. **LLM** generates bilingual summaries, categorizes stories, and deduplicates
4. Data is committed as JSON to `client/public/data/`
5. **Vite** builds the optimized static site
6. **GitHub Pages** serves the result

## Setup

### Prerequisites

- Node.js 22+
- pnpm
- Python 3.11+

### Local Development

```bash
pnpm install
pnpm dev
```

### Configure Auto-Update

1. Go to your GitHub repo Settings → Secrets → Actions
2. Add secret: `OPENAI_API_KEY` with your OpenAI API key
3. Optionally add `OPENAI_BASE_URL` and `LLM_MODEL` for custom endpoints
4. Enable GitHub Pages: Settings → Pages → Source: GitHub Actions
5. The workflow will run automatically every day, or trigger manually from Actions tab

### Manual News Fetch

```bash
export OPENAI_API_KEY=your_key_here
python scripts/fetch_news.py
```

## Project Structure

```
├── .github/workflows/
│   ├── daily-news.yml       # Daily news fetch + build + deploy
│   └── daily-update.yml     # Deploy on push to main
├── client/
│   ├── public/
│   │   ├── data/            # JSON news data (auto-updated)
│   │   ├── manifest.json    # PWA manifest
│   │   ├── robots.txt       # SEO robots
│   │   └── sitemap.xml      # SEO sitemap
│   └── src/
│       ├── components/      # React components
│       ├── contexts/        # Theme & Language contexts
│       ├── data/            # Data types & fetch utilities
│       ├── hooks/           # Custom React hooks
│       └── pages/           # Page components
├── scripts/
│   └── fetch_news.py        # News collection script
└── vite.config.ghpages.ts   # Build config for GitHub Pages
```

## License

MIT
