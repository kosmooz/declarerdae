"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Loader2,
  Pencil,
  Tag as TagIcon,
  X,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { slugify } from "@/components/admin/blog/types";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  position: number;
  articleCount: number;
}

const PRESET_COLORS = [
  { name: "Bleu marine", value: "#000091" },
  { name: "Rouge", value: "#E1000F" },
  { name: "Vert", value: "#18753C" },
  { name: "Orange", value: "#92400E" },
  { name: "Violet", value: "#6D28D9" },
  { name: "Bleu ciel", value: "#0EA5E9" },
  { name: "Rose", value: "#DB2777" },
  { name: "Gris", value: "#929292" },
];

const DEFAULT_COLOR = "#000091";

function CategoryBadge({ name, color }: { name: string; color: string | null }) {
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full text-white"
      style={{ backgroundColor: color || "#94a3b8" }}
    >
      {name}
    </span>
  );
}

function ColorSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (c: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {PRESET_COLORS.map((c) => (
        <button
          key={c.value}
          type="button"
          onClick={() => onChange(c.value)}
          title={c.name}
          aria-label={c.name}
          className={cn(
            "h-7 w-7 rounded-full border-2 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#000091]/40",
            value === c.value
              ? "border-[#3A3A3A] scale-110"
              : "border-white shadow-sm",
          )}
          style={{ backgroundColor: c.value }}
        />
      ))}
      <div className="relative h-7 w-7 overflow-hidden rounded-full border-2 border-white shadow-sm">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Couleur personnalisée"
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "conic-gradient(from 0deg, #ef4444, #f59e0b, #84cc16, #06b6d4, #6366f1, #ec4899, #ef4444)",
          }}
        />
      </div>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        className="ml-1 h-7 w-24 font-mono text-xs uppercase"
      />
    </div>
  );
}

