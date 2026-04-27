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
import { ACC_OPTIONS } from "@/lib/declaration-types";
import { DAE_MANUFACTURERS, OTHER_VALUE } from "@/data/dae-manufacturers";
import { useDaeDeviceForm } from "@/hooks/useDaeDeviceForm";
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
  const fabRais = data.fabRais || "";
  const modele = data.modele || "";

  const {
    fabAutre, isKnownFab, modelsForSelected, modelAutre,
    selectFabValue, selectModelValue,
    onFabChange, onModelChange,
    hadMaintenance, onMaintenanceToggle,
  } = useDaeDeviceForm({
    fabRais,
    modele,
    dermnt: data.dermnt || "",
    dateInstal: data.dateInstal || "",
    hadMaintenance: data.hadMaintenance || "",
    set: onChange,
  });

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
            <Label htmlFor="admin-dev-nom" className="text-xs text-[#666] mb-1 block">
              Nom du DAE <span className="text-[#E1000F]">*</span>
            </Label>
            <Input
              id="admin-dev-nom"
              aria-required="true"
              value={data.nom || ""}
              onChange={(e) => onChange("nom", e.target.value)}
              placeholder="DAE-Accueil-RDC"
              className="border-[#CECECE] focus:border-[#000091] focus:ring-1 focus:ring-[#000091]"
            />
          </div>

          {/* Fabricant + Modele */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="admin-dev-fab" className="text-xs text-[#666] mb-1 block">
                Fabricant <span className="text-[#E1000F]">*</span>
              </Label>
              <Select
                value={selectFabValue}
                onValueChange={onFabChange}
              >
                <SelectTrigger id="admin-dev-fab" aria-required="true" className="border-[#CECECE] focus:border-[#000091] focus:ring-1 focus:ring-[#000091]">
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
              <Label htmlFor="admin-dev-modele" className="text-xs text-[#666] mb-1 block">
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
                    onValueChange={onModelChange}
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

          {/* N° de serie + Etat fonctionnel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="admin-dev-numSerie" className="text-xs text-[#666] mb-1 block">
                N° de serie <span className="text-[#E1000F]">*</span>
              </Label>
              <Input
                id="admin-dev-numSerie"
                aria-required="true"
                value={data.numSerie || ""}
                onChange={(e) => onChange("numSerie", e.target.value)}
                placeholder="X09E409930"
                className="border-[#CECECE] focus:border-[#000091] focus:ring-1 focus:ring-[#000091]"
              />
            </div>
            <EtatFonctSelect
              value={data.etatFonct || ""}
              onChange={(v) => onChange("etatFonct", v)}
            />
          </div>

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
              <Label htmlFor="admin-dev-acc" className="text-xs text-[#666] mb-1 block">
                Environnement <span className="text-[#E1000F]">*</span>
              </Label>
              <Select
                value={data.acc || ""}
                onValueChange={(v) => onChange("acc", v)}
              >
                <SelectTrigger id="admin-dev-acc" aria-required="true" className="border-[#CECECE] focus:border-[#000091] focus:ring-1 focus:ring-[#000091]">
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
              <Label htmlFor="admin-dev-accEtg" className="text-xs text-[#666] mb-1 block">
                Etage{" "}
                <span className="text-[#929292]">(facultatif)</span>
              </Label>
              <Input
                id="admin-dev-accEtg"
                value={data.accEtg || ""}
                onChange={(e) => onChange("accEtg", e.target.value)}
                placeholder="0 = RDC, -1 = sous-sol, 1 = 1er..."
                className="border-[#CECECE] focus:border-[#000091] focus:ring-1 focus:ring-[#000091]"
              />
            </div>
            <div>
              <Label htmlFor="admin-dev-accComplt" className="text-xs text-[#666] mb-1 block">
                Complement d&apos;acces{" "}
                <span className="text-[#929292]">(facultatif)</span>
              </Label>
              <Input
                id="admin-dev-accComplt"
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
            onChange={onMaintenanceToggle}
            required
          />

          {hadMaintenance === "OUI" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="admin-dev-dermnt" className="text-xs text-[#666] mb-1 block">
                  Date dernière maintenance{" "}
                  <span className="text-[#E1000F]">*</span>
                </Label>
                <Input
                  id="admin-dev-dermnt"
                  aria-required="true"
                  type="date"
                  value={data.dermnt || ""}
                  onChange={(e) => onChange("dermnt", e.target.value)}
                  className="border-[#CECECE] focus:border-[#000091] focus:ring-1 focus:ring-[#000091]"
                />
              </div>
              <div>
                <Label htmlFor="admin-dev-dateInstal-opt" className="text-xs text-[#666] mb-1 block">
                  Date d&apos;installation{" "}
                  <span className="text-[#929292]">(facultatif)</span>
                </Label>
                <Input
                  id="admin-dev-dateInstal-opt"
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
              <Label htmlFor="admin-dev-dateInstal" className="text-xs text-[#666] mb-1 block">
                Date d&apos;installation{" "}
                <span className="text-[#E1000F]">*</span>
              </Label>
              <Input
                id="admin-dev-dateInstal"
                aria-required="true"
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
              <Label htmlFor="admin-dev-dtprLcad" className="text-xs text-[#666] mb-1 block">
                Date de péremption des électrodes adultes
              </Label>
              <Input
                id="admin-dev-dtprLcad"
                type="date"
                value={data.dtprLcad || ""}
                onChange={(e) => onChange("dtprLcad", e.target.value)}
                className="border-[#CECECE] focus:border-[#000091] focus:ring-1 focus:ring-[#000091]"
              />
            </div>
            <div>
              <Label htmlFor="admin-dev-dtprLcped" className="text-xs text-[#666] mb-1 block">
                Date de péremption des électrodes pédiatriques
              </Label>
              <Input
                id="admin-dev-dtprLcped"
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
