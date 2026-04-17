"use client";

import { Plus, X } from "lucide-react";
import { BlockComponentProps, ListBlockData } from "../types";
import RichTextEditor from "../RichTextEditor";

export default function ListBlock({
  block,
  onChange,
}: BlockComponentProps<ListBlockData>) {
  const data = block.data as ListBlockData;

  const updateItem = (index: number, value: string) => {
    const items = [...data.items];
    items[index] = value;
    onChange({ ...data, items });
  };

  const addItem = () => {
    onChange({ ...data, items: [...data.items, ""] });
  };

  const removeItem = (index: number) => {
    if (data.items.length <= 1) return;
    onChange({ ...data, items: data.items.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {(["unordered", "ordered"] as const).map((style) => (
          <button
            key={style}
            type="button"
            onClick={() => onChange({ ...data, style })}
            className={`px-2 py-0.5 text-xs rounded border ${
              data.style === style
                ? "bg-[#000091] text-white border-[#000091]"
                : "bg-white text-[#3A3A3A] border-[#E5E5E5] hover:bg-[#F6F6F6]"
            }`}
          >
            {style === "unordered" ? "• Liste" : "1. Numerotee"}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {data.items.map((item, index) => (
          <div key={index} className="flex items-start gap-2">
            <span className="text-xs text-[#929292] w-5 text-right shrink-0 mt-3">
              {data.style === "ordered" ? `${index + 1}.` : "•"}
            </span>
            <div className="flex-1">
              <RichTextEditor
                content={item}
                onChange={(html) => updateItem(index, html)}
                placeholder="Element de la liste..."
              />
            </div>
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="text-[#E5E5E5] hover:text-red-500 shrink-0 mt-3"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addItem}
        className="flex items-center gap-1 text-xs text-[#929292] hover:text-[#3A3A3A]"
      >
        <Plus className="h-3 w-3" /> Ajouter un element
      </button>
    </div>
  );
}
