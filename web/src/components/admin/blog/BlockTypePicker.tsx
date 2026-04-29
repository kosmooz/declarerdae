"use client";

import {
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

interface BlockTypePickerProps {
  onSelect: (type: BlockType) => void;
}

export default function BlockTypePicker({ onSelect }: BlockTypePickerProps) {
  return (
    <div role="menu" aria-label="Choisir un type de bloc" className="grid grid-cols-3 gap-1">
      {blockOptions.map(({ type, icon: Icon, label }) => (
        <button
          key={type}
          type="button"
          role="menuitem"
          onClick={() => onSelect(type)}
          className="flex flex-col items-center gap-1 rounded-md p-2 text-[#3A3A3A] transition-colors hover:bg-[#F6F6F6] hover:text-[#000091] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#000091]/30"
        >
          <Icon className="h-4 w-4" />
          <span className="text-[11px] font-medium">{label}</span>
        </button>
      ))}
    </div>
  );
}
