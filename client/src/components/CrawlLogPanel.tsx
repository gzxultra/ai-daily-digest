import { useLanguage } from "@/contexts/LanguageContext";
import type { CrawlLog } from "@/data/news";
import { ChevronDown, Activity, Database, Clock, Cpu, BarChart3 } from "lucide-react";
import { useState } from "react";

interface CrawlLogPanelProps {
  log: CrawlLog;
}

export default function CrawlLogPanel({ log }: CrawlLogPanelProps) {
  const { lang } = useLanguage();
  const [expanded, setExpanded] = useState(false);

  const fetchedDate = new Date(log.fetchedAt);
  const timeStr = fetchedDate.toLocaleTimeString(lang === "zh" ? "zh-CN" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  });

  const sortedSources = Object.entries(log.sourceBreakdown).sort((a, b) => b[1] - a[1]);

  return (
    <div className="rounded-xl border border-border bg-card/50 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-secondary/30 transition-colors"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-2.5">
          <Activity className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-foreground">
            {lang === "zh" ? "数据采集日志" : "Pipeline Log"}
          </span>
          <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
            {timeStr}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {expanded && (
        <div className="px-5 pb-5 pt-1 border-t border-border/50 animate-fade-in-up" style={{ animationDuration: "0.2s" }}>
          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-secondary/50">
              <Database className="w-3.5 h-3.5 text-muted-foreground" />
              <div>
                <div className="text-sm font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', monospace" }}>
                  {log.rawArticles}
                </div>
                <div className="text-[10px] text-muted-foreground">{lang === "zh" ? "原始文章" : "Raw Articles"}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-secondary/50">
              <BarChart3 className="w-3.5 h-3.5 text-muted-foreground" />
              <div>
                <div className="text-sm font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', monospace" }}>
                  {log.finalStories}
                </div>
                <div className="text-[10px] text-muted-foreground">{lang === "zh" ? "最终收录" : "Final Stories"}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-secondary/50">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              <div>
                <div className="text-sm font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', monospace" }}>
                  {Math.round(log.elapsedSeconds)}s
                </div>
                <div className="text-[10px] text-muted-foreground">{lang === "zh" ? "处理耗时" : "Elapsed"}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-secondary/50">
              <Cpu className="w-3.5 h-3.5 text-muted-foreground" />
              <div>
                <div className="text-sm font-bold text-foreground truncate max-w-[120px]" style={{ fontFamily: "'Space Grotesk', monospace" }}>
                  {log.model}
                </div>
                <div className="text-[10px] text-muted-foreground">{lang === "zh" ? "模型" : "Model"}</div>
              </div>
            </div>
          </div>

          {/* Pipeline funnel */}
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-4">
            <span className="font-mono">{log.rawArticles}</span>
            <span>→</span>
            <span>{lang === "zh" ? "过滤" : "filter"}</span>
            <span>→</span>
            <span className="font-mono">{log.afterFilter}</span>
            <span>→</span>
            <span>{lang === "zh" ? "去重" : "dedup"}</span>
            <span className="text-destructive/60">(-{log.dedupRemoved})</span>
            <span>→</span>
            <span className="font-mono font-bold text-foreground">{log.finalStories}</span>
          </div>

          {/* Source breakdown */}
          {sortedSources.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {lang === "zh" ? "来源分布" : "Source Breakdown"}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {sortedSources.map(([source, count]) => (
                  <span
                    key={source}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-secondary text-[11px] text-muted-foreground"
                  >
                    {source}
                    <span className="font-bold text-foreground/70">{count}</span>
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
