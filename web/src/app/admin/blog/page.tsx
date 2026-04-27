"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Tag } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useDevMode } from "@/lib/useDevMode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Article {
  id: string;
  title: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED";
  readingTime: number | null;
  publishedAt: string | null;
  createdAt: string;
  author: { firstName: string | null; lastName: string | null; email: string };
  categories: { id: string; name: string; color: string | null }[];
}

export default function AdminBlogPage() {
  const router = useRouter();
  const dev = useDevMode();
  const [articles, setArticles] = useState<Article[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const limit = 20;

  const fetchArticles = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    if (categoryFilter) params.set("categoryId", categoryFilter);

    try {
      const res = await apiFetch(`/api/blog/admin/articles?${params}`, { signal });
      if (res.ok) {
        const data = await res.json();
        setArticles(data.items);
        setTotal(data.total);
      }
    } catch (err: unknown) {
      if ((err as Error).name !== "AbortError") console.error("[admin-blog-articles]", err);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [page, search, statusFilter, categoryFilter]);

  useEffect(() => {
    const ctrl = new AbortController();
    apiFetch("/api/blog/admin/categories", { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : []))
      .then(setCategories)
      .catch((err: unknown) => { if ((err as Error).name !== "AbortError") console.error("[admin-blog-categories]", err); });
    return () => ctrl.abort();
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    fetchArticles(ctrl.signal).catch(() => {});
    return () => ctrl.abort();
  }, [fetchArticles]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, categoryFilter]);

  const totalPages = Math.ceil(total / limit);
  const fmt = (d: string | null) =>
    d ? new Date(d).toLocaleDateString("fr-FR") : "—";

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1200px]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Articles</h1>
          <p className="text-sm text-[#929292]">{total} article(s)</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/blog/categories")}
          >
            <Tag className="h-4 w-4 mr-1" />
            Catégories
          </Button>
          <Button size="sm" onClick={() => router.push("/admin/blog/new")}>
            <Plus className="h-4 w-4 mr-1" />
            Nouvel article
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap gap-2 items-center">
            {/* Quick filters */}
            {[
              { label: "Tous", value: "" },
              { label: "Publiés", value: "PUBLISHED" },
              { label: "Brouillons", value: "DRAFT" },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-3 py-1 text-xs rounded-full border ${
                  statusFilter === f.value
                    ? "bg-[#000091] text-white border-[#000091]"
                    : "bg-white text-[#3A3A3A] border-[#E5E5E5] hover:bg-[#F6F6F6]"
                }`}
              >
                {f.label}
              </button>
            ))}
            <div className="flex-1" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-md border border-[#E5E5E5] px-2 py-1 text-xs"
            >
              <option value="">Toutes les catégories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#929292]" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher..."
                className="pl-7 h-8 text-xs w-48"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div
                className={`animate-spin rounded-full h-8 w-8 border-b-2 ${dev.borderSpinner}`}
              />
            </div>
          ) : articles.length === 0 ? (
            <p className="text-center py-8 text-sm text-[#929292]">
              Aucun article trouvé
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-[#929292]">
                    <th className="pb-2 font-medium">Date</th>
                    <th className="pb-2 font-medium">Titre</th>
                    <th className="pb-2 font-medium">Catégories</th>
                    <th className="pb-2 font-medium">Statut</th>
                    <th className="pb-2 font-medium">Auteur</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map((article) => (
                    <tr
                      key={article.id}
                      onClick={() =>
                        router.push(`/admin/blog/${article.id}`)
                      }
                      className="border-b hover:bg-[#F6F6F6] cursor-pointer"
                    >
                      <td className="py-2.5 pr-3 text-xs text-[#929292] whitespace-nowrap">
                        {fmt(article.publishedAt || article.createdAt)}
                      </td>
                      <td className="py-2.5 pr-3 font-medium">
                        {article.title}
                        {article.readingTime && (
                          <span className="ml-2 text-xs text-[#929292]">
                            {article.readingTime} min
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 pr-3">
                        <div className="flex gap-1 flex-wrap">
                          {article.categories.map((cat) => (
                            <span
                              key={cat.id}
                              className="inline-block px-1.5 py-0.5 text-[10px] rounded-full text-white"
                              style={{
                                backgroundColor: cat.color || "#94a3b8",
                              }}
                            >
                              {cat.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-2.5 pr-3">
                        <Badge
                          variant={
                            article.status === "PUBLISHED"
                              ? "default"
                              : "secondary"
                          }
                          className={
                            article.status === "PUBLISHED"
                              ? "bg-green-100 text-green-700 hover:bg-green-100"
                              : "bg-[#F6F6F6] text-[#3A3A3A] hover:bg-[#F6F6F6]"
                          }
                        >
                          {article.status === "PUBLISHED"
                            ? "Publié"
                            : "Brouillon"}
                        </Badge>
                      </td>
                      <td className="py-2.5 text-xs text-[#929292]">
                        {article.author.firstName
                          ? `${article.author.firstName} ${article.author.lastName || ""}`
                          : article.author.email}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <span className="text-xs text-[#929292]">
                Page {page} sur {totalPages}
              </span>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
