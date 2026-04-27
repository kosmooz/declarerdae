"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Search } from "lucide-react";
import FlagImage from "next/image";
import PHONE_PREFIXES, { PRIORITY_CODES } from "@/data/phone-prefixes";
import type { PhonePrefix } from "@/data/phone-prefixes";

interface PhonePrefixSelectProps {
  value: string;
  onChange: (code: string) => void;
  className?: string;
  hasError?: boolean;
}

function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function buildOrderedList(): {
  items: (PhonePrefix | "separator")[];
  byCode: Map<string, PhonePrefix>;
} {
  const byCode = new Map<string, PhonePrefix>();
  for (const p of PHONE_PREFIXES) byCode.set(p.code, p);

  // For DeclarerDAE: France first, then overseas territories
  const daePriority = ["fr", "re", "gp", "mq", "gf", "yt", "nc", "pf", "pm", "wf", "bl", "mf"];
  const priority: PhonePrefix[] = [];
  for (const c of daePriority) {
    const p = byCode.get(c);
    if (p) priority.push(p);
  }

  const prioritySet = new Set(daePriority);
  const rest = PHONE_PREFIXES
    .filter((p) => !prioritySet.has(p.code))
    .sort((a, b) => a.name.localeCompare(b.name, "fr"));

  return { items: [...priority, "separator", ...rest], byCode };
}

const { items: ORDERED, byCode: BY_CODE } = buildOrderedList();

export default function PhonePrefixSelect({
  value,
  onChange,
  className = "",
  hasError = false,
}: PhonePrefixSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selected = BY_CODE.get(value);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  useEffect(() => {
    if (open && listRef.current && value) {
      const el = listRef.current.querySelector(`[data-code="${value}"]`);
      if (el) el.scrollIntoView({ block: "nearest" });
    }
  }, [open, value]);

  const filtered = useMemo(() => {
    if (!search) return ORDERED;
    const q = normalize(search);
    return ORDERED.filter((item) => {
      if (item === "separator") return false;
      return (
        normalize(item.name).includes(q) ||
        item.dial.includes(q) ||
        item.code.includes(q)
      );
    });
  }, [search]);

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex h-10 w-full items-center gap-2 rounded-md rounded-r-none border border-r-0 bg-[#F6F6F6] hover:bg-[#ECECEC] px-2.5 py-2 text-sm transition-colors
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#000091]/30
          ${hasError ? "border-[#E1000F]" : "border-[#CECECE]"}`}
      >
        {selected ? (
          <>
            <FlagImage
              src={`/flags/${selected.code}.svg`}
              alt={selected.name}
              width={24}
              height={16}
              className="h-4 w-6 shrink-0 rounded-[2px] object-cover"
              unoptimized
            />
            <span className="text-[#3A3A3A] whitespace-nowrap">+{selected.dial}</span>
          </>
        ) : (
          <span className="text-[#929292]">Indicatif</span>
        )}
        <ChevronDown className="ml-auto h-4 w-4 shrink-0 text-[#929292]" />
      </button>

      {open && (
        <div className="absolute left-0 z-50 mt-1 w-72 rounded-md border border-[#CECECE] bg-white shadow-lg">
          <div className="flex items-center gap-2 border-b border-[#E5E5E5] px-3 py-2">
            <Search className="h-4 w-4 text-[#929292] shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un pays..."
              className="w-full text-sm outline-none placeholder:text-[#929292]"
            />
          </div>

          <div ref={listRef} className="max-h-60 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-sm text-[#929292]">Aucun résultat</div>
            ) : (
              filtered.map((item, i) => {
                if (item === "separator") {
                  return <hr key="sep" className="my-1 border-[#E5E5E5]" />;
                }
                const isSelected = item.code === value;
                return (
                  <button
                    key={item.code}
                    type="button"
                    data-code={item.code}
                    onClick={() => {
                      onChange(item.code);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={`flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-[#F6F6F6] ${
                      isSelected ? "bg-[#F6F6F6] font-medium text-[#000091]" : "text-[#3A3A3A]"
                    }`}
                  >
                    <FlagImage
                      src={`/flags/${item.code}.svg`}
                      alt=""
                      width={24}
                      height={16}
                      className="h-4 w-6 shrink-0 rounded-[2px] object-cover"
                      unoptimized
                    />
                    <span className="truncate">{item.name}</span>
                    <span className="ml-auto shrink-0 text-[#929292]">+{item.dial}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
