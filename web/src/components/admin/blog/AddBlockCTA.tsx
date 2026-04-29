"use client";

import { useState, useRef, useEffect } from "react";
import { Plus } from "lucide-react";
import { BlockType } from "./types";
import BlockTypePicker from "./BlockTypePicker";

interface AddBlockCTAProps {
  onAdd: (type: BlockType) => void;
  variant?: "default" | "empty";
}

export default function AddBlockCTA({ onAdd, variant = "default" }: AddBlockCTAProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const heightClass = variant === "empty" ? "h-14" : "h-11";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Ajouter un bloc"
        aria-expanded={open}
        aria-haspopup="menu"
        className={`flex w-full items-center justify-center gap-2 rounded-md border border-dashed bg-white text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#000091]/30 ${heightClass} ${
          open
            ? "border-[#000091] bg-[#F6F6F6] text-[#000091]"
            : "border-[#E5E5E5] text-[#3A3A3A] hover:border-[#000091] hover:bg-[#F6F6F6] hover:text-[#000091]"
        }`}
      >
        <Plus className="h-4 w-4" strokeWidth={2} />
        Ajouter un bloc
      </button>

      {open && (
        <div className="absolute left-1/2 top-full z-30 mt-2 w-72 -translate-x-1/2 rounded-lg border border-[#E5E5E5] bg-white p-2 shadow-lg">
          <BlockTypePicker
            onSelect={(type) => {
              onAdd(type);
              setOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
