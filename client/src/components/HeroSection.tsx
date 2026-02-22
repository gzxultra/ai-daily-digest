/*
 * Design: Editorial Magazine Style
 * - Full-width hero with generated AI background
 * - Bold typography with Space Grotesk
 * - Gradient overlay for text readability
 * - Source badges for high-quality AI news sources
 */
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { Sparkles, Rss } from "lucide-react";

const HERO_BG = "https://private-us-east-1.manuscdn.com/sessionFile/kkiENs5Ba5qox3QNZDh2Du/sandbox/vPPWsVJbzvhuyziSSA1QBL-img-1_1771737230000_na1fn_aGVyby1iZw.jpg?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUva2tpRU5zNUJhNXFveDNRTlpEaDJEdS9zYW5kYm94L3ZQUFdzVkpienZodXl6aVNTQTFRQkwtaW1nLTFfMTc3MTczNzIzMDAwMF9uYTFmbl9hR1Z5YnkxaVp3LmpwZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=IUv17eMu4kqmil0W2JSqHL-NsPeEhmnm7ZBEBeouBD5r3tCxgxeEiU4D3wERwO-y6RzIn3XeMFRkP8hJnWtrPFgxpWFJUrMIc1IyfNG~gL4-MmzLvqf0R3esHkLL1MUMZPra7yF0ht4V8HJtEGFCdkPfJZQp126C3npW5cvGkh~wgNRJ6iAuSZ4OQdEIy6qxRF3CGg6aPgr9zh8vumrP5aXLsL6DLp3yrwOBRHUyGyMtqez4N7vOvXlwtiel36A-eQ5Uby324k9N~0VBc2uU6JXYHpicDklnKecmk4Q6LPPXBgpYmwc60osE0reUQKj86rhCpWG6KZWMezsXxOkJLg__";

const AI_GLOBE = "https://private-us-east-1.manuscdn.com/sessionFile/kkiENs5Ba5qox3QNZDh2Du/sandbox/vPPWsVJbzvhuyziSSA1QBL-img-4_1771737228000_na1fn_YWktZ2xvYmU.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUva2tpRU5zNUJhNXFveDNRTlpEaDJEdS9zYW5kYm94L3ZQUFdzVkpienZodXl6aVNTQTFRQkwtaW1nLTRfMTc3MTczNzIyODAwMF9uYTFmbl9ZV2t0WjJ4dlltVS5wbmc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=l-h0le3qbGYtghFCBcnMIeewTqnZ2G4IYBollRMgXmo~M39fJMqgwIOyxqlxP4SGASdu7Y1R2z9OJqBcPwQz1vXrtxzDk3MqIlIVdarLiJxB4C0GrJlpIky4phEZBfoS0Bc-Dw8UIo4SUpd2SWLzd2SFmzWgiASanGhMsMosboZgr5ApqyRFYESvXzN5Ectbi-P4jQw~zs~fEigrd3a0rtn9DJj~1CXty8itsIgYKGutxBnE5bqFQWOKkSiTDaE2BI6Unt2Bc3Kku-fA4rN9eh-Qqmb~oBUw9NbRLMPFwMMBSituAOXK2JHhFqOGNM3meXuZ8uDvINtFS5hrQnNaEw__";

const SOURCES = [
  "AlphaSignal", "Ben's Bites", "Import AI",
  "TLDR AI", "The Batch", "Hacker News"
];

interface HeroSectionProps {
  newsCount: number;
  date: string;
}

export default function HeroSection({ newsCount, date }: HeroSectionProps) {
  const { lang } = useLanguage();

  return (
    <section className="relative overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${HERO_BG})` }}
      />
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

      <div className="relative container py-16 sm:py-20 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left: Text Content */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-semibold text-cyan-400 uppercase tracking-widest">
                  {lang === "zh" ? "高信噪比 · 每日精选" : "High Signal · Daily Curated"}
                </span>
              </div>

              <h2
                className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-4"
                style={{ fontFamily: "'Space Grotesk', 'Noto Sans SC', sans-serif" }}
              >
                {lang === "zh" ? (
                  <>
                    AI 世界
                    <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                      今日要闻
                    </span>
                  </>
                ) : (
                  <>
                    Today in
                    <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                      AI World
                    </span>
                  </>
                )}
              </h2>

              <p className="text-base sm:text-lg text-gray-300 leading-relaxed mb-6 max-w-lg">
                {lang === "zh"
                  ? `${date} — 精选 ${newsCount} 条硬核 AI 资讯，聚焦技术突破、开源项目、模型发布与开发者工具。`
                  : `${date} — ${newsCount} curated high-signal AI stories covering technical breakthroughs, open source, model releases, and dev tools.`}
              </p>

              {/* Stats Pills */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs text-gray-300 font-medium">
                    {lang === "zh" ? `${newsCount} 条新闻` : `${newsCount} Stories`}
                  </span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10">
                  <Rss className="w-3 h-3 text-gray-300" />
                  <span className="text-xs text-gray-300 font-medium">
                    {lang === "zh" ? "6 个专业来源" : "6 Expert Sources"}
                  </span>
                </div>
              </div>

              {/* Source Badges */}
              <div className="flex flex-wrap gap-2">
                {SOURCES.map((src) => (
                  <span
                    key={src}
                    className="px-2.5 py-1 rounded-md text-[10px] font-medium text-gray-400 bg-white/5 border border-white/10"
                  >
                    {src}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right: Globe Image (hidden on small screens) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden lg:flex justify-center"
          >
            <img
              src={AI_GLOBE}
              alt="AI Globe"
              className="w-72 h-72 xl:w-80 xl:h-80 object-contain opacity-80 drop-shadow-2xl"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
