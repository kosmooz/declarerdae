"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ArticleForm, BlogCategory } from "./types";
import EditorCanvas from "./EditorCanvas";
import EditorSidebar from "./EditorSidebar";
import FloatingActions from "./FloatingActions";

interface BlogEditorProps {
  articleId?: string;
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
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

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
          setSlugManuallyEdited(true);
        } else {
          toast.error("Impossible de charger l'article");
          router.push("/admin/blog");
        }
      })
      .finally(() => setLoading(false));
  }, [articleId, router]);

  const handleSave = useCallback(async (status?: "DRAFT" | "PUBLISHED") => {
    const data = {
      ...form,
      ...(status && { status }),
    };

    if (!data.title.trim()) {
      toast.error("Le titre est obligatoire");
      return;
    }
    if (!data.slug.trim()) {
      toast.error("Le slug est obligatoire");
      return;
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
        const saved = await res.json();
        toast.success(
          articleId ? "Article mis à jour" : "Article créé",
        );
        if (!articleId) {
          router.push(`/admin/blog/${saved.id}`);
        } else {
          setForm((prev) => ({
            ...prev,
            status: saved.status,
          }));
        }
      }
    } finally {
      setSaving(false);
    }
  }, [form, articleId, router]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#929292]" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1400px]">
      {/* Header */}
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
          slugManuallyEdited={slugManuallyEdited}
          onSlugManualEdit={() => setSlugManuallyEdited(true)}
        />
      </div>

      <FloatingActions
        onSaveDraft={() => handleSave("DRAFT")}
        onPublish={() => handleSave("PUBLISHED")}
        saving={saving}
        isPublished={form.status === "PUBLISHED"}
        slug={form.slug || undefined}
      />
    </div>
  );
}
