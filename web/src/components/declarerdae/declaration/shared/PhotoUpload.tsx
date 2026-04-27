"use client";

import { useRef, useState } from "react";
import NextImage from "next/image";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface PhotoUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  declarationId?: string;
  deviceId?: string;
}

export default function PhotoUpload({
  label,
  value,
  onChange,
}: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      // Use relative URL — Next.js rewrites proxy /api/* to the backend in dev,
      // and nginx handles it in production.
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        onChange(data.url);
      }
    } catch {
      // silently fail
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div>
      <span className="text-xs text-[#666] mb-1 block">{label}</span>
      {value ? (
        <div className="relative inline-block">
          <NextImage
            src={value}
            alt={label}
            width={96}
            height={96}
            className="w-24 h-24 object-cover rounded border border-[#CECECE]"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-[#CECECE] rounded-sm p-4 text-center cursor-pointer hover:border-[#000091] transition-colors"
        >
          {uploading ? (
            <p className="text-xs text-[#666]">Envoi en cours...</p>
          ) : (
            <>
              <ImageIcon className="w-6 h-6 mx-auto text-[#929292] mb-1" />
              <p className="text-xs text-[#666]">
                Glissez une photo ou{" "}
                <span className="text-[#000091] underline">parcourir</span>
              </p>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </div>
      )}
    </div>
  );
}
