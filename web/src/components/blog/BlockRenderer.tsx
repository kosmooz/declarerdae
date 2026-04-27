"use client";

import Image from "next/image";
import { slugify } from "@/components/admin/blog/types";

interface ContentBlock {
  id: string;
  type: string;
  data: any;
}

function HeadingRenderer({ block }: { block: ContentBlock }) {
  const { level, text } = block.data;
  const id = slugify(text);
  const styles: Record<number, string> = {
    2: "text-xl md:text-2xl font-bold mt-8 mb-3",
    3: "text-lg md:text-xl font-semibold mt-6 mb-2",
    4: "text-base md:text-lg font-medium mt-5 mb-2",
  };
  const className = `${styles[level]} text-[#3A3A3A] scroll-mt-24`;
  if (level === 2) return <h2 id={id} className={className}>{text}</h2>;
  if (level === 3) return <h3 id={id} className={className}>{text}</h3>;
  return <h4 id={id} className={className}>{text}</h4>;
}

function ParagraphRenderer({ block }: { block: ContentBlock }) {
  return (
    <div
      className="text-sm md:text-base text-slate-700 leading-relaxed mb-4"
      dangerouslySetInnerHTML={{ __html: block.data.html }}
    />
  );
}

function ListRenderer({ block }: { block: ContentBlock }) {
  const { style, items } = block.data;
  const Tag = style === "ordered" ? "ol" : "ul";
  return (
    <Tag
      className={`mb-4 pl-6 space-y-1 text-sm md:text-base text-slate-700 ${
        style === "ordered" ? "list-decimal" : "list-disc"
      }`}
    >
      {items.map((item: string, i: number) => (
        <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
      ))}
    </Tag>
  );
}

function TableRenderer({ block }: { block: ContentBlock }) {
  const { hasHeader, rows } = block.data;
  return (
    <div className="overflow-x-auto mb-4 rounded-lg border border-slate-200">
      <table className="w-full text-sm">
        {hasHeader && rows.length > 0 && (
          <thead>
            <tr className="bg-slate-50 border-b">
              {rows[0].map((cell: string, i: number) => (
                <th
                  key={i}
                  className="px-4 py-3 text-left font-semibold text-slate-900"
                >
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {rows.slice(hasHeader ? 1 : 0).map((row: string[], ri: number) => (
            <tr key={ri} className="border-b last:border-0 hover:bg-slate-50">
              {row.map((cell: string, ci: number) => (
                <td key={ci} className="px-4 py-2.5 text-slate-700">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const alertStyles: Record<string, { bg: string; border: string; icon: string }> = {
  info: { bg: "bg-blue-50", border: "border-blue-200", icon: "text-blue-600" },
  warning: { bg: "bg-amber-50", border: "border-amber-200", icon: "text-amber-600" },
  danger: { bg: "bg-red-50", border: "border-red-200", icon: "text-red-600" },
  success: { bg: "bg-green-50", border: "border-green-200", icon: "text-green-600" },
};

function AlertRenderer({ block }: { block: ContentBlock }) {
  const { variant, title, text } = block.data;
  const style = alertStyles[variant] || alertStyles.info;
  return (
    <div
      className={`rounded-lg border ${style.bg} ${style.border} p-4 md:p-5 mb-4`}
    >
      {title && (
        <p className={`font-semibold mb-1 ${style.icon}`}>{title}</p>
      )}
      <div
        className="text-sm text-slate-700 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: text }}
      />
    </div>
  );
}

function ImageRenderer({ block }: { block: ContentBlock }) {
  const { url, alt, caption, linkUrl } = block.data;
  if (!url) return null;
  const img = (
    <Image
      src={url}
      alt={alt || ""}
      width={800}
      height={500}
      className="rounded-lg w-full max-h-[500px] object-contain"
      unoptimized
    />
  );
  return (
    <figure className="mb-4">
      {linkUrl ? (
        <a href={linkUrl} target="_blank" rel="noopener noreferrer">
          {img}
        </a>
      ) : (
        img
      )}
      {caption && (
        <figcaption className="text-center text-xs text-slate-500 mt-2">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

function SeparatorRenderer() {
  return <hr className="my-8 border-slate-200" />;
}

function CTARenderer({ block }: { block: ContentBlock }) {
  const { title, text, buttonText, buttonUrl } = block.data;
  return (
    <div className="my-8 rounded-xl bg-gradient-to-br from-red-600 to-red-700 p-5 md:p-7 text-white text-center">
      {title && <h3 className="text-lg md:text-xl font-bold mb-2">{title}</h3>}
      {text && (
        <p
          className="text-sm text-red-100 mb-4 max-w-lg mx-auto"
          dangerouslySetInnerHTML={{ __html: text }}
        />
      )}
      {buttonText && buttonUrl && (
        <a
          href={buttonUrl}
          className="inline-block px-6 py-3 bg-white text-red-600 font-semibold rounded-lg hover:bg-red-50 transition-colors"
        >
          {buttonText}
        </a>
      )}
    </div>
  );
}

function QuoteRenderer({ block }: { block: ContentBlock }) {
  const { text, attribution } = block.data;
  return (
    <blockquote className="border-l-4 border-red-500 pl-4 my-6 italic">
      <div
        className="text-sm md:text-base text-slate-700"
        dangerouslySetInnerHTML={{ __html: text }}
      />
      {attribution && (
        <footer className="text-sm text-slate-500 mt-1 not-italic">
          — {attribution}
        </footer>
      )}
    </blockquote>
  );
}

export default function BlockRenderer({ blocks }: { blocks: ContentBlock[] }) {
  if (!blocks || !Array.isArray(blocks)) return null;

  return (
    <div className="max-w-none">
      {blocks.map((block) => {
        switch (block.type) {
          case "heading":
            return <HeadingRenderer key={block.id} block={block} />;
          case "paragraph":
            return <ParagraphRenderer key={block.id} block={block} />;
          case "list":
            return <ListRenderer key={block.id} block={block} />;
          case "table":
            return <TableRenderer key={block.id} block={block} />;
          case "alert":
            return <AlertRenderer key={block.id} block={block} />;
          case "image":
            return <ImageRenderer key={block.id} block={block} />;
          case "separator":
            return <SeparatorRenderer key={block.id} />;
          case "cta":
            return <CTARenderer key={block.id} block={block} />;
          case "quote":
            return <QuoteRenderer key={block.id} block={block} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
