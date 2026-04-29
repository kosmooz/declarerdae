"use client";

import { useEffect, useState, useRef } from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle, FontSize } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link as LinkIcon,
  Unlink,
  RemoveFormatting,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Code,
  Code2,
  Minus,
  Subscript as SubIcon,
  Superscript as SupIcon,
  Palette,
  Highlighter,
  Type,
  ChevronDown,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";


const TEXT_COLORS: { name: string; color: string }[] = [
  { name: "Texte par défaut", color: "" },
  { name: "Bleu marine", color: "#000091" },
  { name: "Rouge", color: "#E1000F" },
  { name: "Vert", color: "#18753C" },
  { name: "Orange", color: "#92400E" },
  { name: "Gris", color: "#929292" },
  { name: "Noir", color: "#000000" },
];

const HIGHLIGHT_COLORS: { name: string; color: string }[] = [
  { name: "Aucun", color: "" },
  { name: "Jaune", color: "#FEF3C7" },
  { name: "Rouge clair", color: "#FECACA" },
  { name: "Vert clair", color: "#DCFCE7" },
  { name: "Bleu clair", color: "#DBEAFE" },
  { name: "Violet clair", color: "#F3E8FF" },
  { name: "Gris clair", color: "#F3F4F6" },
];

const FONT_SIZES: { name: string; value: string }[] = [
  { name: "Petite", value: "0.85em" },
  { name: "Normale", value: "" },
  { name: "Grande", value: "1.15em" },
  { name: "Très grande", value: "1.4em" },
];

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
            class: "text-[#000091] underline hover:text-[#000091]/80",
          },
        },
      }),
      TextStyle,
      FontSize,
      Color.configure({ types: ["textStyle"] }),
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"],
        defaultAlignment: "left",
      }),
      Subscript,
      Superscript,
    ],
    content,
    editorProps: {
      attributes: {
        class: cn(
          "tiptap text-base outline-none min-h-[8rem] px-4 py-3 leading-relaxed",
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
      editor
        .chain()
        .focus()
        .deleteSelection()
        .insertContent(`<a href="${linkUrl}">${linkText}</a>`)
        .run();
    } else {
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
        "rounded-md border border-[#CECECE] bg-white focus-within:border-[#000091] focus-within:ring-1 focus-within:ring-[#000091] transition-colors",
        className,
      )}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 rounded-t-md border-b border-[#E5E5E5] bg-[#F6F6F6] px-1.5 py-1">
        {/* Inline marks */}
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
          title="Souligné (Ctrl+U)"
        >
          <Underline className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="Barré"
        >
          <Strikethrough className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("code")}
          onClick={() => editor.chain().focus().toggleCode().run()}
          title="Code en ligne"
        >
          <Code className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("subscript")}
          onClick={() => editor.chain().focus().toggleSubscript().run()}
          title="Indice"
        >
          <SubIcon className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("superscript")}
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
          title="Exposant"
        >
          <SupIcon className="h-3.5 w-3.5" />
        </ToolbarButton>

        <Divider />

        {/* Couleur de texte */}
        <ColorDropdown
          editor={editor}
          icon={<Palette className="h-3.5 w-3.5" />}
          title="Couleur du texte"
          colors={TEXT_COLORS}
          onApply={(color) => {
            if (color) {
              editor.chain().focus().setColor(color).run();
            } else {
              editor.chain().focus().unsetColor().run();
            }
          }}
          activeColor={editor.getAttributes("textStyle").color || ""}
        />

        {/* Surlignage */}
        <ColorDropdown
          editor={editor}
          icon={<Highlighter className="h-3.5 w-3.5" />}
          title="Surlignage"
          colors={HIGHLIGHT_COLORS}
          onApply={(color) => {
            if (color) {
              editor.chain().focus().toggleHighlight({ color }).run();
            } else {
              editor.chain().focus().unsetHighlight().run();
            }
          }}
          activeColor={editor.getAttributes("highlight").color || ""}
        />

        {/* Taille */}
        <FontSizeDropdown editor={editor} />

        <Divider />

        {/* Alignement */}
        <ToolbarButton
          active={editor.isActive({ textAlign: "left" })}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          title="Aligner à gauche"
        >
          <AlignLeft className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive({ textAlign: "center" })}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          title="Centrer"
        >
          <AlignCenter className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive({ textAlign: "right" })}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          title="Aligner à droite"
        >
          <AlignRight className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive({ textAlign: "justify" })}
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          title="Justifier"
        >
          <AlignJustify className="h-3.5 w-3.5" />
        </ToolbarButton>

        <Divider />

        {/* Listes */}
        <ToolbarButton
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Liste à puces"
        >
          <List className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Liste numérotée"
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </ToolbarButton>

        {/* Blocs */}
        <ToolbarButton
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="Citation"
        >
          <Quote className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          title="Bloc de code"
        >
          <Code2 className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          active={false}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Séparateur"
        >
          <Minus className="h-3.5 w-3.5" />
        </ToolbarButton>

        <Divider />

        {/* Lien */}
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
            <LinkIcon className="h-3.5 w-3.5" />
          </ToolbarButton>
        )}

        <Divider />

        {/* Reset */}
        <ToolbarButton
          active={false}
          onClick={() =>
            editor.chain().focus().unsetAllMarks().clearNodes().run()
          }
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

      {/* Zone d'édition */}
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
      aria-label={title}
      aria-pressed={active}
      className={cn(
        "p-1.5 rounded text-[#929292] hover:bg-white hover:text-[#3A3A3A] transition-colors",
        active && "bg-white text-[#000091] shadow-sm",
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="mx-1 h-4 w-px bg-[#CECECE]" />;
}

function ColorDropdown({
  editor: _editor,
  icon,
  title,
  colors,
  onApply,
  activeColor,
}: {
  editor: Editor;
  icon: React.ReactNode;
  title: string;
  colors: { name: string; color: string }[];
  onApply: (color: string) => void;
  activeColor: string;
}) {
  const [open, setOpen] = useState(false);
  const [customHex, setCustomHex] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      setCustomHex(activeColor && !colors.some((c) => c.color === activeColor) ? activeColor : "");
    }
  }, [open, activeColor, colors]);

  const normalizeHex = (raw: string): string | null => {
    let v = raw.trim();
    if (!v) return null;
    if (!v.startsWith("#")) v = "#" + v;
    if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v)) return v.toLowerCase();
    return null;
  };

  const applyCustom = () => {
    const normalized = normalizeHex(customHex);
    if (!normalized) return;
    onApply(normalized);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen((v) => !v)}
        title={title}
        aria-label={title}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "flex items-center gap-0.5 rounded p-1.5 text-[#929292] hover:bg-white hover:text-[#3A3A3A] transition-colors",
          open && "bg-white text-[#000091] shadow-sm",
        )}
      >
        {icon}
        <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute left-0 top-full z-30 mt-1 w-56 rounded-md border border-[#E5E5E5] bg-white p-1 shadow-lg"
        >
          {colors.map((c) => (
            <button
              key={c.name}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onApply(c.color);
                setOpen(false);
              }}
              role="menuitem"
              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs text-[#3A3A3A] hover:bg-[#F6F6F6]"
            >
              <span
                aria-hidden
                className="h-4 w-4 flex-shrink-0 rounded border border-[#E5E5E5]"
                style={{
                  backgroundColor: c.color || "#FFFFFF",
                  backgroundImage: !c.color
                    ? "linear-gradient(to top right, transparent calc(50% - 1px), #E1000F 50%, transparent calc(50% + 1px))"
                    : undefined,
                }}
              />
              <span className="flex-1">{c.name}</span>
              {activeColor && c.color === activeColor && (
                <Check className="h-3 w-3 text-[#000091]" />
              )}
            </button>
          ))}

          <div className="my-1 border-t border-[#E5E5E5]" />

          <div className="px-2 py-2">
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-[#929292]">
              Couleur personnalisée
            </div>
            <div className="flex items-center gap-1.5">
              <label
                className="relative h-6 w-6 flex-shrink-0 cursor-pointer overflow-hidden rounded border border-[#E5E5E5]"
                style={{ backgroundColor: normalizeHex(customHex) || "#FFFFFF" }}
                title="Choisir une couleur"
              >
                <input
                  type="color"
                  value={normalizeHex(customHex) || "#000091"}
                  onChange={(e) => setCustomHex(e.target.value)}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
              </label>
              <input
                type="text"
                value={customHex}
                onChange={(e) => setCustomHex(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    applyCustom();
                  }
                }}
                placeholder="#000091"
                spellCheck={false}
                className="min-w-0 flex-1 rounded border border-[#CECECE] px-1.5 py-1 font-mono text-xs uppercase outline-none focus:border-[#000091] focus:ring-1 focus:ring-[#000091]"
              />
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={applyCustom}
                disabled={!normalizeHex(customHex)}
                className="rounded bg-[#000091] px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-[#000091]/90 disabled:opacity-30"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FontSizeDropdown({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const currentSize = editor.getAttributes("textStyle").fontSize || "";

  const apply = (value: string) => {
    if (value) {
      editor.chain().focus().setFontSize(value).run();
    } else {
      editor.chain().focus().unsetFontSize().run();
    }
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen((v) => !v)}
        title="Taille du texte"
        aria-label="Taille du texte"
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "flex items-center gap-0.5 rounded p-1.5 text-[#929292] hover:bg-white hover:text-[#3A3A3A] transition-colors",
          open && "bg-white text-[#000091] shadow-sm",
        )}
      >
        <Type className="h-3.5 w-3.5" />
        <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute left-0 top-full z-30 mt-1 w-40 rounded-md border border-[#E5E5E5] bg-white p-1 shadow-lg"
        >
          {FONT_SIZES.map((s) => (
            <button
              key={s.name}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => apply(s.value)}
              role="menuitem"
              className="flex w-full items-center justify-between gap-2 rounded px-2 py-1.5 text-left text-xs text-[#3A3A3A] hover:bg-[#F6F6F6]"
            >
              <span style={s.value ? { fontSize: s.value } : undefined}>
                {s.name}
              </span>
              {currentSize === s.value && (
                <Check className="h-3 w-3 text-[#000091]" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

