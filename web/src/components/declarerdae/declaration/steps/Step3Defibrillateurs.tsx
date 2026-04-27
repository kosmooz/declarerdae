"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
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
  onDeleteSyncedDevice?: (localId: string) => void;
  deletedDeviceIds?: Set<string>;
  syncedDeviceIds?: Set<string>;
  initialOpenDeviceId?: string | null;
}

export default function Step3Defibrillateurs({
  devices,
  siteLat,
  siteLng,
  onDeviceChange,
  onAddDevice,
  onRemoveDevice,
  onDeleteSyncedDevice,
  deletedDeviceIds,
  syncedDeviceIds,
  initialOpenDeviceId,
}: Step3Props) {
  const [openDeviceId, setOpenDeviceId] = useState<string | null>(
    initialOpenDeviceId !== undefined ? initialOpenDeviceId : (devices[0]?.localId || null),
  );
  const [scrollToDeviceId, setScrollToDeviceId] = useState<string | null>(null);
  const deviceRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Scroll to newly added device once it renders
  useEffect(() => {
    if (scrollToDeviceId && deviceRefs.current[scrollToDeviceId]) {
      deviceRefs.current[scrollToDeviceId]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      setScrollToDeviceId(null);
    }
  }, [scrollToDeviceId, devices]);

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

      {/* Device list — active first, deleted last */}
      <div className="space-y-3">
        {[...devices]
          .sort((a, b) => {
            const aDeleted = deletedDeviceIds?.has(a.localId) ? 1 : 0;
            const bDeleted = deletedDeviceIds?.has(b.localId) ? 1 : 0;
            return aDeleted - bDeleted;
          })
          .map((device, i) => {
            const isDeletedDevice = deletedDeviceIds?.has(device.localId) ?? false;
            const isSyncedDevice = syncedDeviceIds?.has(device.localId) ?? false;
            return (
              <div
                key={device.localId}
                ref={(el) => { deviceRefs.current[device.localId] = el; }}
                className={`scroll-mt-4 ${isDeletedDevice ? "opacity-50" : ""}`}
              >
                {isDeletedDevice ? (
                  <div className="border border-[#E5E5E5] rounded-sm bg-[#F6F6F6] px-4 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#E5E5E5] flex items-center justify-center shrink-0">
                      <Trash2 className="w-4 h-4 text-[#929292]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-semibold text-[#929292] line-through truncate">
                        {device.nom?.trim() || `DAE ${i + 1}`}
                      </span>
                      <p className="text-xs text-[#929292]">Supprimé de GéoDAE</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <DaeDeviceCard
                      device={device}
                      index={i}
                      isOpen={openDeviceId === device.localId}
                      canDelete={devices.filter((d) => !deletedDeviceIds?.has(d.localId)).length > 1}
                      syncedToGeodae={isSyncedDevice}
                      onToggle={() =>
                        setOpenDeviceId(
                          openDeviceId === device.localId ? null : device.localId,
                        )
                      }
                      onDelete={() =>
                        isSyncedDevice && onDeleteSyncedDevice
                          ? onDeleteSyncedDevice(device.localId)
                          : onRemoveDevice(device.localId)
                      }
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
                  </>
                )}
              </div>
            );
          })}
      </div>

      {/* Add device button */}
      <Button
        type="button"
        variant="outline"
        onClick={async () => {
          const newId = await onAddDevice();
          setOpenDeviceId(newId);
          setScrollToDeviceId(newId);
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
