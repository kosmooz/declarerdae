"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import StickyHeader from "@/components/landing/layout/StickyHeader";
import FooterSection from "@/components/landing/sections/FooterSection";
import BlockRenderer from "@/components/blog/BlockRenderer";
import TableOfContents from "@/components/blog/TableOfContents";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImage: string | null;
  content: any[];
  readingTime: number | null;
  publishedAt: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  status: string;
  author: { firstName: string | null; lastName: string | null };
  categories: { id: string; name: string; slug: string; color: string | null }[];
}

export default function BlogArticleClient() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isPreview = searchParams.get("preview") === "1";
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.slug) return;
    const ctrl = new AbortController();
    setLoading(true);
    const url = isPreview
      ? `/api/blog/admin/articles/preview/${params.slug}`
      : `/api/blog/public/articles/${params.slug}`;
    apiFetch(url, { silent: true, signal: ctrl.signal } as any)
      .then(async (res) => {
        if (res.ok) {
          setArticle(await res.json());
        } else {
          router.push("/blog");
        }
      })
      .catch((err: unknown) => { if ((err as Error).name !== "AbortError") console.error("[blog-article]", err); })
      .finally(() => { if (!ctrl.signal.aborted) setLoading(false); });
    return () => ctrl.abort();
  }, [params.slug, router, isPreview]);

  const fmt = (d: string | null) =>
    d
      ? new Date(d).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "";

  if (loading) {
    return (
      <>
        <StickyHeader />
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      </>
    );
  }

  if (!article) return null;

  return (
    <>
      <StickyHeader />
      {isPreview && article.status !== "PUBLISHED" && (
        <div className="bg-amber-500 text-white text-center text-sm font-medium py-2 px-4 sticky top-0 z-50">
          Apercu — Cet article est en brouillon et n&apos;est pas visible publiquement
        </div>
      )}
      <main className="min-h-screen bg-white">
        {/* Hero — full-width */}
        <section
          className="relative pt-24 pb-14 md:pt-28 md:pb-20"
          style={{
            background: article.featuredImage
              ? undefined
              : "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
          }}
        >
          {article.featuredImage && (
            <>
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${article.featuredImage})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/70 to-slate-900/90" />
            </>
          )}
          <div className="relative container max-w-5xl">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-8">
              <Link href="/" className="hover:text-white transition-colors">
                Accueil
              </Link>
              <span>/</span>
              <Link href="/blog" className="hover:text-white transition-colors">
                Blog
              </Link>
              <span>/</span>
              <span className="text-slate-300 truncate max-w-[250px]">
                {article.title}
              </span>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2 mb-5">
              {article.categories.map((cat) => (
                <span
                  key={cat.id}
                  className="px-3 py-1 text-[11px] font-semibold rounded-full text-white/90 backdrop-blur-sm"
                  style={{ backgroundColor: (cat.color || "#94a3b8") + "cc" }}
                >
                  {cat.name}
                </span>
              ))}
            </div>

            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-5 leading-tight max-w-3xl">
              {article.title}
            </h1>

            {article.excerpt && (
              <p className="text-slate-300 text-sm md:text-base max-w-2xl mb-6 leading-relaxed">
                {article.excerpt}
              </p>
            )}

            <div className="flex items-center gap-4 text-xs md:text-sm text-slate-400">
              {article.author.firstName && (
                <span>
                  Par {article.author.firstName} {article.author.lastName}
                </span>
              )}
              <span>{fmt(article.publishedAt)}</span>
              {article.readingTime && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {article.readingTime} min de lecture
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-10">
            {/* Sticky TOC */}
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <TableOfContents blocks={article.content} />
              </div>
            </aside>

            {/* Article body */}
            <article className="max-w-3xl">
              <BlockRenderer blocks={article.content} />
            </article>
          </div>

          {/* Back link */}
          <div className="mt-12 pt-8 border-t border-slate-200">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-red-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour aux articles
            </Link>
          </div>
        </div>
      </main>
      <FooterSection />
    </>
  );
}
