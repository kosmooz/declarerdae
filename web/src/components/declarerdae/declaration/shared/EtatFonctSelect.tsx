"use client";

import { ETAT_FONCT_OPTIONS } from "@/lib/declaration-types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EtatFonctSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export default function EtatFonctSelect({
  value,
  onChange,
}: EtatFonctSelectProps) {
  return (
    <div>
      <span className="text-xs text-[#666] mb-1 block">
        État de fonctionnement <span className="text-[#E1000F]">*</span>
      </span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="border-[#CECECE] focus:border-[#000091] focus:ring-1 focus:ring-[#000091]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ETAT_FONCT_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