function CategoryRow({
  cat,
  onEdit,
  onDelete,
}: {
  cat: Category;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-[#E5E5E5] bg-white p-3 transition-shadow hover:border-[#000091]/30 hover:shadow-sm">
      <span
        aria-hidden
        className="h-4 w-4 flex-shrink-0 rounded-full ring-2 ring-white"
        style={{ backgroundColor: cat.color || "#94a3b8" }}
      />
      <div className="min-w-0 flex-1">
        <span className="truncate font-medium text-sm text-[#3A3A3A]">
          {cat.name}
        </span>
        {cat.description && (
          <p className="mt-0.5 truncate text-xs text-[#929292]">
            {cat.description}
          </p>
        )}
      </div>
      <span
        className={cn(
          "inline-flex flex-shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
          cat.articleCount > 0
            ? "bg-[#000091]/10 text-[#000091]"
            : "bg-[#F6F6F6] text-[#929292]",
        )}
        title={`${cat.articleCount} article(s) dans cette catégorie`}
      >
        {cat.articleCount} article{cat.articleCount > 1 ? "s" : ""}
      </span>
      <button
        type="button"
        onClick={onEdit}
        title="Modifier"
        aria-label="Modifier"
        className="rounded p-1.5 text-[#929292] hover:bg-[#F6F6F6] hover:text-[#000091]"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        title="Supprimer"
        aria-label="Supprimer"
        className="rounded p-1.5 text-[#929292] hover:bg-red-50 hover:text-red-600"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function EditCategoryDialog({
  category,
  saving,
  onClose,
  onSave,
}: {
  category: Category;
  saving: boolean;
  onClose: () => void;
  onSave: (updates: {
    name: string;
    color: string;
    description: string;
  }) => void;
}) {
  const [name, setName] = useState(category.name);
  const [color, setColor] = useState(category.color || DEFAULT_COLOR);
  const [description, setDescription] = useState(category.description || "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-lg border border-[#E5E5E5] bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#E5E5E5] px-5 py-3">
          <h2 className="text-base font-semibold text-[#3A3A3A]">
            Modifier la catégorie
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-[#929292] hover:bg-[#F6F6F6] hover:text-[#3A3A3A]"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-4 p-5">
          <div>
            <Label className="text-xs">Nom</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <Label className="text-xs">Couleur</Label>
            <div className="mt-1.5">
              <ColorSelector value={color} onChange={setColor} />
            </div>
          </div>
          <div>
            <Label className="text-xs">Description (optionnel)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Phrase de présentation affichée sur la liste publique..."
            />
          </div>
          <div className="flex items-center gap-2 rounded-md bg-[#F6F6F6] p-3">
            <span className="text-xs text-[#929292]">Aperçu :</span>
            <CategoryBadge name={name || "Catégorie"} color={color} />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-[#E5E5E5] px-5 py-3">
          <Button variant="outline" size="sm" onClick={onClose} disabled={saving}>
            Annuler
          </Button>
          <Button
            size="sm"
            onClick={() => onSave({ name, color, description })}
            disabled={saving || !name.trim()}
          >
            {saving && <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />}
            Enregistrer
          </Button>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirmDialog({
  category,
  onCancel,
  onConfirm,
  deleting,
}: {
  category: Category;
  onCancel: () => void;
  onConfirm: () => void;
  deleting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-lg border border-[#E5E5E5] bg-white shadow-xl">
        <div className="flex items-start gap-3 p-5">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold text-[#3A3A3A]">
              Supprimer la catégorie ?
            </h2>
            <p className="mt-1 text-sm text-[#929292]">
              La catégorie « {category.name} » va être supprimée.
              {category.articleCount > 0 && (
                <>
                  {" "}
                  <strong className="text-[#3A3A3A]">
                    {category.articleCount} article
                    {category.articleCount > 1 ? "s" : ""}
                  </strong>{" "}
                  ne {category.articleCount > 1 ? "lui seront" : "lui sera"}{" "}
                  plus rattaché{category.articleCount > 1 ? "s" : ""} mais
                  resteront publiés.
                </>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-[#E5E5E5] px-5 py-3">
          <Button variant="outline" size="sm" onClick={onCancel} disabled={deleting}>
            Annuler
          </Button>
          <Button
            size="sm"
            onClick={onConfirm}
            disabled={deleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleting && <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />}
            Supprimer
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminBlogCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Category | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);

  // Create form
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(DEFAULT_COLOR);
  const [newDescription, setNewDescription] = useState("");

  const fetchCategories = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/blog/admin/categories", { signal });
      if (res.ok) setCategories(await res.json());
    } catch (err: unknown) {
      if ((err as Error).name !== "AbortError")
        console.error("[admin-blog-cats]", err);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    fetchCategories(ctrl.signal);
    return () => ctrl.abort();
  }, [fetchCategories]);

  const sortedCategories = useMemo(
    () =>
      [...categories].sort((a, b) =>
        a.name.localeCompare(b.name, "fr", { sensitivity: "base" }),
      ),
    [categories],
  );

  const generateUniqueSlug = (name: string, excludeId?: string): string => {
    const base = slugify(name);
    if (!base) return base;
    const taken = new Set(
      categories
        .filter((c) => c.id !== excludeId)
        .map((c) => c.slug.toLowerCase()),
    );
    if (!taken.has(base)) return base;
    let i = 2;
    while (taken.has(`${base}-${i}`)) i++;
    return `${base}-${i}`;
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await apiFetch("/api/blog/admin/categories", {
        method: "POST",
        body: JSON.stringify({
          name: newName.trim(),
          slug: generateUniqueSlug(newName.trim()),
          color: newColor,
          description: newDescription.trim() || undefined,
        }),
      });
      if (res.ok) {
        toast.success("Catégorie créée");
        setNewName("");
        setNewColor(DEFAULT_COLOR);
        setNewDescription("");
        fetchCategories();
      } else {
        const err = await res.json().catch(() => null);
        toast.error(err?.message || "Erreur lors de la création");
      }
    } finally {
      setCreating(false);
    }
  };

  const handleUpdate = async (
    id: string,
    updates: { name: string; color: string; description: string },
  ) => {
    setSavingEdit(true);
    try {
      const original = categories.find((c) => c.id === id);
      const trimmedName = updates.name.trim();
      const body: Record<string, unknown> = {
        name: trimmedName,
        color: updates.color,
        description: updates.description.trim() || undefined,
      };
      // Re-générer le slug si le nom change
      if (original && original.name !== trimmedName) {
        body.slug = generateUniqueSlug(trimmedName, id);
      }
      const res = await apiFetch(`/api/blog/admin/categories/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      if (res.ok) {
        toast.success("Catégorie modifiée");
        setEditing(null);
        fetchCategories();
      } else {
        const err = await res.json().catch(() => null);
        toast.error(err?.message || "Erreur lors de la modification");
      }
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await apiFetch(`/api/blog/admin/categories/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Catégorie supprimée");
        setPendingDelete(null);
        fetchCategories();
      } else {
        toast.error("Erreur lors de la suppression");
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1200px]">
      {/* Header */}
      <button
        onClick={() => router.push("/admin/blog")}
        className="mb-4 flex items-center gap-1 text-sm text-[#3A3A3A] hover:text-[#000091]"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux articles
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#3A3A3A]">
          Catégories du blog
        </h1>
        <p className="mt-1 text-sm text-[#929292]">
          Organisez vos articles avec des catégories. Triées par ordre
          alphabétique.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* Liste */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <TagIcon className="h-4 w-4 text-[#000091]" />
              Catégories existantes
              <span className="ml-1 text-xs font-normal text-[#929292]">
                ({sortedCategories.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-[#000091]" />
              </div>
            ) : sortedCategories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#F6F6F6]">
                  <TagIcon className="h-5 w-5 text-[#929292]" />
                </div>
                <h3 className="text-sm font-semibold text-[#3A3A3A]">
                  Aucune catégorie
                </h3>
                <p className="mt-1 text-xs text-[#929292]">
                  Créez votre première catégorie via le formulaire à droite.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {sortedCategories.map((cat) => (
                  <CategoryRow
                    key={cat.id}
                    cat={cat}
                    onEdit={() => setEditing(cat)}
                    onDelete={() => setPendingDelete(cat)}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form création */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Plus className="h-4 w-4 text-[#000091]" />
                Nouvelle catégorie
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs">Nom</Label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex : Premiers secours"
                />
              </div>
              <div>
                <Label className="text-xs">Couleur</Label>
                <div className="mt-1.5">
                  <ColorSelector value={newColor} onChange={setNewColor} />
                </div>
              </div>
              <div>
                <Label className="text-xs">Description (optionnel)</Label>
                <Textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Phrase courte affichée sur la page publique..."
                  rows={2}
                />
              </div>
              <div className="flex items-center gap-2 rounded-md bg-[#F6F6F6] p-2.5">
                <span className="text-xs text-[#929292]">Aperçu :</span>
                <CategoryBadge
                  name={newName || "Catégorie"}
                  color={newColor}
                />
              </div>
              <Button
                size="sm"
                className="w-full"
                onClick={handleCreate}
                disabled={creating || !newName.trim()}
              >
                {creating ? (
                  <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Plus className="mr-1 h-3.5 w-3.5" />
                )}
                Créer la catégorie
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 text-xs leading-relaxed text-[#929292]">
              <strong className="text-[#3A3A3A]">Astuce :</strong> les
              catégories permettent aux lecteurs de filtrer les articles. La
              couleur est affichée en badge dans la liste et l&apos;article.
              Les catégories sont triées par ordre alphabétique.
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal édition */}
      {editing && (
        <EditCategoryDialog
          category={editing}
          saving={savingEdit}
          onClose={() => setEditing(null)}
          onSave={(updates) => handleUpdate(editing.id, updates)}
        />
      )}

      {/* Modal confirmation suppression */}
      {pendingDelete && (
        <DeleteConfirmDialog
          category={pendingDelete}
          deleting={deletingId === pendingDelete.id}
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => handleDelete(pendingDelete.id)}
        />
      )}
    </div>
  );
}
