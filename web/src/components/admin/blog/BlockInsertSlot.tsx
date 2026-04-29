"use client";

import { useState, useRef, useEffect } from "react";
import { Plus } from "lucide-react";
import { BlockType } from "./types";
import BlockTypePicker from "./BlockTypePicker";

interface BlockInsertSlotProps {
  onAdd: (type: BlockType) => void;
}

export default function BlockInsertSlot({ onAdd }: BlockInsertSlotProps) {
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

  return (
    <div ref={ref} className="relative flex h-6 items-center justify-center my-0.5">
      <span className="absolute inset-x-10 top-1/2 h-px bg-[#E5E5E5]" aria-hidden />
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Insérer un bloc ici"
        aria-expanded={open}
        aria-haspopup="menu"
        className={`relative z-10 flex h-5 w-5 items-center justify-center rounded-full border bg-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#000091]/30 ${
          open
            ? "border-[#000091] text-[#000091]"
            : "border-[#E5E5E5] text-[#929292] hover:border-[#000091] hover:bg-[#F6F6F6] hover:text-[#000091]"
        }`}
      >
        <Plus className="h-3 w-3" strokeWidth={2.25} />
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
