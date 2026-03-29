import { Home } from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";

export default function NotFound() {
  const [, setLocation] = useLocation();
  const { lang } = useLanguage();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-8">
      <div className="flex flex-col items-center text-center max-w-md animate-fade-in-up">
        <span
          className="text-8xl font-black text-foreground/10 leading-none select-none mb-4"
          style={{ fontFamily: "'Space Grotesk', monospace" }}
        >
          404
        </span>
        <h1 className="text-xl font-bold text-foreground mb-2">
          {lang === "zh" ? "页面未找到" : "Page Not Found"}
        </h1>
        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
          {lang === "zh"
            ? "抱歉，您访问的页面不存在。可能已被移动或删除。"
            : "Sorry, the page you are looking for doesn't exist. It may have been moved or deleted."}
        </p>
        <button
          onClick={() => setLocation("/")}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Home className="w-4 h-4" />
          {lang === "zh" ? "返回首页" : "Go Home"}
        </button>
      </div>
    </div>
  );
}
