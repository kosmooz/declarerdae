"use client";

import { DragDropProvider } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { move } from "@dnd-kit/helpers";
import { FilePlus } from "lucide-react";
import { ContentBlock, BlockType, createDefaultBlock } from "./types";
import BlockWrapper from "./BlockWrapper";
import BlockInsertSlot from "./BlockInsertSlot";
import AddBlockCTA from "./AddBlockCTA";
import HeadingBlock from "./blocks/HeadingBlock";
import ParagraphBlock from "./blocks/ParagraphBlock";
import ListBlock from "./blocks/ListBlock";
import TableBlock from "./blocks/TableBlock";
import AlertBlock from "./blocks/AlertBlock";
import ImageBlock from "./blocks/ImageBlock";
import SeparatorBlock from "./blocks/SeparatorBlock";
import CTABlock from "./blocks/CTABlock";
import QuoteBlock from "./blocks/QuoteBlock";

interface EditorCanvasProps {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}

function renderBlock(
  block: ContentBlock,
  onDataChange: (data: any) => void,
) {
  const props = { block, onChange: onDataChange };
  switch (block.type) {
    case "heading":
      return <HeadingBlock {...props} />;
    case "paragraph":
      return <ParagraphBlock {...props} />;
    case "list":
      return <ListBlock {...props} />;
    case "table":
      return <TableBlock {...props} />;
    case "alert":
      return <AlertBlock {...props} />;
    case "image":
      return <ImageBlock {...props} />;
    case "separator":
      return <SeparatorBlock />;
    case "cta":
      return <CTABlock {...props} />;
    case "quote":
      return <QuoteBlock {...props} />;
    default:
      return (
        <div className="text-red-500 text-sm">Bloc inconnu: {block.type}</div>
      );
  }
}

function SortableBlock({
  block,
  index,
  blocksCount,
  onDataChange,
  onMoveUp,
  onMoveDown,
  onDelete,
}: {
  block: ContentBlock;
  index: number;
  blocksCount: number;
  onDataChange: (data: any) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}) {
  const { ref, handleRef, isDragging } = useSortable({
    id: block.id,
    index,
  });

  return (
    <div ref={ref}>
      <BlockWrapper
        block={block}
        isFirst={index === 0}
        isLast={index === blocksCount - 1}
        handleRef={handleRef}
        isDragging={isDragging}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onDelete={onDelete}
      >
        {renderBlock(block, onDataChange)}
      </BlockWrapper>
    </div>
  );
}

export default function EditorCanvas({ blocks, onChange }: EditorCanvasProps) {
  const addBlock = (index: number, type: BlockType) => {
    const newBlock = createDefaultBlock(type);
    const newBlocks = [...blocks];
    newBlocks.splice(index, 0, newBlock);
    onChange(newBlocks);
  };

  const updateBlock = (id: string, data: any) => {
    onChange(blocks.map((b) => (b.id === id ? { ...b, data } : b)));
  };

  const deleteBlock = (id: string) => {
    onChange(blocks.filter((b) => b.id !== id));
  };

  const moveBlock = (id: string, direction: "up" | "down") => {
    const idx = blocks.findIndex((b) => b.id === id);
    if (idx === -1) return;
    const target = direction === "up" ? idx - 1 : idx + 1;
    if (target < 0 || target >= blocks.length) return;
    const newBlocks = [...blocks];
    [newBlocks[idx], newBlocks[target]] = [newBlocks[target], newBlocks[idx]];
    onChange(newBlocks);
  };

  return (
    <div className="bg-white border border-[#E5E5E5] rounded-lg min-h-[400px]">
      {blocks.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-16">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#F6F6F6]">
            <FilePlus className="h-5 w-5 text-[#929292]" />
          </div>
          <h3 className="text-base font-semibold text-[#3A3A3A]">
            Commencez votre article
          </h3>
          <p className="mb-6 mt-1 text-sm text-[#929292]">
            Ajoutez votre premier bloc pour démarrer.
          </p>
          <div className="w-full max-w-md">
            <AddBlockCTA onAdd={(t) => addBlock(0, t)} variant="empty" />
          </div>
        </div>
      ) : (
        <DragDropProvider
          onDragEnd={(event) => {
            if (event.canceled) return;
            onChange(move(blocks, event) as ContentBlock[]);
          }}
        >
          <div className="p-4 pl-8 space-y-1">
            {blocks.map((block, index) => (
              <div key={block.id}>
                <BlockInsertSlot onAdd={(t) => addBlock(index, t)} />
                <SortableBlock
                  block={block}
                  index={index}
                  blocksCount={blocks.length}
                  onDataChange={(data) => updateBlock(block.id, data)}
                  onMoveUp={() => moveBlock(block.id, "up")}
                  onMoveDown={() => moveBlock(block.id, "down")}
                  onDelete={() => deleteBlock(block.id)}
                />
              </div>
            ))}
            <div className="mt-4">
              <AddBlockCTA onAdd={(t) => addBlock(blocks.length, t)} />
            </div>
          </div>
        </DragDropProvider>
      )}
    </div>
  );
}
