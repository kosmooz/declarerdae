"use client";

import { ChevronUp, ChevronDown, Trash2, GripVertical } from "lucide-react";
import { BLOCK_LABELS, ContentBlock } from "./types";
import { cn } from "@/lib/utils";

interface BlockWrapperProps {
  block: ContentBlock;
  isFirst: boolean;
  isLast: boolean;
  handleRef: (el: HTMLElement | null) => void;
  isDragging: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  children: React.ReactNode;
}

export default function BlockWrapper({
  block,
  isFirst,
  isLast,
  handleRef,
  isDragging,
  onMoveUp,
  onMoveDown,
  onDelete,
  children,
}: BlockWrapperProps) {
  return (
    <div
      className={cn(
        "group relative border rounded-lg p-3 transition-all",
        isDragging
          ? "opacity-50 shadow-lg border-[#929292] bg-[#F6F6F6]"
          : "border-[#E5E5E5] hover:border-[#929292] bg-white",
      )}
    >
      {/* Floating toolbar top-right */}
      <div className="absolute -top-3 right-2 hidden group-hover:flex items-center gap-0.5 bg-white border border-[#E5E5E5] rounded-md shadow-sm px-1 py-0.5 z-10">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={isFirst}
          className="p-0.5 rounded hover:bg-[#F6F6F6] disabled:opacity-30 disabled:cursor-not-allowed"
          title="Monter"
        >
          <ChevronUp className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={isLast}
          className="p-0.5 rounded hover:bg-[#F6F6F6] disabled:opacity-30 disabled:cursor-not-allowed"
          title="Descendre"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
        <span className="text-[10px] text-[#929292] px-1.5 select-none">
          {BLOCK_LABELS[block.type]}
        </span>
        <button
          type="button"
          onClick={onDelete}
          className="p-0.5 rounded hover:bg-red-50 text-[#929292] hover:text-red-500"
          title="Supprimer"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Drag handle on the left */}
      <div
        ref={handleRef}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full pr-1 hidden group-hover:flex cursor-grab active:cursor-grabbing"
        title="Glisser pour reorganiser"
      >
        <GripVertical className="h-5 w-5 text-[#E5E5E5] hover:text-[#929292]" />
      </div>

      {children}
    </div>
  );
}
