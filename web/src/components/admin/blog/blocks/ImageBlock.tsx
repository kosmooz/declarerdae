"use client";

import { Upload, X, Link } from "lucide-react";
import { useState } from "react";
import NextImage from "next/image";
import { apiFetch } from "@/lib/api";
import { BlockComponentProps, ImageBlockData } from "../types";

export default function ImageBlock({
  block,
  onChange,
}: BlockComponentProps<ImageBlockData>) {
  const data = block.data as ImageBlockData;
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("files", file);
      const res = await apiFetch("/api/upload/images", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const result = await res.json();
        const url = Array.isArray(result) ? result[0] : result?.urls?.[0];
        if (url) {
          onChange({ ...data, url });
        }
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {data.url ? (
        <div className="relative group">
          <NextImage
            src={data.url}
            alt={data.alt}
            width={800}
            height={256}
            className="max-h-64 rounded-md border object-contain"
            unoptimized
          />
          <button
            type="button"
            onClick={() => onChange({ ...data, url: "" })}
            className="absolute top-2 right-2 p-1 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4 text-red-500" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center h-36 border-2 border-dashed border-[#E5E5E5] rounded-lg cursor-pointer hover:border-[#929292] transition-colors">
          <Upload className="h-6 w-6 text-[#929292] mb-1" />
          <span className="text-xs text-[#929292]">
            {uploading ? "Envoi en cours..." : "Cliquez pour uploader"}
          </span>
          <span className="mt-1 text-[11px] text-[#929292]">
            Largeur recommandée : 800px (hauteur libre) — JPG/PNG/WEBP, 5 Mo max
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>
      )}
      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          value={data.alt}
          onChange={(e) => onChange({ ...data, alt: e.target.value })}
          placeholder="Texte alternatif..."
          className="rounded-md border border-[#E5E5E5] px-2 py-1 text-sm focus:border-[#000091] focus:ring-1 focus:ring-[#000091] outline-none"
        />
        <input
          type="text"
          value={data.caption || ""}
          onChange={(e) => onChange({ ...data, caption: e.target.value })}
          placeholder="Legende (optionnel)..."
          className="rounded-md border border-[#E5E5E5] px-2 py-1 text-sm focus:border-[#000091] focus:ring-1 focus:ring-[#000091] outline-none"
        />
      </div>
      <div className="flex items-center gap-2">
        <Link className="h-3.5 w-3.5 text-[#929292] shrink-0" />
        <input
          type="text"
          value={data.linkUrl || ""}
          onChange={(e) => onChange({ ...data, linkUrl: e.target.value })}
          placeholder="URL quand on clique sur l'image"
          className="flex-1 rounded-md border border-[#E5E5E5] px-2 py-1 text-sm focus:border-[#000091] focus:ring-1 focus:ring-[#000091] outline-none"
        />
      </div>
    </div>
  );
}
