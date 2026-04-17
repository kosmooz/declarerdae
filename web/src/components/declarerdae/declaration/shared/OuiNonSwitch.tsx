"use client";

interface OuiNonSwitchProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export default function OuiNonSwitch({
  label,
  value,
  onChange,
  required,
}: OuiNonSwitchProps) {
  return (
    <div>
      <span className="text-xs text-[#666] mb-1.5 block">
        {label}
        {required && <span className="text-[#E1000F]"> *</span>}
      </span>
      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => onChange("OUI")}
          className={`px-4 py-1.5 rounded-l-md text-xs font-medium border transition-colors ${
            value === "OUI"
              ? "bg-[#18753C] text-white border-[#18753C]"
              : "bg-white text-[#3A3A3A] border-[#CECECE] hover:border-[#18753C]"
          }`}
        >
          Oui
        </button>
        <button
          type="button"
          onClick={() => onChange("NON")}
          className={`px-4 py-1.5 rounded-r-md text-xs font-medium border transition-colors ${
            value === "NON"
              ? "bg-[#666] text-white border-[#666]"
              : "bg-white text-[#3A3A3A] border-[#CECECE] hover:border-[#666]"
          }`}
        >
          Non
        </button>
      </div>
    </div>
  );
}
