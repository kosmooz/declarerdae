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
import { ACC_OPTIONS, TYPE_DAE_OPTIONS } from "@/lib/declaration-types";
import OuiNonSwitch from "@/components/declarerdae/declaration/shared/OuiNonSwitch";
import EtatFonctSelect from "@/components/declarerdae/declaration/shared/EtatFonctSelect";
import DispJourSelector from "@/components/declarerdae/declaration/shared/DispJourSelector";
import DispHeureSelector from "@/components/declarerdae/declaration/shared/DispHeureSelector";
import DaeMarkerMap from "@/components/declarerdae/declaration/shared/DaeMarkerMap";

interface DeviceEditFormProps {
  data: Record<string, any>;
  siteLat: number | null;
  siteLng: number | null;
  onChange: (field: string, value: any) => void;
}

export default function DeviceEditForm({
  data,
  siteLat,
  siteLng,
  onChange,
}: DeviceEditFormProps) {
  return (
    <div className="space-y-5">
      {/* ── Section 1 : Identification ── */}
      <div>
        <h4 className="text-sm font-semibold text-[#000091] mb-3">
          Identification
        </h4>

        <div className="space-y-3">
          {/* Nom du DAE */}
          <div>
            <Label className="text-xs text-[#666] mb-1 block">
              Nom du DAE <span className="text-[#E1000F]">*</span>
            </Label>
            <Input
              value={data.nom || ""}
              onChange={(e) => onChange("nom", e.target.value)}
              placeholder="DAE-Accueil-RDC"
              className="border-[#CECECE] focus:border-[#000091] focus:ring-1 focus:ring-[#000091]"
            />
          </div>

          {/* Fabricant + Modele */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-[#666] mb-1 block">
                Fabricant <span className="text-[#E1000F]">*</span>
              </Label>
              <Input
                value={data.fabRais || ""}
                onChange={(e) => onChange("fabRais", e.target.value)}
                placeholder="Zoll, Philips, Schiller..."
                className="border-[#CECECE] focus:border-[#000091] focus:ring-1 focus:ring-[#000091]"
              />
            </div>
            <div>
              <Label className="text-xs text-[#666] mb-1 block">
                Modele <span className="text-[#E1000F]">*</span>
              </Label>
              <Input
                value={data.modele || ""}
                onChange={(e) => onChange("modele", e.target.value)}
                placeholder="AED 3, HS1, CR+..."
                className="border-[#CECECE] focus:border-[#000091] focus:ring-1 focus:ring-[#000091]"
              />
            </div>
          </div>

          {/* N° de serie + Type de DAE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-[#666] mb-1 block">
                N° de serie <span className="text-[#E1000F]">*</span>
              </Label>
              <Input
                value={data.numSerie || ""}
                onChange={(e) => onChange("numSerie", e.target.value)}
                placeholder="X09E409930"
                className="border-[#CECECE] focus:border-[#000091] focus:ring-1 focus:ring-[#000091]"
              />
            </div>
            <div>
              <Label className="text-xs text-[#666] mb-1 block">
                Type de DAE
              </Label>
              <Select
                value={data.typeDAE || ""}
                onValueChange={(v) => onChange("typeDAE", v)}
              >
                <SelectTrigger className="border-[#CECECE] focus:border-[#000091] focus:ring-1 focus:ring-[#000091]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_DAE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Etat fonctionnel */}
          <EtatFonctSelect
            value={data.etatFonct || ""}
            onChange={(v) => onChange("etatFonct", v)}
          />

          {/* Carte de position du DAE */}
          <DaeMarkerMap
            lat={data.daeLat ?? null}
            lng={data.daeLng ?? null}
            siteLat={siteLat}
            siteLng={siteLng}
            onPositionChange={(newLat, newLng) => {
              onChange("daeLat", newLat);
              onChange("daeLng", newLng);
            }}
          />
        </div>
      </div>

      {/* ── Section 2 : Acces & Disponibilite ── */}
      <div className="border-t border-[#E5E5E5] pt-4">
        <h4 className="text-sm font-semibold text-[#000091] mb-3">
          Acces & Disponibilite
        </h4>

        <div className="space-y-3">
          {/* Environnement + Acces libre + DAE itinerant */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs text-[#666] mb-1 block">
                Environnement <span className="text-[#E1000F]">*</span>
              </Label>
              <Select
                value={data.acc || ""}
                onValueChange={(v) => onChange("acc", v)}
              >
                <SelectTrigger className="border-[#CECECE] focus:border-[#000091] focus:ring-1 focus:ring-[#000091]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACC_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <OuiNonSwitch
              label="Acces libre"
              value={data.accLib || ""}
              onChange={(v) => onChange("accLib", v)}
              required
            />
            <OuiNonSwitch
              label="DAE itinerant"
              value={data.daeMobile || ""}
              onChange={(v) => onChange("daeMobile", v)}
              required
            />
          </div>

          {/* Etage + Complement d'acces */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-[#666] mb-1 block">
                Etage{" "}
                <span className="text-[#929292]">(facultatif)</span>
              </Label>
              <Input
                value={data.accEtg || ""}
                onChange={(e) => onChange("accEtg", e.target.value)}
                placeholder="0 = RDC, -1 = sous-sol, 1 = 1er..."
                className="border-[#CECECE] focus:border-[#000091] focus:ring-1 focus:ring-[#000091]"
              />
            </div>
            <div>
              <Label className="text-xs text-[#666] mb-1 block">
                Complement d&apos;acces{" "}
                <span className="text-[#929292]">(facultatif)</span>
              </Label>
              <Input
                value={data.accComplt || ""}
                onChange={(e) => onChange("accComplt", e.target.value)}
                placeholder="Au bout du couloir gauche..."
                className="border-[#CECECE] focus:border-[#000091] focus:ring-1 focus:ring-[#000091]"
              />
            </div>
          </div>

          {/* Jours */}
          <DispJourSelector
            value={Array.isArray(data.dispJ) ? data.dispJ : []}
            onChange={(v) => onChange("dispJ", v)}
          />

          {/* Heures */}
          <DispHeureSelector
            value={Array.isArray(data.dispH) ? data.dispH : []}
            onChange={(v) => onChange("dispH", v)}
          />
        </div>
      </div>

      {/* ── Section 3 : Details techniques ── */}
      <div className="border-t border-[#E5E5E5] pt-4">
        <h4 className="text-sm font-semibold text-[#000091] mb-3">
          Details techniques
          <span className="text-xs font-normal text-[#929292] ml-1">
            — Optionnel
          </span>
        </h4>

        <div className="space-y-3">
          {/* Date derniere maintenance + Date d'installation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-[#666] mb-1 block">
                Date derniere maintenance
              </Label>
              <Input
                type="date"
                value={data.dermnt || ""}
                onChange={(e) => onChange("dermnt", e.target.value)}
                className="border-[#CECECE] focus:border-[#000091] focus:ring-1 focus:ring-[#000091]"
              />
            </div>
            <div>
              <Label className="text-xs text-[#666] mb-1 block">
                Date d&apos;installation
              </Label>
              <Input
                type="date"
                value={data.dateInstal || ""}
                onChange={(e) => onChange("dateInstal", e.target.value)}
                className="border-[#CECECE] focus:border-[#000091] focus:ring-1 focus:ring-[#000091]"
              />
            </div>
          </div>

          {/* Electrodes pediatriques + Surveillance a distance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <OuiNonSwitch
              label="Electrodes pediatriques"
              value={data.lcPed || ""}
              onChange={(v) => onChange("lcPed", v)}
            />
            <OuiNonSwitch
              label="Surveillance a distance"
              value={data.dispSurv || ""}
              onChange={(v) => onChange("dispSurv", v)}
            />
          </div>

          {/* Date peremption electrodes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-[#666] mb-1 block">
                Date de péremption des électrodes adultes
              </Label>
              <Input
                type="date"
                value={data.dtprLcad || ""}
                onChange={(e) => onChange("dtprLcad", e.target.value)}
                className="border-[#CECECE] focus:border-[#000091] focus:ring-1 focus:ring-[#000091]"
              />
            </div>
            <div>
              <Label className="text-xs text-[#666] mb-1 block">
                Date de péremption des électrodes pédiatriques
              </Label>
              <Input
                type="date"
                value={data.dtprLcped || ""}
                onChange={(e) => onChange("dtprLcped", e.target.value)}
                className="border-[#CECECE] focus:border-[#000091] focus:ring-1 focus:ring-[#000091]"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
