"use client";

import { type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Pencil } from "lucide-react";

interface AdminEditableSectionProps {
  title: string;
  icon: ReactNode;
  headerExtra?: ReactNode;
  isEditing: boolean;
  onStartEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  saving: boolean;
  children: ReactNode;
  editContent: ReactNode;
}

export default function AdminEditableSection({
  title,
  icon,
  headerExtra,
  isEditing,
  onStartEdit,
  onCancel,
  onSave,
  saving,
  children,
  editContent,
}: AdminEditableSectionProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="text-[#929292]">{icon}</span>
            {title}
            {headerExtra && (
              <span className="ml-2">{headerExtra}</span>
            )}
          </CardTitle>

          {!isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onStartEdit}
              className="text-[#929292] hover:text-[#3A3A3A]"
            >
              <Pencil className="h-3.5 w-3.5 mr-1.5" />
              Modifier
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            {editContent}

            <div className="flex items-center gap-2 pt-2 border-t border-[#E5E5E5]">
              <Button
                size="sm"
                onClick={onSave}
                disabled={saving}
              >
                {saving ? "Enregistrement..." : "Enregistrer"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancel}
                disabled={saving}
                className="text-[#929292]"
              >
                Annuler
              </Button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[#E5E5E5]">{children}</div>
        )}
      </CardContent>
    </Card>
  );
}
