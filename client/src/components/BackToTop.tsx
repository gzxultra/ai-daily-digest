import { ArrowUp } from "lucide-react";
import { useState, useEffect } from "react";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-10 h-10 rounded-full
                 bg-foreground text-background shadow-lg hover:shadow-xl
                 hover:scale-110 transition-all duration-200 animate-fade-in-up"
      style={{ animationDuration: "0.2s" }}
      aria-label="Back to top"
    >
      <ArrowUp className="w-4 h-4" />
    </button>
  );
}
