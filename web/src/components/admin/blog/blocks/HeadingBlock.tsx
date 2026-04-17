"use client";

import { BlockComponentProps, HeadingBlockData } from "../types";

const levelStyles: Record<number, string> = {
  2: "text-2xl font-bold",
  3: "text-xl font-semibold",
  4: "text-lg font-medium",
};

export default function HeadingBlock({
  block,
  onChange,
}: BlockComponentProps<HeadingBlockData>) {
  const data = block.data as HeadingBlockData;

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {([2, 3, 4] as const).map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => onChange({ ...data, level })}
            className={`px-2 py-0.5 text-xs rounded border ${
              data.level === level
                ? "bg-[#000091] text-white border-[#000091]"
                : "bg-white text-[#3A3A3A] border-[#E5E5E5] hover:bg-[#F6F6F6]"
            }`}
          >
            H{level}
          </button>
        ))}
      </div>
      <input
        type="text"
        value={data.text}
        onChange={(e) => onChange({ ...data, text: e.target.value })}
        placeholder="Titre de la section..."
        className={`w-full bg-transparent border-0 border-b border-[#E5E5E5] focus:border-[#000091] focus:ring-0 outline-none pb-1 ${levelStyles[data.level]}`}
      />
    </div>
  );
}
