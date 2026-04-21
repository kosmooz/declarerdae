"use client";

import type { DaeDeviceFormState } from "@/lib/declaration-types";
import { Cpu, ChevronDown, ChevronUp, Trash2, Globe } from "lucide-react";

interface DaeDeviceCardProps {
  device: DaeDeviceFormState;
  index: number;
  isOpen: boolean;
  canDelete: boolean;
  syncedToGeodae?: boolean;
  onToggle: () => void;
  onDelete: () => void;
}

export default function DaeDeviceCard({
  device,
  index,
  isOpen,
  canDelete,
  syncedToGeodae,
  onToggle,
  onDelete,
}: DaeDeviceCardProps) {
  const hasName = device.nom?.trim();
  const hasFab = device.fabRais?.trim();
  const hasModele = device.modele?.trim();

  // Count filled required fields for progress
  const requiredFields = [
    device.nom, device.fabRais, device.modele, device.numSerie,
    device.acc, device.accLib, device.daeMobile,
    device.etatFonct,
  ];
  const dispFilled = device.dispJ.length > 0 && device.dispH.length > 0;
  const filledCount =
    requiredFields.filter((f) => f?.trim()).length + (dispFilled ? 2 : 0);
  const totalRequired = 10;
  const pct = Math.round((filledCount / totalRequired) * 100);

  return (
    <div className="border border-[#CECECE] rounded-sm overflow-hidden">
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggle(); } }}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#F6F6F6] transition-colors cursor-pointer"
      >
        <div className="w-8 h-8 rounded-full bg-[#000091]/10 flex items-center justify-center shrink-0">
          <Cpu className="w-4 h-4 text-[#000091]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[#161616] truncate">
              {hasName || `DAE ${index + 1}`}
            </span>
            {pct === 100 && (
              <span className="text-[10px] bg-[#18753C] text-white px-1.5 py-0.5 rounded-full">
                Complet
              </span>
            )}
          </div>
          <div className="text-xs text-[#929292] truncate">
            {hasFab && hasModele
              ? `${device.fabRais} — ${device.modele}`
              : "Cliquez pour renseigner ce défibrillateur"}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-12 h-1.5 bg-[#E5E5E5] rounded-full overflow-hidden shrink-0">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${pct}%`,
              backgroundColor: pct === 100 ? "#18753C" : "#000091",
            }}
          />
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {syncedToGeodae && (
            <span
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-green-100 text-[#18753C]"
            >
              <Globe className="w-2.5 h-2.5" />
              GéoDAE
            </span>
          )}
          {(canDelete || syncedToGeodae) && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1 text-[#929292] hover:text-[#E1000F] transition-colors"
              title={syncedToGeodae ? "Supprimer de GéoDAE" : "Supprimer ce DAE"}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-[#929292]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#929292]" />
          )}
        </div>
      </div>
    </div>
  );
}
