"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DaeDeviceFormState } from "@/lib/declaration-types";
import DaeDeviceCard from "../devices/DaeDeviceCard";
import DaeDeviceForm from "../devices/DaeDeviceForm";

interface Step3Props {
  devices: DaeDeviceFormState[];
  siteLat: number | null;
  siteLng: number | null;
  onDeviceChange: (localId: string, field: string, value: any) => void;
  onAddDevice: () => Promise<string>;
  onRemoveDevice: (localId: string) => void;
}

export default function Step3Defibrillateurs({
  devices,
  siteLat,
  siteLng,
  onDeviceChange,
  onAddDevice,
  onRemoveDevice,
}: Step3Props) {
  const [openDeviceId, setOpenDeviceId] = useState<string | null>(
    devices[0]?.localId || null,
  );

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-heading font-semibold text-lg text-[#161616] mb-1">
          Défibrillateur(s)
        </h3>
        <p className="text-sm text-[#666]">
          Renseignez les informations de chaque défibrillateur. Vous pouvez
          déclarer plusieurs DAE en une seule demande.
        </p>
      </div>

      {/* Device list */}
      <div className="space-y-3">
        {devices.map((device, i) => (
          <div key={device.localId}>
            <DaeDeviceCard
              device={device}
              index={i}
              isOpen={openDeviceId === device.localId}
              canDelete={devices.length > 1}
              onToggle={() =>
                setOpenDeviceId(
                  openDeviceId === device.localId ? null : device.localId,
                )
              }
              onDelete={() => onRemoveDevice(device.localId)}
            />

            {openDeviceId === device.localId && (
              <div className="border border-t-0 border-[#CECECE] rounded-b-sm p-4 bg-[#FAFAFA]">
                <DaeDeviceForm
                  device={device}
                  index={i}
                  siteLat={siteLat}
                  siteLng={siteLng}
                  onChange={onDeviceChange}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add device button */}
      <Button
        type="button"
        variant="outline"
        onClick={async () => {
          const newId = await onAddDevice();
          setOpenDeviceId(newId);
        }}
        className="w-full border-dashed border-[#000091] text-[#000091] hover:bg-[#000091]/5"
      >
        <Plus className="w-4 h-4 mr-2" />
        Ajouter un défibrillateur
      </Button>

      {devices.length > 1 && (
        <p className="text-xs text-[#929292] text-center">
          {devices.length} défibrillateurs déclarés
        </p>
      )}
    </div>
  );
}
