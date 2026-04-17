export type BlockType =
  | "heading"
  | "paragraph"
  | "list"
  | "table"
  | "alert"
  | "image"
  | "separator"
  | "cta"
  | "quote";

export interface HeadingBlockData {
  level: 2 | 3 | 4;
  text: string;
}

export interface ParagraphBlockData {
  html: string;
}

export interface ListBlockData {
  style: "ordered" | "unordered";
  items: string[];
}

export interface TableBlockData {
  hasHeader: boolean;
  rows: string[][];
}

export interface AlertBlockData {
  variant: "info" | "warning" | "danger" | "success";
  title?: string;
  text: string;
}

export interface ImageBlockData {
  url: string;
  alt: string;
  caption?: string;
  linkUrl?: string;
}

export interface SeparatorBlockData {}

export interface CTABlockData {
  title: string;
  text: string;
  buttonText: string;
  buttonUrl: string;
}

export interface QuoteBlockData {
  text: string;
  attribution?: string;
}

export type BlockData =
  | HeadingBlockData
  | ParagraphBlockData
  | ListBlockData
  | TableBlockData
  | AlertBlockData
  | ImageBlockData
  | SeparatorBlockData
  | CTABlockData
  | QuoteBlockData;

export interface ContentBlock {
  id: string;
  type: BlockType;
  data: any;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  position: number;
}

export interface ArticleForm {
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: string;
  status: "DRAFT" | "PUBLISHED";
  categoryIds: string[];
  metaTitle: string;
  metaDescription: string;
  content: ContentBlock[];
}

export interface BlockComponentProps<T = any> {
  block: ContentBlock;
  onChange: (data: T) => void;
}

export const BLOCK_LABELS: Record<BlockType, string> = {
  heading: "Titre",
  paragraph: "Paragraphe",
  list: "Liste",
  table: "Tableau",
  alert: "Alerte",
  image: "Image",
  separator: "Séparateur",
  cta: "Appel à l'action",
  quote: "Citation",
};

export function createDefaultBlock(type: BlockType): ContentBlock {
  const id = crypto.randomUUID();
  switch (type) {
    case "heading":
      return { id, type, data: { level: 2, text: "" } };
    case "paragraph":
      return { id, type, data: { html: "" } };
    case "list":
      return { id, type, data: { style: "unordered", items: [""] } };
    case "table":
      return {
        id,
        type,
        data: { hasHeader: true, rows: [["", ""], ["", ""]] },
      };
    case "alert":
      return { id, type, data: { variant: "info", title: "", text: "" } };
    case "image":
      return { id, type, data: { url: "", alt: "", caption: "" } };
    case "separator":
      return { id, type, data: {} };
    case "cta":
      return {
        id,
        type,
        data: { title: "", text: "", buttonText: "", buttonUrl: "" },
      };
    case "quote":
      return { id, type, data: { text: "", attribution: "" } };
  }
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
