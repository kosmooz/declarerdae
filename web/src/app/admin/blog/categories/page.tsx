"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Loader2, Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { useDevMode } from "@/lib/useDevMode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { slugify } from "@/components/admin/blog/types";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  position: number;
}

export default function AdminBlogCategoriesPage() {
  const router = useRouter();
  const dev = useDevMode();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // New category form
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newColor, setNewColor] = useState("#d92d20");
  const [newDescription, setNewDescription] = useState("");

  // Edit form
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editColor, setEditColor] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const fetchCategories = async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/blog/admin/categories", { signal });
      if (res.ok) setCategories(await res.json());
    } catch (err: unknown) {
      if ((err as Error).name !== "AbortError") console.error("[admin-blog-cats]", err);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  };

  useEffect(() => {
    const ctrl = new AbortController();
    fetchCategories(ctrl.signal);
    return () => ctrl.abort();
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const res = await apiFetch("/api/blog/admin/categories", {
        method: "POST",
        body: JSON.stringify({
          name: newName,
          slug: newSlug || slugify(newName),
          color: newColor,
          description: newDescription || undefined,
          position: categories.length,
        }),
      });
      if (res.ok) {
        toast.success("Catégorie créée");
        setNewName("");
        setNewSlug("");
        setNewColor("#d92d20");
        setNewDescription("");
        fetchCategories();
      }
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditSlug(cat.slug);
    setEditColor(cat.color || "#94a3b8");
    setEditDescription(cat.description || "");
  };

  const handleUpdate = async (id: string) => {
    setSaving(true);
    try {
      const res = await apiFetch(`/api/blog/admin/categories/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: editName,
          slug: editSlug,
          color: editColor,
          description: editDescription || undefined,
        }),
      });
      if (res.ok) {
        toast.success("Catégorie modifiée");
        setEditingId(null);
        fetchCategories();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette catégorie ?")) return;
    const res = await apiFetch(`/api/blog/admin/categories/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      toast.success("Catégorie supprimée");
      fetchCategories();
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[800px]">
      <button
        onClick={() => router.push("/admin/blog")}
        className="flex items-center gap-1 text-sm text-[#3A3A3A] hover:text-[#3A3A3A] mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux articles
      </button>

      <h1 className="text-2xl font-bold mb-6">Catégories du blog</h1>

      {/* Create form */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Nouvelle catégorie</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Nom</Label>
              <Input
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                  setNewSlug(slugify(e.target.value));
                }}
                placeholder="Ex: Premiers Secours"
              />
            </div>
            <div>
              <Label className="text-xs">Slug</Label>
              <Input
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
                placeholder="premiers-secours"
              />
            </div>
            <div>
              <Label className="text-xs">Couleur</Label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="w-8 h-8 rounded border cursor-pointer"
                />
                <Input
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs">Description</Label>
              <Input
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Optionnel"
              />
            </div>
          </div>
          <Button
            size="sm"
            className="mt-3"
            onClick={handleCreate}
            disabled={saving || !newName.trim()}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <Plus className="h-4 w-4 mr-1" />
            )}
            Créer
          </Button>
        </CardContent>
      </Card>

      {/* Categories list */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">
            Catégories existantes ({categories.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div
                className={`animate-spin rounded-full h-8 w-8 border-b-2 ${dev.borderSpinner}`}
              />
            </div>
          ) : categories.length === 0 ? (
            <p className="text-sm text-[#929292] text-center py-4">
              Aucune catégorie
            </p>
          ) : (
            <div className="space-y-2">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center gap-3 p-2 rounded-lg border border-[#E5E5E5] hover:border-[#E5E5E5]"
                >
                  {editingId === cat.id ? (
                    <>
                      <input
                        type="color"
                        value={editColor}
                        onChange={(e) => setEditColor(e.target.value)}
                        className="w-6 h-6 rounded border cursor-pointer shrink-0"
                      />
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="h-7 text-sm flex-1"
                      />
                      <Input
                        value={editSlug}
                        onChange={(e) => setEditSlug(e.target.value)}
                        className="h-7 text-sm w-32"
                      />
                      <button
                        onClick={() => handleUpdate(cat.id)}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1 text-[#929292] hover:bg-[#F6F6F6] rounded"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{
                          backgroundColor: cat.color || "#94a3b8",
                        }}
                      />
                      <span className="font-medium text-sm flex-1">
                        {cat.name}
                      </span>
                      <span className="text-xs text-[#929292]">
                        /{cat.slug}
                      </span>
                      <button
                        onClick={() => startEdit(cat)}
                        className="p-1 text-[#929292] hover:text-[#3A3A3A] hover:bg-[#F6F6F6] rounded"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="p-1 text-[#929292] hover:text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
