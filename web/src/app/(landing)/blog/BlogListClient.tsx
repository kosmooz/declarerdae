"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { apiFetch } from "@/lib/api";
import StickyHeader from "@/components/landing/layout/StickyHeader";
import FooterSection from "@/components/landing/sections/FooterSection";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImage: string | null;
  readingTime: number | null;
  publishedAt: string | null;
  author: { firstName: string | null; lastName: string | null };
  categories: { id: string; name: string; slug: string; color: string | null }[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  _count: { articles: number };
}

export default function BlogListClient() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchArticles = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", "12");
    if (selectedCategory) params.set("category", selectedCategory);

    try {
      const res = await apiFetch(`/api/blog/public/articles?${params}`, {
        silent: true,
        signal,
      } as any);
      if (res.ok) {
        const data = await res.json();
        setArticles(data.items);
        setTotalPages(data.totalPages);
      }
    } catch (err: unknown) {
      if ((err as Error).name !== "AbortError") console.error("[blog-articles]", err);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [page, selectedCategory]);

  useEffect(() => {
    const ctrl = new AbortController();
    apiFetch("/api/blog/public/categories", { silent: true, signal: ctrl.signal } as any)
      .then((r) => (r.ok ? r.json() : []))
      .then(setCategories)
      .catch((err: unknown) => { if ((err as Error).name !== "AbortError") console.error("[blog-categories]", err); });
    return () => ctrl.abort();
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    fetchArticles(ctrl.signal).catch(() => {});
    return () => ctrl.abort();
  }, [fetchArticles]);

  useEffect(() => {
    setPage(1);
  }, [selectedCategory]);

  const fmt = (d: string | null) =>
    d
      ? new Date(d).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "";

  return (
    <>
      <StickyHeader />
      <main className="min-h-screen bg-white">
        {/* Hero */}
        <section className="bg-slate-900 pt-28 pb-16 text-center">
          <div className="max-w-3xl mx-auto px-4">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">
              Blog <span className="text-red-500">STAR aid</span>
            </h1>
            <p className="text-slate-400 text-lg">
              Actualités, conseils et réglementations en prévention des risques
            </p>
          </div>
        </section>

        {/* Category filters */}
        {categories.length > 0 && (
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => setSelectedCategory("")}
                className={`px-4 py-1.5 text-sm rounded-full border transition-colors ${
                  !selectedCategory
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                Tous
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`px-4 py-1.5 text-sm rounded-full border transition-colors ${
                    selectedCategory === cat.slug
                      ? "text-white border-transparent"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                  style={
                    selectedCategory === cat.slug
                      ? { backgroundColor: cat.color || "#1e293b" }
                      : {}
                  }
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Articles grid */}
        <div className="max-w-6xl mx-auto px-4 pb-16">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" />
            </div>
          ) : articles.length === 0 ? (
            <p className="text-center py-16 text-slate-400">
              Aucun article publié pour le moment.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article) => (
                  <Link
                    key={article.id}
                    href={`/blog/${article.slug}`}
                    className="group block bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all"
                  >
                    {article.featuredImage && (
                      <div className="relative aspect-video bg-slate-100 overflow-hidden">
                        <Image
                          src={article.featuredImage}
                          alt={article.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          unoptimized
                        />
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
                      <h2 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-red-600 transition-colors line-clamp-2">
                        {article.title}
                      </h2>
                      {article.excerpt && (
                        <p className="text-sm text-slate-500 mb-3 line-clamp-2">
                          {article.excerpt}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-slate-400">
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="flex items-center px-3 text-sm text-slate-500">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <FooterSection />
    </>
  );
}
