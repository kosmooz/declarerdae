"use client";

import { useState } from "react";
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
import {
  DAE_MANUFACTURERS,
  OTHER_VALUE,
  getModelsForManufacturer,
} from "@/data/dae-manufacturers";
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
  // Maintenance mode: derive from existing data
  const dermnt = data.dermnt || "";
  const dateInstal = data.dateInstal || "";
  const [hadMaintenance, setHadMaintenance] = useState(() => {
    if (dermnt && dateInstal && dermnt === dateInstal) return "NON";
    if (dermnt) return "OUI";
    return "";
  });

  const fabRais = data.fabRais || "";
  const modele = data.modele || "";

  // Track "Autre" mode locally
  const knownFabNames = DAE_MANUFACTURERS.map((m) => m.name);
  const [fabAutre, setFabAutre] = useState(
    () => fabRais !== "" && !knownFabNames.includes(fabRais),
  );
  const isKnownFab = !fabAutre && knownFabNames.includes(fabRais);
  const modelsForSelected = isKnownFab
    ? getModelsForManufacturer(fabRais)
    : [];

  const [modelAutre, setModelAutre] = useState(() => {
    if (!knownFabNames.includes(fabRais)) return false;
    const models = getModelsForManufacturer(fabRais);
    return modele !== "" && !models.some((m) => m.name === modele);
  });

  const selectFabValue = fabAutre
    ? OTHER_VALUE
    : isKnownFab
      ? fabRais
      : "";
  const selectModelValue = modelAutre
    ? OTHER_VALUE
    : modelsForSelected.some((m) => m.name === modele)
      ? modele
      : "";

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
              <Select
                value={selectFabValue}
                onValueChange={(v) => {
                  if (v === OTHER_VALUE) {
                    setFabAutre(true);
                    setModelAutre(false);
                    onChange("fabRais", "");
                    onChange("modele", "");
                  } else {
                    setFabAutre(false);
                    setModelAutre(false);
                    onChange("fabRais", v);
                    onChange("modele", "");
                  }
                }}
              >
                <SelectTrigger className="border-[#CECECE] focus:border-[#000091] focus:ring-1 focus:ring-[#000091]">
                  <SelectValue placeholder="Choisir un fabricant" />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={4}>
                  {DAE_MANUFACTURERS.map((m) => (
                    <SelectItem key={m.name} value={m.name}>
                      {m.name}
                    </SelectItem>
                  ))}
                  <SelectItem value={OTHER_VALUE}>Autre</SelectItem>
                </SelectContent>
              </Select>
              {fabAutre && (
                <Input
                  value={fabRais}
                  onChange={(e) => onChange("fabRais", e.target.value)}
                  placeholder="Nom du fabricant"
                  className="mt-1.5 border-[#CECECE] focus:border-[#000091] focus:ring-1 focus:ring-[#000091]"
                  autoFocus
                />
              )}
            </div>
            <div>
              <Label className="text-xs text-[#666] mb-1 block">
                Modèle <span className="text-[#E1000F]">*</span>
              </Label>
              {fabAutre ? (
                <Input
                  value={modele}
                  onChange={(e) => onChange("modele", e.target.value)}
                  placeholder="Nom du modèle"
                  className="border-[#CECECE] focus:border-[#000091] focus:ring-1 focus:ring-[#000091]"
                />
              ) : isKnownFab ? (
                <>
                  <Select
                    value={selectModelValue}
                    onValueChange={(v) => {
                      if (v === OTHER_VALUE) {
                        setModelAutre(true);
                        onChange("modele", "");
                      } else {
                        setModelAutre(false);
                        onChange("modele", v);
                      }
                    }}
                  >
                    <SelectTrigger className="border-[#CECECE] focus:border-[#000091] focus:ring-1 focus:ring-[#000091]">
                      <SelectValue placeholder="Choisir un modèle" />
                    </SelectTrigger>
                    <SelectContent position="popper" sideOffset={4}>
                      {modelsForSelected.map((m) => (
                        <SelectItem key={m.name} value={m.name}>
                          {m.name}
                        </SelectItem>
                      ))}
                      <SelectItem value={OTHER_VALUE}>Autre</SelectItem>
                    </SelectContent>
                  </Select>
                  {modelAutre && (
                    <Input
                      value={modele}
                      onChange={(e) => onChange("modele", e.target.value)}
                      placeholder="Nom du modèle"
                      className="mt-1.5 border-[#CECECE] focus:border-[#000091] focus:ring-1 focus:ring-[#000091]"
                      autoFocus
                    />
                  )}
                </>
              ) : (
                <Input
                  value=""
                  disabled
                  placeholder="Choisir d'abord un fabricant"
                  className="border-[#CECECE] disabled:opacity-50"
                />
              )}
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
                <SelectContent position="popper" sideOffset={4}>
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
                <SelectContent position="popper" sideOffset={4}>
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
          {/* Maintenance */}
          <OuiNonSwitch
            label="Le DAE a-t-il déjà subi une maintenance ?"
            value={hadMaintenance}
            onChange={(v) => {
              setHadMaintenance(v);
              if (v === "NON") {
                onChange("dermnt", data.dateInstal || "");
              } else {
                if ((data.dermnt || "") === (data.dateInstal || "")) onChange("dermnt", "");
              }
            }}
            required
          />

          {hadMaintenance === "OUI" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-[#666] mb-1 block">
                  Date dernière maintenance{" "}
                  <span className="text-[#E1000F]">*</span>
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
                  Date d&apos;installation{" "}
                  <span className="text-[#929292]">(facultatif)</span>
                </Label>
                <Input
                  type="date"
                  value={data.dateInstal || ""}
                  onChange={(e) => onChange("dateInstal", e.target.value)}
                  className="border-[#CECECE] focus:border-[#000091] focus:ring-1 focus:ring-[#000091]"
                />
              </div>
            </div>
          )}

          {hadMaintenance === "NON" && (
            <div className="max-w-xs">
              <Label className="text-xs text-[#666] mb-1 block">
                Date d&apos;installation{" "}
                <span className="text-[#E1000F]">*</span>
              </Label>
              <Input
                type="date"
                value={data.dateInstal || ""}
                onChange={(e) => {
                  onChange("dateInstal", e.target.value);
                  onChange("dermnt", e.target.value);
                }}
                className="border-[#CECECE] focus:border-[#000091] focus:ring-1 focus:ring-[#000091]"
              />
            </div>
          )}

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
