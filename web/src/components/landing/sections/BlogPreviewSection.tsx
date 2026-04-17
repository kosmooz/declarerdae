"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { BookOpen, ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImage: string | null;
  readingTime: number | null;
  publishedAt: string | null;
  categories: { id: string; name: string; color: string | null }[];
}

function ScrollReveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function BlogPreviewSection() {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    apiFetch("/api/blog/public/articles?limit=3", { silent: true } as any)
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((data) => setArticles(data.items || []))
      .catch(() => {});
  }, []);

  if (articles.length === 0) return null;

  const fmt = (d: string | null) =>
    d
      ? new Date(d).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "";

  return (
    <section id="blog" className="py-14 md:py-20 bg-white">
      <div className="container">
        {/* Header */}
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 text-[#d92d20] text-xs font-bold uppercase tracking-wider mb-3 font-sans">
              <BookOpen className="w-4 h-4" />
              Nos derniers articles
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl text-gray-900 mb-3">
              Ressources et <span className="text-[#d92d20]">actualités</span>
            </h2>
            <p className="text-gray-500 text-sm md:text-base font-sans">
              Premiers secours, réglementation, formation — retrouvez nos
              conseils et informations pour mieux protéger vos équipes.
            </p>
          </div>
        </ScrollReveal>

        {/* Articles grid */}
        <ScrollReveal delay={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/blog/${article.slug}`}
                className="group block bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all"
              >
                {article.featuredImage ? (
                  <div className="aspect-video bg-gray-100 overflow-hidden">
                    <img
                      src={article.featuredImage}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                    <BookOpen className="w-10 h-10 text-gray-300" />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {article.categories.map((cat) => (
                      <span
                        key={cat.id}
                        className="px-2 py-0.5 text-[10px] font-medium rounded-full text-white"
                        style={{
                          backgroundColor: cat.color || "#94a3b8",
                        }}
                      >
                        {cat.name}
                      </span>
                    ))}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 group-hover:text-[#d92d20] transition-colors line-clamp-2 font-sans">
                    {article.title}
                  </h3>
                  {article.excerpt && (
                    <p className="text-sm text-gray-500 font-sans line-clamp-2 mb-3">
                      {article.excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-gray-400 font-sans">
                    <span>{fmt(article.publishedAt)}</span>
                    {article.readingTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {article.readingTime} min
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </ScrollReveal>

        {/* CTA */}
        <ScrollReveal delay={0.2}>
          <div className="text-center">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold text-sm hover:bg-gray-800 transition-colors font-sans"
            >
              Voir tous les articles
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
