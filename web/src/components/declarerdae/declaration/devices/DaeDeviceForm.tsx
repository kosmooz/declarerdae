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
import type { DaeDeviceFormState } from "@/lib/declaration-types";
import { ACC_OPTIONS, TYPE_DAE_OPTIONS } from "@/lib/declaration-types";
import OuiNonSwitch from "../shared/OuiNonSwitch";
import EtatFonctSelect from "../shared/EtatFonctSelect";
import DispJourSelector from "../shared/DispJourSelector";
import DispHeureSelector from "../shared/DispHeureSelector";
import PhotoUpload from "../shared/PhotoUpload";
import DaeMarkerMap from "../shared/DaeMarkerMap";

interface DaeDeviceFormProps {
  device: DaeDeviceFormState;
  index: number;
  siteLat: number | null;
  siteLng: number | null;
  onChange: (localId: string, field: string, value: any) => void;
}

export default function DaeDeviceForm({
  device,
  index,
  siteLat,
  siteLng,
  onChange,
}: DaeDeviceFormProps) {
  const set = (field: string, value: any) =>
    onChange(device.localId, field, value);

  return (
    <div className="space-y-5">
      {/* ── Identification ── */}
      <div>
        <h4 className="text-sm font-semibold text-[#000091] mb-3 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-[#000091] text-white text-xs flex items-center justify-center">
            1
          </span>
          Identification et Localisation
        </h4>

        <div className="space-y-3">
          <div>
            <Label className="text-xs text-[#666] mb-1 block">
              Nom donné au DAE <span className="text-[#E1000F]">*</span>
            </Label>
            <Input
              value={device.nom}
              onChange={(e) => set("nom", e.target.value)}
              placeholder={`DAE-${index + 1}-MonSite`}
              className="border-[#CECECE] focus:border-[#000091] focus:ring-1 focus:ring-[#000091]"
            />
            <p className="text-[10px] text-[#929292] mt-0.5">
              Nom libre pour identifier ce défibrillateur (ex:
              DAE-Accueil-RDC)
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-[#666] mb-1 block">
                Fabricant <span className="text-[#E1000F]">*</span>
              </Label>
              <Input
                value={device.fabRais}
                onChange={(e) => set("fabRais", e.target.value)}
                placeholder="Zoll, Philips, Schiller..."
                className="border-[#CECECE] focus:border-[#000091] focus:ring-1 focus:ring-[#000091]"
              />
            </div>
            <div>
              <Label className="text-xs text-[#666] mb-1 block">
                Modèle <span className="text-[#E1000F]">*</span>
              </Label>
              <Input
                value={device.modele}
                onChange={(e) => set("modele", e.target.value)}
                placeholder="AED 3, HS1, CR+..."
                className="border-[#CECECE] focus:border-[#000091] focus:ring-1 focus:ring-[#000091]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-[#666] mb-1 block">
                N° de série <span className="text-[#E1000F]">*</span>
              </Label>
              <Input
                value={device.numSerie}
                onChange={(e) => set("numSerie", e.target.value)}
                placeholder="X09E409930"
                className="border-[#CECECE] focus:border-[#000091] focus:ring-1 focus:ring-[#000091]"
              />
            </div>
            <div>
              <Label className="text-xs text-[#666] mb-1 block">
                Type de DAE
              </Label>
              <Select
                value={device.typeDAE}
                onValueChange={(v) => set("typeDAE", v)}
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

          <EtatFonctSelect
            value={device.etatFonct}
            onChange={(v) => set("etatFonct", v)}
          />

          <DaeMarkerMap
            lat={device.daeLat}
            lng={device.daeLng}
            siteLat={siteLat}
            siteLng={siteLng}
            onPositionChange={(newLat, newLng) => {
              set("daeLat", newLat);
              set("daeLng", newLng);
            }}
          />
        </div>
      </div>

      {/* ── Accès & Disponibilité ── */}
      <div className="border-t border-[#E5E5E5] pt-4">
        <h4 className="text-sm font-semibold text-[#000091] mb-3 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-[#000091] text-white text-xs flex items-center justify-center">
            2
          </span>
          Accès & Disponibilité
        </h4>

        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs text-[#666] mb-1 block">
                Environnement <span className="text-[#E1000F]">*</span>
              </Label>
              <Select
                value={device.acc}
                onValueChange={(v) => set("acc", v)}
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
              label="Accès libre"
              value={device.accLib}
              onChange={(v) => set("accLib", v)}
              required
            />
            <OuiNonSwitch
              label="DAE itinérant"
              value={device.daeMobile}
              onChange={(v) => set("daeMobile", v)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-[#666] mb-1 block">
                Étage{" "}
                <span className="text-[#929292]">(facultatif)</span>
              </Label>
              <Input
                value={device.accEtg}
                onChange={(e) => set("accEtg", e.target.value)}
                placeholder="0 = RDC, -1 = sous-sol, 1 = 1er..."
                className="border-[#CECECE] focus:border-[#000091] focus:ring-1 focus:ring-[#000091]"
              />
            </div>
            <div>
              <Label className="text-xs text-[#666] mb-1 block">
                Complément d'accès{" "}
                <span className="text-[#929292]">(facultatif)</span>
              </Label>
              <Input
                value={device.accComplt}
                onChange={(e) => set("accComplt", e.target.value)}
                placeholder="Au bout du couloir gauche..."
                className="border-[#CECECE] focus:border-[#000091] focus:ring-1 focus:ring-[#000091]"
              />
            </div>
          </div>

          <DispJourSelector
            value={device.dispJ}
            onChange={(v) => set("dispJ", v)}
          />
          <DispHeureSelector
            value={device.dispH}
            onChange={(v) => set("dispH", v)}
          />
        </div>
      </div>

      {/* ── Détails techniques (facultatif) ── */}
      <details className="border-t border-[#E5E5E5] pt-4 group">
        <summary className="text-sm font-semibold text-[#000091] cursor-pointer flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-[#E5E5E5] text-[#666] text-xs flex items-center justify-center group-open:bg-[#000091] group-open:text-white transition-colors">
            3
          </span>
          Détails techniques
          <span className="text-xs font-normal text-[#929292] ml-1">
            — Optionnel
          </span>
        </summary>

        <div className="mt-3 space-y-3">
          {/* Maintenance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-[#666] mb-1 block">
                Date dernière maintenance
              </Label>
              <Input
                type="date"
                value={device.dermnt}
                onChange={(e) => set("dermnt", e.target.value)}
                className="border-[#CECECE] focus:border-[#000091] focus:ring-1 focus:ring-[#000091]"
              />
            </div>
            <div>
              <Label className="text-xs text-[#666] mb-1 block">
                Date d'installation
              </Label>
              <Input
                type="date"
                value={device.dateInstal}
                onChange={(e) => set("dateInstal", e.target.value)}
                className="border-[#CECECE] focus:border-[#000091] focus:ring-1 focus:ring-[#000091]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-[#666] mb-1 block">
                Mainteneur
              </Label>
              <Input
                value={device.mntRais}
                onChange={(e) => set("mntRais", e.target.value)}
                placeholder="Raison sociale du mainteneur"
                className="border-[#CECECE] focus:border-[#000091] focus:ring-1 focus:ring-[#000091]"
              />
            </div>
            <div>
              <Label className="text-xs text-[#666] mb-1 block">
                Fréquence maintenance
              </Label>
              <Input
                value={device.freqMnt}
                onChange={(e) => set("freqMnt", e.target.value)}
                placeholder="2 fois par an"
                className="border-[#CECECE] focus:border-[#000091] focus:ring-1 focus:ring-[#000091]"
              />
            </div>
          </div>

          {/* Électrodes & batterie */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <OuiNonSwitch
              label="Électrodes pédiatriques"
              value={device.lcPed}
              onChange={(v) => set("lcPed", v)}
            />
            <OuiNonSwitch
              label="Surveillance à distance"
              value={device.dispSurv}
              onChange={(v) => set("dispSurv", v)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs text-[#666] mb-1 block">
                Pér. électrodes adultes
              </Label>
              <Input
                type="date"
                value={device.dtprLcad}
                onChange={(e) => set("dtprLcad", e.target.value)}
                className="border-[#CECECE] focus:border-[#000091] focus:ring-1 focus:ring-[#000091]"
              />
            </div>
            <div>
              <Label className="text-xs text-[#666] mb-1 block">
                Pér. électrodes pédia.
              </Label>
              <Input
                type="date"
                value={device.dtprLcped}
                onChange={(e) => set("dtprLcped", e.target.value)}
                className="border-[#CECECE] focus:border-[#000091] focus:ring-1 focus:ring-[#000091]"
              />
            </div>
            <div>
              <Label className="text-xs text-[#666] mb-1 block">
                Pér. batterie
              </Label>
              <Input
                type="date"
                value={device.dtprBat}
                onChange={(e) => set("dtprBat", e.target.value)}
                className="border-[#CECECE] focus:border-[#000091] focus:ring-1 focus:ring-[#000091]"
              />
            </div>
          </div>

          {/* SIREN fabricant / mainteneur / IUD */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs text-[#666] mb-1 block">
                SIREN fabricant
              </Label>
              <Input
                value={device.fabSiren}
                onChange={(e) => set("fabSiren", e.target.value)}
                maxLength={9}
                className="border-[#CECECE] focus:border-[#000091] focus:ring-1 focus:ring-[#000091]"
              />
            </div>
            <div>
              <Label className="text-xs text-[#666] mb-1 block">
                SIREN mainteneur
              </Label>
              <Input
                value={device.mntSiren}
                onChange={(e) => set("mntSiren", e.target.value)}
                maxLength={9}
                className="border-[#CECECE] focus:border-[#000091] focus:ring-1 focus:ring-[#000091]"
              />
            </div>
            <div>
              <Label className="text-xs text-[#666] mb-1 block">
                IUD européen
              </Label>
              <Input
                value={device.idEuro}
                onChange={(e) => set("idEuro", e.target.value)}
                className="border-[#CECECE] focus:border-[#000091] focus:ring-1 focus:ring-[#000091]"
              />
            </div>
          </div>

          {/* Photos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <PhotoUpload
              label="Photo 1 (plan large)"
              value={device.photo1}
              onChange={(v) => set("photo1", v)}
            />
            <PhotoUpload
              label="Photo 2 (détail)"
              value={device.photo2}
              onChange={(v) => set("photo2", v)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <OuiNonSwitch
              label="Poste de sécurité"
              value={device.accPcsec}
              onChange={(v) => set("accPcsec", v)}
            />
            <OuiNonSwitch
              label="Accueil public"
              value={device.accAcc}
              onChange={(v) => set("accAcc", v)}
            />
          </div>
        </div>
      </details>
    </div>
  );
}
