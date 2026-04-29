"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ArticleForm, BlogCategory, slugify } from "./types";
import EditorCanvas from "./EditorCanvas";
import EditorSidebar from "./EditorSidebar";
import FloatingActions from "./FloatingActions";
import ArticleHeader from "./ArticleHeader";

interface BlogEditorProps {
  articleId?: string;
}

interface SavedArticle {
  id: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED";
}

const emptyForm: ArticleForm = {
  title: "",
  slug: "",
  excerpt: "",
  featuredImage: "",
  status: "DRAFT",
  categoryIds: [],
  metaTitle: "",
  metaDescription: "",
  content: [],
};

export default function BlogEditor({ articleId }: BlogEditorProps) {
  const router = useRouter();
  const [form, setForm] = useState<ArticleForm>(emptyForm);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(!!articleId);
  const [saving, setSaving] = useState(false);
  const [slugMode, setSlugMode] = useState<"auto" | "manual">("auto");

  useEffect(() => {
    apiFetch("/api/blog/admin/categories")
      .then((res) => res.ok ? res.json() : [])
      .then(setCategories)
      .catch((err: unknown) => console.error("[blog-editor-categories]", err));
  }, []);

  useEffect(() => {
    if (!articleId) return;
    setLoading(true);
    apiFetch(`/api/blog/admin/articles/${articleId}`)
      .then(async (res) => {
        if (res.ok) {
          const article = await res.json();
          setForm({
            title: article.title || "",
            slug: article.slug || "",
            excerpt: article.excerpt || "",
            featuredImage: article.featuredImage || "",
            status: article.status || "DRAFT",
            categoryIds: article.categories?.map((c: any) => c.id) || [],
            metaTitle: article.metaTitle || "",
            metaDescription: article.metaDescription || "",
            content: article.content || [],
          });
          setSlugMode("manual");
        } else {
          toast.error("Impossible de charger l'article");
          router.push("/admin/blog");
        }
      })
      .finally(() => setLoading(false));
  }, [articleId, router]);

  const handleSave = useCallback(
    async (
      status?: "DRAFT" | "PUBLISHED",
      options?: { silent?: boolean },
    ): Promise<SavedArticle | null> => {
      const data = {
        ...form,
        ...(status && { status }),
      };

      if (!data.title.trim()) {
        toast.error("Le titre est obligatoire");
        return null;
      }
      if (!data.slug.trim()) {
        toast.error("Le slug est obligatoire");
        return null;
      }

      setSaving(true);
      try {
        const url = articleId
          ? `/api/blog/admin/articles/${articleId}`
          : "/api/blog/admin/articles";
        const method = articleId ? "PATCH" : "POST";

        const res = await apiFetch(url, {
          method,
          body: JSON.stringify(data),
        });

        if (res.ok) {
          const saved = (await res.json()) as SavedArticle;
          if (!options?.silent) {
            toast.success(articleId ? "Article mis à jour" : "Article créé");
          }
          if (!articleId) {
            router.push(`/admin/blog/${saved.id}`);
          } else {
            setForm((prev) => ({
              ...prev,
              status: saved.status,
            }));
          }
          return saved;
        }
        return null;
      } finally {
        setSaving(false);
      }
    },
    [form, articleId, router],
  );

  const handlePreview = useCallback(async () => {
    if (!form.title.trim()) {
      toast.error("Saisissez un titre avant l'aperçu");
      return;
    }
    const previewWindow = window.open("about:blank", "_blank");
    if (!previewWindow) {
      toast.error("Le bloqueur de popup empêche l'ouverture de l'aperçu");
      return;
    }
    try {
      const saved = await handleSave(form.status, { silent: true });
      if (!saved) {
        previewWindow.close();
        return;
      }
      const url =
        saved.status === "PUBLISHED"
          ? `/blog/${saved.slug}`
          : `/blog/${saved.slug}?preview=1`;
      previewWindow.location.href = url;
    } catch {
      previewWindow.close();
      toast.error("Impossible d'ouvrir l'aperçu");
    }
  }, [form.title, form.status, handleSave]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave(form.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleSave, form.status]);

  const handleTitleChange = (title: string) => {
    setForm((prev) => {
      const next: ArticleForm = { ...prev, title };
      if (slugMode === "auto") {
        next.slug = slugify(title);
      }
      return next;
    });
  };

  const handleSlugChange = (slug: string) => {
    setForm((prev) => ({ ...prev, slug }));
  };

  const handleRegenerateSlug = () => {
    setForm((prev) => ({ ...prev, slug: slugify(prev.title) }));
    setSlugMode("auto");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#929292]" />
      </div>
    );
  }

  const titleEmpty = !form.title.trim();

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1400px]">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.push("/admin/blog")}
          className="flex items-center gap-1 text-sm text-[#3A3A3A] hover:text-[#3A3A3A]"
        >
          <ArrowLeft className="h-4 w-4" />
          Articles
        </button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreview}
            disabled={saving || titleEmpty}
            title={titleEmpty ? "Saisissez un titre pour activer l'aperçu" : "Enregistrer et ouvrir l'aperçu"}
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            Voir
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSave("DRAFT")}
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <Save className="h-4 w-4 mr-1" />
            )}
            Brouillon
          </Button>
          <Button
            size="sm"
            onClick={() => handleSave("PUBLISHED")}
            disabled={saving}
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
            {form.status === "PUBLISHED" ? "Mettre à jour" : "Publier"}
          </Button>
        </div>
      </div>

      {/* Article header (title + slug) */}
      <ArticleHeader
        title={form.title}
        slug={form.slug}
        slugMode={slugMode}
        onTitleChange={handleTitleChange}
        onSlugChange={handleSlugChange}
        onSwitchToManual={() => setSlugMode("manual")}
        onRegenerateSlug={handleRegenerateSlug}
      />

      {/* Editor layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <EditorCanvas
          blocks={form.content}
          onChange={(content) => setForm((prev) => ({ ...prev, content }))}
        />
        <EditorSidebar
          form={form}
          categories={categories}
          onChange={(updates) => setForm((prev) => ({ ...prev, ...updates }))}
        />
      </div>

      <FloatingActions
        onSaveDraft={() => handleSave("DRAFT")}
        onPublish={() => handleSave("PUBLISHED")}
        onPreview={handlePreview}
        saving={saving}
        isPublished={form.status === "PUBLISHED"}
        canPreview={!titleEmpty}
      />
    </div>
  );
}
