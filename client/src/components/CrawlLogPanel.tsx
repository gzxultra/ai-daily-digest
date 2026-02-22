/*
 * CrawlLogPanel — collapsible "pipeline stats" panel shown below the news grid.
 * Design: dark terminal card with monospace text, subtle green accents.
 * Collapsed by default; expands on click.
 */
import { useState } from "react";
import { ChevronDown, ChevronUp, Activity } from "lucide-react";
import type { CrawlLog } from "@/data/news";
import { useLanguage } from "@/contexts/LanguageContext";

interface Props {
  log: CrawlLog;
}

function fmt(n: number) {
  return n.toLocaleString();
}

function fmtTime(iso: string, lang: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString(lang === "zh" ? "zh-CN" : "en-US", {
      timeZone: "America/Los_Angeles",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });
  } catch {
    return iso;
  }
}

function fmtElapsed(s: number): string {
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return rem > 0 ? `${m}m ${rem}s` : `${m}m`;
}

export default function CrawlLogPanel({ log }: Props) {
  const { lang } = useLanguage();
  const [open, setOpen] = useState(false);

  const pipeline = [
    {
      key: "raw",
      label: lang === "zh" ? "原始抓取" : "Fetched",
      value: fmt(log.rawArticles),
      color: "text-slate-400",
    },
    {
      key: "filter",
      label: lang === "zh" ? "AI 过滤后" : "AI-filtered",
      value: fmt(log.afterFilter),
      color: "text-blue-400",
    },
    {
      key: "dedup",
      label: lang === "zh" ? "去重后" : "After dedup",
      value: fmt(log.afterDedup),
      color: "text-yellow-400",
    },
    {
      key: "final",
      label: lang === "zh" ? "精选入刊" : "Published",
      value: fmt(log.finalStories),
      color: "text-emerald-400",
    },
  ];

  const sources = Object.entries(log.sourceBreakdown).sort((a, b) => b[1] - a[1]);

  return (
    <div className="mt-10 mb-2">
      {/* Toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground hover:text-foreground transition-colors group"
        aria-expanded={open}
      >
        <Activity className="w-3.5 h-3.5 text-emerald-500 group-hover:text-emerald-400 transition-colors" />
        <span className="uppercase tracking-widest">
          {lang === "zh" ? "抓取日志" : "Crawl Log"}
        </span>
        {open ? (
          <ChevronUp className="w-3 h-3 ml-0.5" />
        ) : (
          <ChevronDown className="w-3 h-3 ml-0.5" />
        )}
      </button>

      {/* Collapsible panel */}
      {open && (
        <div
          className="mt-3 rounded-lg border border-border bg-[#0d0d0d] dark:bg-[#0a0a0a] p-4 font-mono text-[11px] leading-relaxed overflow-x-auto"
          style={{ fontFamily: "'Space Grotesk', 'Courier New', monospace" }}
        >
          {/* Header line */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-4 pb-3 border-b border-white/10">
            <span className="text-emerald-500 font-bold">
              ● {lang === "zh" ? "运行成功" : "run:success"}
            </span>
            <span className="text-slate-500">
              {fmtTime(log.fetchedAt, lang)}
            </span>
            <span className="text-slate-500">
              {lang === "zh" ? "耗时" : "elapsed"}{" "}
              <span className="text-slate-300">{fmtElapsed(log.elapsedSeconds)}</span>
            </span>
            <span className="text-slate-500">
              {lang === "zh" ? "模型" : "model"}{" "}
              <span className="text-purple-400">{log.model}</span>
            </span>
          </div>

          {/* Pipeline stats */}
          <div className="mb-4">
            <div className="text-slate-600 mb-2">
              {lang === "zh" ? "# 处理管道" : "# pipeline"}
            </div>
            <div className="flex flex-wrap gap-3">
              {pipeline.map((step, i) => (
                <div key={step.key} className="flex items-center gap-1.5">
                  {i > 0 && <span className="text-slate-700">→</span>}
                  <span className="text-slate-500">{step.label}</span>
                  <span className={`font-bold ${step.color}`}>{step.value}</span>
                </div>
              ))}
              {log.dedupRemoved > 0 && (
                <span className="text-slate-600 ml-1">
                  ({lang === "zh" ? "去重" : "deduped"}{" "}
                  <span className="text-orange-400">-{fmt(log.dedupRemoved)}</span>)
                </span>
              )}
            </div>
          </div>

          {/* Source breakdown */}
          {sources.length > 0 && (
            <div>
              <div className="text-slate-600 mb-2">
                {lang === "zh" ? "# 来源分布" : "# sources"}
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-1">
                {sources.map(([src, count]) => (
                  <span key={src} className="text-slate-400">
                    {src}{" "}
                    <span className="text-emerald-400 font-bold">{count}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
