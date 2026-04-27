"use client";

import { useState } from "react";
import { Upload, X } from "lucide-react";
import NextImage from "next/image";
import { apiFetch } from "@/lib/api";
import { ArticleForm, BlogCategory, ContentBlock, slugify } from "./types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface EditorSidebarProps {
  form: ArticleForm;
  categories: BlogCategory[];
  onChange: (updates: Partial<ArticleForm>) => void;
  slugManuallyEdited: boolean;
  onSlugManualEdit: () => void;
}

function generateToc(blocks: ContentBlock[]) {
  return blocks
    .filter((b) => b.type === "heading" && b.data?.text)
    .map((b) => ({
      text: b.data.text,
      level: b.data.level as number,
    }));
}

export default function EditorSidebar({
  form,
  categories,
  onChange,
  slugManuallyEdited,
  onSlugManualEdit,
}: EditorSidebarProps) {
  const [uploadingFeatured, setUploadingFeatured] = useState(false);

  const toc = generateToc(form.content);

  const handleFeaturedUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFeatured(true);
    try {
      const formData = new FormData();
      formData.append("files", file);
      const res = await apiFetch("/api/upload/images", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const urls = await res.json();
        if (urls?.[0]) {
          onChange({ featuredImage: urls[0] });
        }
      }
    } finally {
      setUploadingFeatured(false);
    }
  };

  const toggleCategory = (id: string) => {
    const ids = form.categoryIds.includes(id)
      ? form.categoryIds.filter((c) => c !== id)
      : [...form.categoryIds, id];
    onChange({ categoryIds: ids });
  };

  return (
    <div className="space-y-4">
      {/* Article Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Article</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs">Titre</Label>
            <Input
              value={form.title}
              onChange={(e) => {
                const title = e.target.value;
                const updates: Partial<ArticleForm> = { title };
                if (!slugManuallyEdited) {
                  updates.slug = slugify(title);
                }
                onChange(updates);
              }}
              placeholder="Titre de l'article"
            />
          </div>
          <div>
            <Label className="text-xs">Slug</Label>
            <div className="flex items-center gap-1">
              <span className="text-xs text-[#929292]">/blog/</span>
              <Input
                value={form.slug}
                onChange={(e) => {
                  onSlugManualEdit();
                  onChange({ slug: e.target.value });
                }}
                placeholder="mon-article"
                className="flex-1"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs">Extrait</Label>
            <Textarea
              value={form.excerpt}
              onChange={(e) => onChange({ excerpt: e.target.value })}
              placeholder="Description courte pour la liste..."
              rows={2}
            />
          </div>
          <div>
            <Label className="text-xs">Statut</Label>
            <select
              value={form.status}
              onChange={(e) =>
                onChange({ status: e.target.value as "DRAFT" | "PUBLISHED" })
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="DRAFT">Brouillon</option>
              <option value="PUBLISHED">Publié</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Catégories</CardTitle>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <p className="text-xs text-[#929292]">Aucune catégorie créée</p>
          ) : (
            <div className="space-y-1.5">
              {categories.map((cat) => (
                <label
                  key={cat.id}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={form.categoryIds.includes(cat.id)}
                    onChange={() => toggleCategory(cat.id)}
                    className="rounded border-[#CECECE]"
                  />
                  <span
                    className="inline-block w-2 h-2 rounded-full"
                    style={{ backgroundColor: cat.color || "#94a3b8" }}
                  />
                  <span className="text-sm">{cat.name}</span>
                </label>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Featured Image */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Image à la une</CardTitle>
        </CardHeader>
        <CardContent>
          {form.featuredImage ? (
            <div className="relative group">
              <NextImage
                src={form.featuredImage}
                alt="Featured"
                width={400}
                height={128}
                className="w-full h-32 object-cover rounded-md border"
                unoptimized
              />
              <button
                type="button"
                onClick={() => onChange({ featuredImage: "" })}
                className="absolute top-1 right-1 p-0.5 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3.5 w-3.5 text-red-500" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-[#E5E5E5] rounded-lg cursor-pointer hover:border-[#929292] transition-colors">
              <Upload className="h-5 w-5 text-[#929292] mb-1" />
              <span className="text-xs text-[#929292]">
                {uploadingFeatured ? "Envoi..." : "Uploader une image"}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFeaturedUpload}
                className="hidden"
                disabled={uploadingFeatured}
              />
            </label>
          )}
        </CardContent>
      </Card>

      {/* SEO */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">SEO</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs">
              Meta titre{" "}
              <span className="text-[#929292]">
                ({form.metaTitle.length}/60)
              </span>
            </Label>
            <Input
              value={form.metaTitle}
              onChange={(e) => onChange({ metaTitle: e.target.value })}
              placeholder="Titre SEO"
              maxLength={70}
            />
          </div>
          <div>
            <Label className="text-xs">
              Meta description{" "}
              <span className="text-[#929292]">
                ({form.metaDescription.length}/160)
              </span>
            </Label>
            <Textarea
              value={form.metaDescription}
              onChange={(e) => onChange({ metaDescription: e.target.value })}
              placeholder="Description SEO"
              rows={3}
              maxLength={170}
            />
          </div>
        </CardContent>
      </Card>

      {/* Table of Contents */}
      {toc.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Sommaire</CardTitle>
          </CardHeader>
          <CardContent>
            <nav className="space-y-1">
              {toc.map((item, i) => (
                <div
                  key={i}
                  className="text-xs text-[#3A3A3A] truncate"
                  style={{ paddingLeft: (item.level - 2) * 12 }}
                >
                  {item.level === 2 ? "—" : "·"} {item.text}
                </div>
              ))}
            </nav>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
