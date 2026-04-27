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
import type { DeclarationFormState } from "@/lib/declaration-types";
import { TYPE_ERP_OPTIONS } from "@/lib/declaration-types";
import { getPhonePlaceholder } from "@/data/phone-prefixes";
import SiteLocationMap from "../shared/SiteLocationMap";
import PhonePrefixSelect from "../shared/PhonePrefixSelect";

interface Step2Props {
  data: DeclarationFormState;
  onChange: (field: string, value: any) => void;
  onBatchChange: (fields: Record<string, any>) => void;
}

export default function Step2SiteLocalisation({
  data,
  onChange,
  onBatchChange,
}: Step2Props) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-heading font-semibold text-lg text-[#161616] mb-1">
          Site d'implantation
        </h3>
        <p className="text-sm text-[#666]">
          Localisation du site où sont installés les défibrillateurs. L'adresse
          sera géolocalisée automatiquement via la Base Adresse Nationale.
        </p>
      </div>

      {/* Établissement */}
      <div>
        <Label htmlFor="site-nom" className="text-xs text-[#666] mb-1 block">
          Nom de l'établissement
        </Label>
        <Input
          id="site-nom"
          value={data.nomEtablissement}
          onChange={(e) => onChange("nomEtablissement", e.target.value)}
          placeholder="Mairie de Paris, Centre commercial..."
          className="border-[#CECECE] focus:border-[#000091] focus:ring-1 focus:ring-[#000091]"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label htmlFor="site-typeERP" className="text-xs text-[#666] mb-1 block">
            Type d'établissement
          </Label>
          <Select
            value={data.typeERP}
            onValueChange={(v) => onChange("typeERP", v)}
          >
            <SelectTrigger id="site-typeERP" className="border-[#CECECE] focus:border-[#000091] focus:ring-1 focus:ring-[#000091]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={4}>
              {TYPE_ERP_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Adresse avec geocodage BAN + carte */}
      <div className="border-t border-[#E5E5E5] pt-4">
        <SiteLocationMap
          lat={data.latCoor1}
          lng={data.longCoor1}
          adrNum={data.adrNum}
          adrVoie={data.adrVoie}
          adrComplement={data.adrComplement}
          codePostal={data.codePostal}
          codeInsee={data.codeInsee}
          ville={data.ville}
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
            <Label htmlFor="site-tel1" className="text-xs text-[#666] mb-1 block">
              Téléphone sur site <span className="text-[#E1000F]">*</span>
            </Label>
            <div className="flex">
              <PhonePrefixSelect
                value={data.tel1Prefix}
                onChange={(code) => onChange("tel1Prefix", code)}
                className="shrink-0 w-[120px]"
              />
              <Input
                id="site-tel1"
                aria-required="true"
                type="tel"
                inputMode="tel"
                value={data.tel1}
                onChange={(e) => onChange("tel1", e.target.value)}
                placeholder={getPhonePlaceholder(data.tel1Prefix) || "Numéro de téléphone"}
                className="rounded-l-none border-l-0 border-[#CECECE] focus:border-[#000091] focus:ring-1 focus:ring-[#000091]"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="site-tel2" className="text-xs text-[#666] mb-1 block">
              Téléphone 2{" "}
              <span className="text-[#929292]">(facultatif)</span>
            </Label>
            <div className="flex">
              <PhonePrefixSelect
                value={data.tel2Prefix}
                onChange={(code) => onChange("tel2Prefix", code)}
                className="shrink-0 w-[120px]"
              />
              <Input
                id="site-tel2"
                type="tel"
                inputMode="tel"
                value={data.tel2}
                onChange={(e) => onChange("tel2", e.target.value)}
                placeholder={getPhonePlaceholder(data.tel2Prefix) || "Numéro de téléphone"}
                className="rounded-l-none border-l-0 border-[#CECECE] focus:border-[#000091] focus:ring-1 focus:ring-[#000091]"
              />
            </div>
          </div>
        </div>
        <div className="mt-3">
          <Label htmlFor="site-email" className="text-xs text-[#666] mb-1 block">
            Email du site{" "}
            <span className="text-[#929292]">(facultatif)</span>
          </Label>
          <Input
            id="site-email"
            type="email"
            value={data.siteEmail}
            onChange={(e) => onChange("siteEmail", e.target.value)}
            placeholder="accueil@site.fr"
            className="border-[#CECECE] focus:border-[#000091] focus:ring-1 focus:ring-[#000091]"
          />
        </div>
      </div>
    </div>
  );
}
