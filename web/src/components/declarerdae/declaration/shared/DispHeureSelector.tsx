"use client";

import { DISP_H_OPTIONS } from "@/lib/declaration-types";

interface DispHeureSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export default function DispHeureSelector({
  value,
  onChange,
}: DispHeureSelectorProps) {
  const toggle = (v: string) => {
    if (v === "24h/24") {
      onChange(value.includes("24h/24") ? [] : ["24h/24"]);
      return;
    }
    const without24 = value.filter((d) => d !== "24h/24");
    if (without24.includes(v)) {
      onChange(without24.filter((d) => d !== v));
    } else {
      onChange([...without24, v]);
    }
  };

  return (
    <div>
      <span className="text-xs text-[#666] mb-1.5 block">
        Heures d'accessibilité <span className="text-[#E1000F]">*</span>
      </span>
      <div className="flex flex-wrap gap-1.5">
        {DISP_H_OPTIONS.map((opt) => {
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
