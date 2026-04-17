"use client";

import { DISP_J_OPTIONS } from "@/lib/declaration-types";

interface DispJourSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export default function DispJourSelector({
  value,
  onChange,
}: DispJourSelectorProps) {
  const toggle = (v: string) => {
    if (v === "7j/7") {
      // Toggle 7j/7: if selected, deselect all; if not, select only 7j/7
      onChange(value.includes("7j/7") ? [] : ["7j/7"]);
      return;
    }
    // If selecting a specific day, remove 7j/7
    const without7j = value.filter((d) => d !== "7j/7");
    if (without7j.includes(v)) {
      onChange(without7j.filter((d) => d !== v));
    } else {
      onChange([...without7j, v]);
    }
  };

  return (
    <div>
      <span className="text-xs text-[#666] mb-1.5 block">
        Jours d'accessibilité <span className="text-[#E1000F]">*</span>
      </span>
      <div className="flex flex-wrap gap-1.5">
        {DISP_J_OPTIONS.map((opt) => {
          const selected = value.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className={`px-2.5 py-1 rounded-sm text-xs font-medium border transition-colors ${
                selected
                  ? "bg-[#000091] text-white border-[#000091]"
                  : "bg-white text-[#3A3A3A] border-[#CECECE] hover:border-[#000091]"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
