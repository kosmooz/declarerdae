"use client";

import { ExternalLink, Loader2, Save, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FloatingActionsProps {
  onSaveDraft: () => void;
  onPublish: () => void;
  saving: boolean;
  isPublished: boolean;
  slug?: string;
}

export default function FloatingActions({
  onSaveDraft,
  onPublish,
  saving,
  isPublished,
  slug,
}: FloatingActionsProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 bg-white/90 backdrop-blur-sm border border-[#E5E5E5] rounded-xl shadow-lg p-2">
      {slug && (
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          asChild
        >
          <a
            href={isPublished ? `/blog/${slug}` : `/blog/${slug}?preview=1`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="h-4 w-4" />
            Voir
          </a>
        </Button>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={onSaveDraft}
        disabled={saving}
        className="gap-1.5"
      >
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        Brouillon
      </Button>
      <Button
        size="sm"
        onClick={onPublish}
        disabled={saving}
        className="gap-1.5"
      >
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        {isPublished ? "Mettre a jour" : "Publier"}
      </Button>
    </div>
  );
}
