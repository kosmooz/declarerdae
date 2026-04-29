"use client";

import { ExternalLink, Loader2, Save, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FloatingActionsProps {
  onSaveDraft: () => void;
  onPublish: () => void;
  onPreview: () => void;
  saving: boolean;
  isPublished: boolean;
  canPreview: boolean;
}

export default function FloatingActions({
  onSaveDraft,
  onPublish,
  onPreview,
  saving,
  isPublished,
  canPreview,
}: FloatingActionsProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 bg-white/90 backdrop-blur-sm border border-[#E5E5E5] rounded-xl shadow-lg p-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onPreview}
        disabled={saving || !canPreview}
        className="gap-1.5"
        title={!canPreview ? "Saisissez un titre pour activer l'aperçu" : "Enregistrer et ouvrir l'aperçu"}
      >
        <ExternalLink className="h-4 w-4" />
        Voir
      </Button>
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
        {isPublished ? "Mettre à jour" : "Publier"}
      </Button>
    </div>
  );
}
