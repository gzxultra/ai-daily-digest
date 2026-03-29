import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

type Language = "zh" | "en";

interface LanguageContextType {
  lang: Language;
  toggleLang: () => void;
  t: (obj: { zh: string; en: string }) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function getInitialLang(): Language {
  try {
    const stored = localStorage.getItem("ai-digest-lang");
    if (stored === "zh" || stored === "en") return stored;
  } catch {}
  const browserLang = navigator.language || "";
  if (browserLang.startsWith("zh")) return "zh";
  return "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>(getInitialLang);

  useEffect(() => {
    try { localStorage.setItem("ai-digest-lang", lang); } catch {}
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  }, [lang]);

  const toggleLang = useCallback(() => {
    setLang((prev) => (prev === "zh" ? "en" : "zh"));
  }, []);

  const t = useCallback(
    (obj: { zh: string; en: string }) => obj[lang],
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
