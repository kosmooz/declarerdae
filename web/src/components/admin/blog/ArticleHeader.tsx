"use client";

import { Pencil, RefreshCw } from "lucide-react";

interface ArticleHeaderProps {
  title: string;
  slug: string;
  slugMode: "auto" | "manual";
  onTitleChange: (title: string) => void;
  onSlugChange: (slug: string) => void;
  onSwitchToManual: () => void;
  onRegenerateSlug: () => void;
}

export default function ArticleHeader({
  title,
  slug,
  slugMode,
  onTitleChange,
  onSlugChange,
  onSwitchToManual,
  onRegenerateSlug,
}: ArticleHeaderProps) {
  return (
    <div className="mb-6 border-b border-[#E5E5E5] pb-4">
      <label htmlFor="article-title" className="sr-only">
        Titre de l&apos;article
      </label>
      <input
        id="article-title"
        type="text"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="Titre de l'article"
        className="w-full border-0 bg-transparent p-0 font-heading text-3xl font-bold text-[#3A3A3A] placeholder:text-[#929292] focus:outline-none focus:ring-0"
        autoComplete="off"
      />

      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[#929292]">
        <span className="select-none">declarerdefibrillateur.fr/blog/</span>

        {slugMode === "auto" ? (
          <>
            <span className="font-mono text-[#3A3A3A]">{slug || "—"}</span>
            <button
              type="button"
              onClick={onSwitchToManual}
              className="inline-flex items-center gap-1 text-[#000091] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#000091]/30 rounded"
            >
              <Pencil className="h-3 w-3" />
              Éditer manuellement
            </button>
          </>
        ) : (
          <>
            <label htmlFor="article-slug" className="sr-only">
              Slug de l&apos;article
            </label>
            <input
              id="article-slug"
              type="text"
              value={slug}
              onChange={(e) => onSlugChange(e.target.value)}
              placeholder="mon-article"
              className="font-mono text-[#3A3A3A] border-b border-[#E5E5E5] focus:border-[#000091] outline-none bg-transparent px-1"
              autoComplete="off"
            />
            <button
              type="button"
              onClick={onRegenerateSlug}
              className="inline-flex items-center gap-1 text-[#000091] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#000091]/30 rounded"
            >
              <RefreshCw className="h-3 w-3" />
              Régénérer depuis le titre
            </button>
          </>
        )}
      </div>
    </div>
  );
}
