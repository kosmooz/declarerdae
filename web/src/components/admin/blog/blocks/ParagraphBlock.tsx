"use client";

import { BlockComponentProps, ParagraphBlockData } from "../types";
import RichTextEditor from "../RichTextEditor";

export default function ParagraphBlock({
  block,
  onChange,
}: BlockComponentProps<ParagraphBlockData>) {
  const data = block.data as ParagraphBlockData;

  return (
    <RichTextEditor
      content={data.html}
      onChange={(html) => onChange({ ...data, html })}
      placeholder="Ecrivez votre texte ici..."
    />
  );
}
