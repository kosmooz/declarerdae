"use client";

import { BlockComponentProps, AlertBlockData } from "../types";
import RichTextEditor from "../RichTextEditor";

const variants = [
  { value: "info", label: "Info", color: "bg-blue-50 border-blue-200" },
  { value: "warning", label: "Attention", color: "bg-amber-50 border-amber-200" },
  { value: "danger", label: "Danger", color: "bg-red-50 border-red-200" },
  { value: "success", label: "Succes", color: "bg-green-50 border-green-200" },
] as const;

export default function AlertBlock({
  block,
  onChange,
}: BlockComponentProps<AlertBlockData>) {
  const data = block.data as AlertBlockData;
  const currentVariant = variants.find((v) => v.value === data.variant) || variants[0];

  return (
    <div className={`rounded-lg border p-4 space-y-2 ${currentVariant.color}`}>
      <div className="flex gap-1 mb-3">
        {variants.map((v) => (
          <button
            key={v.value}
            type="button"
            onClick={() => onChange({ ...data, variant: v.value })}
            className={`px-2 py-0.5 text-xs rounded border ${
              data.variant === v.value
                ? "bg-[#000091] text-white border-[#000091]"
                : "bg-white text-[#3A3A3A] border-[#E5E5E5] hover:bg-[#F6F6F6]"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>
      <input
        type="text"
        value={data.title || ""}
        onChange={(e) => onChange({ ...data, title: e.target.value })}
        placeholder="Titre (optionnel)..."
        className="w-full bg-transparent border-0 border-b border-current/20 focus:border-current/40 focus:ring-0 outline-none text-sm font-semibold pb-1"
      />
      <RichTextEditor
        content={data.text}
        onChange={(text) => onChange({ ...data, text })}
        placeholder="Contenu de l'alerte..."
      />
    </div>
  );
}
