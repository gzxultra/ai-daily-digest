# AI Daily Digest

> 每日 AI 情报简报 | Daily AI Intelligence Briefing

A modern, bilingual (Chinese/English) AI news digest website that automatically curates and publishes the most important AI news every day.

## Features

- **Daily Auto-Update**: GitHub Actions runs daily at UTC 00:00 (Beijing 08:00) to fetch and publish new AI stories
- **Bilingual**: Full Chinese/English toggle for all content
- **Dark/Light Mode**: Theme switching with smooth transitions
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Category Filtering**: Color-coded categories for easy navigation
- **Date Navigation**: Browse historical digests by date

## Tech Stack

- **Frontend**: React 19 + Vite + Tailwind CSS 4
- **Data**: JSON files served as static assets
- **News Collection**: Python script using Google News RSS + OpenAI API
- **CI/CD**: GitHub Actions (daily cron + manual trigger)
- **Hosting**: GitHub Pages

## How It Works

1. **GitHub Actions** triggers daily (or manually)
2. **Python script** (`scripts/fetch_news.py`) fetches AI news from RSS feeds
3. **OpenAI API** generates bilingual summaries and categorizes stories
4. Data is committed as JSON to `client/public/data/`
5. **Vite** builds the static site
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
3. Enable GitHub Pages: Settings → Pages → Source: GitHub Actions
4. The workflow will run automatically every day, or trigger manually from Actions tab

### Manual News Fetch

```bash
export OPENAI_API_KEY=your_key_here
python scripts/fetch_news.py
```

## Project Structure

```
├── .github/workflows/     # GitHub Actions CI/CD
│   └── daily-update.yml   # Daily news fetch + build + deploy
├── client/
│   ├── public/data/       # JSON news data (auto-updated)
│   │   ├── index.json     # Date index
│   │   └── YYYY-MM-DD.json
│   └── src/
│       ├── components/    # React components
│       ├── contexts/      # Theme & Language contexts
│       ├── data/          # Data types & fetch utilities
│       └── pages/         # Page components
├── scripts/
│   └── fetch_news.py      # News collection script
└── vite.config.ghpages.ts # Build config for GitHub Pages
```

## License

MIT
# Cache bust Sun Feb 22 00:48:20 EST 2026
