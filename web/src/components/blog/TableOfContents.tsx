"use client";

import { useState, useEffect } from "react";
import { slugify } from "@/components/admin/blog/types";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  blocks: any[];
}

export default function TableOfContents({ blocks }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");

  const items: TocItem[] = (blocks || [])
    .filter((b) => b.type === "heading" && b.data?.text)
    .map((b) => ({
      id: slugify(b.data.text),
      text: b.data.text,
      level: b.data.level,
    }));

  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0.1 },
    );

    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav className="space-y-1">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
        Sommaire
      </p>
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          onClick={(e) => {
            e.preventDefault();
            document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" });
          }}
          className={`block text-sm py-1 border-l-2 transition-colors ${
            activeId === item.id
              ? "border-red-500 text-red-600 font-medium"
              : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
          }`}
          style={{ paddingLeft: 12 + (item.level - 2) * 12 }}
        >
          {item.text}
        </a>
      ))}
    </nav>
  );
}
