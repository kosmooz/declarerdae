"use client";

import { BlockComponentProps, QuoteBlockData } from "../types";
import RichTextEditor from "../RichTextEditor";

export default function QuoteBlock({
  block,
  onChange,
}: BlockComponentProps<QuoteBlockData>) {
  const data = block.data as QuoteBlockData;

  return (
    <div className="border-l-4 border-[#929292] pl-4 space-y-2">
      <RichTextEditor
        content={data.text}
        onChange={(text) => onChange({ ...data, text })}
        placeholder="Texte de la citation..."
      />
      <input
        type="text"
        value={data.attribution || ""}
        onChange={(e) => onChange({ ...data, attribution: e.target.value })}
        placeholder="Attribution (optionnel)..."
        className="w-full bg-transparent border-0 border-b border-[#E5E5E5] focus:border-[#000091] focus:ring-0 outline-none text-xs text-[#929292] pb-1"
      />
    </div>
  );
}
