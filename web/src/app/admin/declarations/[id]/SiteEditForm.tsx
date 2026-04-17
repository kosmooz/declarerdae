"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TYPE_ERP_OPTIONS,
  CATEGORIE_ERP_OPTIONS,
} from "@/lib/declaration-types";
import SiteLocationMap from "@/components/declarerdae/declaration/shared/SiteLocationMap";
import PhonePrefixSelect from "@/components/declarerdae/declaration/shared/PhonePrefixSelect";
import { getPhonePlaceholder } from "@/data/phone-prefixes";

interface SiteEditFormProps {
  data: Record<string, any>;
  onChange: (field: string, value: any) => void;
  onBatchChange: (fields: Record<string, any>) => void;
}

export default function SiteEditForm({
  data,
  onChange,
  onBatchChange,
}: SiteEditFormProps) {
  return (
    <div className="space-y-4">
      {/* Nom de l'établissement */}
      <div>
        <Label className="text-xs text-[#666] mb-1 block">
          Nom de l&apos;établissement
        </Label>
        <Input
          value={data.nomEtablissement || ""}
          onChange={(e) => onChange("nomEtablissement", e.target.value)}
          placeholder="Mairie, centre commercial, gymnase..."
          className="border-[#CECECE] focus:border-[#000091] focus:ring-1 focus:ring-[#000091]"
        />
      </div>

      {/* Type d'établissement + Catégorie ERP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label className="text-xs text-[#666] mb-1 block">
            Type d&apos;établissement
          </Label>
          <Select
            value={data.typeERP || ""}
            onValueChange={(value) => onChange("typeERP", value)}
          >
            <SelectTrigger className="w-full border-[#CECECE] focus:border-[#000091] focus:ring-1 focus:ring-[#000091]">
              <SelectValue placeholder="Sélectionner un type" />
            </SelectTrigger>
            <SelectContent>
              {TYPE_ERP_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {data.typeERP === "erp" && (
          <div>
            <Label className="text-xs text-[#666] mb-1 block">
              Catégorie ERP
            </Label>
            <Select
              value={data.categorieERP || ""}
              onValueChange={(value) => onChange("categorieERP", value)}
            >
              <SelectTrigger className="w-full border-[#CECECE] focus:border-[#000091] focus:ring-1 focus:ring-[#000091]">
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIE_ERP_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Adresse avec geocodage BAN + carte */}
      <div className="border-t border-[#E5E5E5] pt-4">
        <SiteLocationMap
          lat={data.latCoor1 ?? null}
          lng={data.longCoor1 ?? null}
          adrNum={data.adrNum || ""}
          adrVoie={data.adrVoie || ""}
          adrComplement={data.adrComplement || ""}
          codePostal={data.codePostal || ""}
          codeInsee={data.codeInsee || ""}
          ville={data.ville || ""}
          onBatchChange={onBatchChange}
        />
      </div>

      {/* Contact site */}
      <div className="border-t border-[#E5E5E5] pt-4">
        <h4 className="text-sm font-semibold text-[#161616] mb-3">
          Contact sur le site
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-[#666] mb-1 block">
              Téléphone site <span className="text-[#E1000F]">*</span>
            </Label>
            <div className="flex">
              <PhonePrefixSelect
                value={data.tel1Prefix || "fr"}
                onChange={(code) => onChange("tel1Prefix", code)}
                className="shrink-0 w-[120px]"
              />
              <Input
                type="tel"
                inputMode="tel"
                value={data.tel1 || ""}
                onChange={(e) => onChange("tel1", e.target.value)}
                placeholder={getPhonePlaceholder(data.tel1Prefix || "fr") || "01 23 45 67 89"}
                className="rounded-l-none border-l-0 border-[#CECECE] focus:border-[#000091] focus:ring-1 focus:ring-[#000091]"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs text-[#666] mb-1 block">
              Téléphone 2
            </Label>
            <div className="flex">
              <PhonePrefixSelect
                value={data.tel2Prefix || "fr"}
                onChange={(code) => onChange("tel2Prefix", code)}
                className="shrink-0 w-[120px]"
              />
              <Input
                type="tel"
                inputMode="tel"
                value={data.tel2 || ""}
                onChange={(e) => onChange("tel2", e.target.value)}
                placeholder={getPhonePlaceholder(data.tel2Prefix || "fr") || "06 12 34 56 78"}
                className="rounded-l-none border-l-0 border-[#CECECE] focus:border-[#000091] focus:ring-1 focus:ring-[#000091]"
              />
            </div>
          </div>
        </div>
        <div className="mt-3">
          <Label className="text-xs text-[#666] mb-1 block">
            Email du site
          </Label>
          <Input
            type="email"
            value={data.siteEmail || ""}
            onChange={(e) => onChange("siteEmail", e.target.value)}
            placeholder="contact@etablissement.fr"
            className="border-[#CECECE] focus:border-[#000091] focus:ring-1 focus:ring-[#000091]"
          />
        </div>
      </div>
    </div>
  );
}
