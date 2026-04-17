"use client";

import { Plus, X } from "lucide-react";
import { BlockComponentProps, TableBlockData } from "../types";

export default function TableBlock({
  block,
  onChange,
}: BlockComponentProps<TableBlockData>) {
  const data = block.data as TableBlockData;
  const rows = data.rows || [["", ""]];
  const colCount = rows[0]?.length || 2;

  const updateCell = (row: number, col: number, value: string) => {
    const newRows = rows.map((r) => [...r]);
    newRows[row][col] = value;
    onChange({ ...data, rows: newRows });
  };

  const addRow = () => {
    onChange({ ...data, rows: [...rows, Array(colCount).fill("")] });
  };

  const removeRow = (index: number) => {
    if (rows.length <= 1) return;
    onChange({ ...data, rows: rows.filter((_, i) => i !== index) });
  };

  const addCol = () => {
    onChange({ ...data, rows: rows.map((r) => [...r, ""]) });
  };

  const removeCol = (colIndex: number) => {
    if (colCount <= 1) return;
    onChange({
      ...data,
      rows: rows.map((r) => r.filter((_, i) => i !== colIndex)),
    });
  };

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-xs text-[#3A3A3A]">
        <input
          type="checkbox"
          checked={data.hasHeader}
          onChange={(e) => onChange({ ...data, hasHeader: e.target.checked })}
          className="rounded border-[#CECECE]"
        />
        Première ligne en-tête
      </label>
      <div className="overflow-x-auto border rounded-md">
        <table className="w-full text-sm">
          <tbody>
            {rows.map((row, ri) => (
              <tr
                key={ri}
                className={
                  ri === 0 && data.hasHeader ? "bg-[#F6F6F6]" : ""
                }
              >
                {row.map((cell, ci) => (
                  <td key={ci} className="border-b border-r p-0">
                    <input
                      type="text"
                      value={cell}
                      onChange={(e) => updateCell(ri, ci, e.target.value)}
                      placeholder={
                        ri === 0 && data.hasHeader ? "En-tête" : "Cellule"
                      }
                      className={`w-full px-2 py-1.5 border-0 text-sm focus:ring-0 outline-none bg-transparent ${
                        ri === 0 && data.hasHeader ? "font-semibold" : ""
                      }`}
                    />
                  </td>
                ))}
                <td className="border-b w-6 p-0">
                  <button
                    type="button"
                    onClick={() => removeRow(ri)}
                    className="p-1 text-[#E5E5E5] hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={addRow}
          className="flex items-center gap-1 text-xs text-[#929292] hover:text-[#3A3A3A]"
        >
          <Plus className="h-3 w-3" /> Ligne
        </button>
        <button
          type="button"
          onClick={addCol}
          className="flex items-center gap-1 text-xs text-[#929292] hover:text-[#3A3A3A]"
        >
          <Plus className="h-3 w-3" /> Colonne
        </button>
        {colCount > 1 && (
          <button
            type="button"
            onClick={() => removeCol(colCount - 1)}
            className="flex items-center gap-1 text-xs text-[#929292] hover:text-red-500"
          >
            <X className="h-3 w-3" /> Dernière colonne
          </button>
        )}
      </div>
    </div>
  );
}
