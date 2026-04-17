"use client";

import { useEffect, useState, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link,
  Unlink,
  RemoveFormatting,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  editorClassName?: string;
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder = "",
  className,
  editorClassName,
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        link: {
          openOnClick: false,
          autolink: true,
          HTMLAttributes: {
            target: "_blank",
            rel: "noopener noreferrer",
            class: "text-red-600 underline hover:text-red-800",
          },
        },
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: cn(
          "tiptap text-sm outline-none min-h-[2.5rem] px-3 py-2",
          editorClassName,
        ),
        "data-placeholder": placeholder,
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html === "<p></p>" ? "" : html);
    },
  });

  const [linkOpen, setLinkOpen] = useState(false);
  const [linkText, setLinkText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const linkUrlRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const normalized = current === "<p></p>" ? "" : current;
    if (normalized !== content) {
      editor.commands.setContent(content || "");
    }
  }, [content, editor]);

  if (!editor) return null;

  const openLinkDialog = () => {
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, " ");
    setLinkText(selectedText);
    setLinkUrl(editor.getAttributes("link").href || "");
    setLinkOpen(true);
    setTimeout(() => linkUrlRef.current?.focus(), 50);
  };

  const applyLink = () => {
    if (!linkUrl.trim()) {
      setLinkOpen(false);
      return;
    }

    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, " ");

    if (linkText.trim() && linkText !== selectedText) {
      // Replace selected text with new text + link
      editor
        .chain()
        .focus()
        .deleteSelection()
        .insertContent(
          `<a href="${linkUrl}">${linkText}</a>`,
        )
        .run();
    } else {
      // Just apply link to current selection
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkUrl })
        .run();
    }
    setLinkOpen(false);
    setLinkText("");
    setLinkUrl("");
  };

  return (
    <div
      className={cn(
        "rounded-md border border-[#CECECE] bg-white overflow-hidden focus-within:border-[#000091] focus-within:ring-1 focus-within:ring-[#000091] transition-colors",
        className,
      )}
    >
      {/* Toolbar toujours visible */}
      <div className="flex items-center gap-0.5 px-1.5 py-1 border-b border-[#E5E5E5] bg-[#F6F6F6] flex-wrap">
        <ToolbarButton
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Gras (Ctrl+B)"
        >
          <Bold className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italique (Ctrl+I)"
        >
          <Italic className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Souligne (Ctrl+U)"
        >
          <Underline className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="Barre"
        >
          <Strikethrough className="h-3.5 w-3.5" />
        </ToolbarButton>

        <div className="w-px h-4 bg-[#CECECE] mx-1" />

        {editor.isActive("link") ? (
          <ToolbarButton
            active
            onClick={() => editor.chain().focus().unsetLink().run()}
            title="Retirer le lien"
          >
            <Unlink className="h-3.5 w-3.5" />
          </ToolbarButton>
        ) : (
          <ToolbarButton
            active={false}
            onClick={openLinkDialog}
            title="Ajouter un lien"
          >
            <Link className="h-3.5 w-3.5" />
          </ToolbarButton>
        )}

        <div className="w-px h-4 bg-[#CECECE] mx-1" />

        <ToolbarButton
          active={false}
          onClick={() => editor.chain().focus().unsetAllMarks().run()}
          title="Supprimer le formatage"
        >
          <RemoveFormatting className="h-3.5 w-3.5" />
        </ToolbarButton>
      </div>

      {/* Dialog lien inline */}
      {linkOpen && (
        <div className="flex items-center gap-2 px-3 py-2 border-b border-[#E5E5E5] bg-[#000091]/5">
          <input
            type="text"
            value={linkText}
            onChange={(e) => setLinkText(e.target.value)}
            placeholder="Texte du lien"
            className="flex-1 rounded border border-[#CECECE] px-2 py-1 text-xs focus:border-[#000091] focus:ring-1 focus:ring-[#000091] outline-none"
          />
          <input
            ref={linkUrlRef}
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyLink()}
            placeholder="https://..."
            className="flex-1 rounded border border-[#CECECE] px-2 py-1 text-xs focus:border-[#000091] focus:ring-1 focus:ring-[#000091] outline-none"
          />
          <button
            type="button"
            onClick={applyLink}
            className="px-2 py-1 text-xs font-medium bg-[#000091] text-white rounded hover:bg-[#000091]/90"
          >
            OK
          </button>
          <button
            type="button"
            onClick={() => {
              setLinkOpen(false);
              setLinkText("");
              setLinkUrl("");
            }}
            className="px-2 py-1 text-xs text-[#929292] hover:text-[#3A3A3A]"
          >
            Annuler
          </button>
        </div>
      )}

      {/* Zone d'edition */}
      <EditorContent editor={editor} />
    </div>
  );
}

function ToolbarButton({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      title={title}
      className={cn(
        "p-1.5 rounded text-[#929292] hover:bg-white hover:text-[#3A3A3A] transition-colors",
        active && "bg-white text-[#3A3A3A] shadow-sm",
      )}
    >
      {children}
    </button>
  );
}
