"use client";

import { BlockComponentProps, CTABlockData } from "../types";
import RichTextEditor from "../RichTextEditor";

export default function CTABlock({
  block,
  onChange,
}: BlockComponentProps<CTABlockData>) {
  const data = block.data as CTABlockData;

  return (
    <div className="rounded-lg border-2 border-red-200 bg-red-50 p-4 space-y-2">
      <input
        type="text"
        value={data.title}
        onChange={(e) => onChange({ ...data, title: e.target.value })}
        placeholder="Titre du CTA..."
        className="w-full bg-transparent border-0 border-b border-red-200 focus:border-red-400 focus:ring-0 outline-none text-lg font-bold pb-1"
      />
      <RichTextEditor
        content={data.text}
        onChange={(text) => onChange({ ...data, text })}
        placeholder="Description..."
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          value={data.buttonText}
          onChange={(e) => onChange({ ...data, buttonText: e.target.value })}
          placeholder="Texte du bouton..."
          className="rounded-md border border-red-200 px-2 py-1 text-sm focus:border-red-400 focus:ring-1 focus:ring-red-400 outline-none"
        />
        <input
          type="text"
          value={data.buttonUrl}
          onChange={(e) => onChange({ ...data, buttonUrl: e.target.value })}
          placeholder="URL du bouton..."
          className="rounded-md border border-red-200 px-2 py-1 text-sm focus:border-red-400 focus:ring-1 focus:ring-red-400 outline-none"
        />
      </div>
    </div>
  );
}
