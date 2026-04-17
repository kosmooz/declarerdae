"use client";

import { useState, useRef, useEffect } from "react";
import {
  Plus,
  Type,
  AlignLeft,
  List,
  Table,
  AlertTriangle,
  ImageIcon,
  Minus,
  MousePointerClick,
  Quote,
} from "lucide-react";
import { BlockType, BLOCK_LABELS } from "./types";

const blockOptions: {
  type: BlockType;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}[] = [
  { type: "heading", icon: Type, label: BLOCK_LABELS.heading },
  { type: "paragraph", icon: AlignLeft, label: BLOCK_LABELS.paragraph },
  { type: "list", icon: List, label: BLOCK_LABELS.list },
  { type: "table", icon: Table, label: BLOCK_LABELS.table },
  { type: "alert", icon: AlertTriangle, label: BLOCK_LABELS.alert },
  { type: "image", icon: ImageIcon, label: BLOCK_LABELS.image },
  { type: "separator", icon: Minus, label: BLOCK_LABELS.separator },
  { type: "cta", icon: MousePointerClick, label: BLOCK_LABELS.cta },
  { type: "quote", icon: Quote, label: BLOCK_LABELS.quote },
];

interface BlockToolbarProps {
  onAdd: (type: BlockType) => void;
}

export default function BlockToolbar({ onAdd }: BlockToolbarProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={ref} className="group/toolbar relative flex justify-center h-4">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`absolute top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-7 h-7 rounded-full border-2 transition-all ${
          open
            ? "bg-emerald-600 border-emerald-600 text-white scale-100 opacity-100"
            : "bg-emerald-500 border-emerald-500 text-white opacity-0 group-hover/toolbar:opacity-100 scale-75 group-hover/toolbar:scale-100 hover:bg-emerald-600 hover:border-emerald-600"
        }`}
        title="Ajouter un bloc"
      >
        <Plus className="h-4 w-4" strokeWidth={2.5} />
      </button>

      {open && (
        <div className="absolute top-full mt-1 z-30 bg-white border border-[#E5E5E5] rounded-lg shadow-lg p-2 grid grid-cols-3 gap-1 w-72">
          {blockOptions.map(({ type, icon: Icon, label }) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                onAdd(type);
                setOpen(false);
              }}
              className="flex flex-col items-center gap-1 p-2 rounded-md hover:bg-[#F6F6F6] text-[#3A3A3A] hover:text-[#3A3A3A] transition-colors"
            >
              <Icon className="h-4 w-4" />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
