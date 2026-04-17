"use client";

import { useState, useCallback, useRef } from "react";
import { apiFetch } from "@/lib/api";
import type { DeclarationFormState, DaeDeviceFormState } from "@/lib/declaration-types";
import { serializeDevice, createEmptyDevice } from "@/lib/declaration-types";
import { toast } from "sonner";

const PARENT_FIELDS_EXCLUDE = new Set(["daeDevices", "exptComplement"]);

export function useDeclarationEdit(declarationId: string, initialData: DeclarationFormState) {
  const [formData, setFormData] = useState<DeclarationFormState>(initialData);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Device ID map: localId -> serverId
  const [deviceIds, setDeviceIds] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    initialData.daeDevices.forEach((d) => {
      if (d.id) map[d.localId] = d.id;
    });
    return map;
  });
  const deviceIdsRef = useRef(deviceIds);
  deviceIdsRef.current = deviceIds;

  // Debounce timers
  const saveTimerParent = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveTimerDevices = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const pendingSaves = useRef(0);

  const updateSavingState = (delta: number) => {
    pendingSaves.current += delta;
    if (delta > 0) setSaving(true);
    if (pendingSaves.current <= 0) {
      pendingSaves.current = 0;
      setSaving(false);
      setLastSaved(new Date());
    }
  };

  // ─── Auto-save parent fields ────────────────────────────
  const saveParent = useCallback(
    (data: DeclarationFormState) => {
      if (saveTimerParent.current) clearTimeout(saveTimerParent.current);

      saveTimerParent.current = setTimeout(async () => {
        const payload: Record<string, any> = {};
        for (const [k, v] of Object.entries(data)) {
          if (PARENT_FIELDS_EXCLUDE.has(k)) continue;
          if (v !== "" && v !== null) payload[k] = v;
        }

        updateSavingState(1);
        try {
          const res = await apiFetch(`/api/declarations/my/${declarationId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            toast.error(err.message || "Erreur lors de l'enregistrement");
          }
        } catch {
          // silent network error
        }
        updateSavingState(-1);
      }, 1000);
    },
    [declarationId],
  );

  // ─── Auto-save device fields ────────────────────────────
  const saveDevice = useCallback(
    (device: DaeDeviceFormState, serverId: string | undefined) => {
      const key = device.localId;
      if (saveTimerDevices.current[key]) {
        clearTimeout(saveTimerDevices.current[key]);
      }

      if (!serverId) return;

      saveTimerDevices.current[key] = setTimeout(async () => {
        const payload = serializeDevice(device);

        updateSavingState(1);
        try {
          const res = await apiFetch(
            `/api/declarations/my/${declarationId}/devices/${serverId}`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            },
          );
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            toast.error(err.message || "Erreur lors de l'enregistrement du DAE");
          }
        } catch {
          // silent
        }
        updateSavingState(-1);
      }, 1000);
    },
    [declarationId],
  );

  // ─── Field change handlers ──────────────────────────────
  const handleFieldChange = useCallback(
    (field: string, value: any) => {
      setFormData((prev) => {
        const next = { ...prev, [field]: value };
        saveParent(next);
        return next;
      });
    },
    [saveParent],
  );

  const handleBatchChange = useCallback(
    (fields: Record<string, any>) => {
      setFormData((prev) => {
        const next = { ...prev, ...fields };
        saveParent(next);
        return next;
      });
    },
    [saveParent],
  );

  const handleDeviceChange = useCallback(
    (localId: string, field: string, value: any) => {
      setFormData((prev) => {
        const devices = prev.daeDevices.map((d) =>
          d.localId === localId ? { ...d, [field]: value } : d,
        );
        const updated = devices.find((d) => d.localId === localId);
        if (updated) {
          saveDevice(updated, deviceIdsRef.current[localId]);
        }
        return { ...prev, daeDevices: devices };
      });
    },
    [saveDevice],
  );

  const handleAddDevice = useCallback(async (): Promise<string> => {
    const newDevice = createEmptyDevice(formData.daeDevices.length);
    setFormData((prev) => ({
      ...prev,
      daeDevices: [...prev.daeDevices, newDevice],
    }));

    try {
      const res = await apiFetch(
        `/api/declarations/my/${declarationId}/devices`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(serializeDevice(newDevice)),
        },
      );
      if (res.ok) {
        const result = await res.json();
        setDeviceIds((prev) => ({ ...prev, [newDevice.localId]: result.id }));
      }
    } catch {
      toast.error("Erreur lors de l'ajout du DAE");
    }

    return newDevice.localId;
  }, [declarationId, formData.daeDevices.length]);

  const handleRemoveDevice = useCallback(
    async (localId: string) => {
      const serverId = deviceIdsRef.current[localId];
      if (!serverId) return;

      setFormData((prev) => ({
        ...prev,
        daeDevices: prev.daeDevices.filter((d) => d.localId !== localId),
      }));

      try {
        const res = await apiFetch(
          `/api/declarations/my/${declarationId}/devices/${serverId}`,
          { method: "DELETE" },
        );
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          toast.error(err.message || "Erreur lors de la suppression");
        }
      } catch {
        toast.error("Erreur lors de la suppression du DAE");
      }

      setDeviceIds((prev) => {
        const next = { ...prev };
        delete next[localId];
        return next;
      });
    },
    [declarationId],
  );

  // ─���─ Flush pending saves ────────────────────────────────
  const flushPendingSaves = useCallback(() => {
    if (saveTimerParent.current) {
      clearTimeout(saveTimerParent.current);
      saveTimerParent.current = null;
    }
    for (const key of Object.keys(saveTimerDevices.current)) {
      clearTimeout(saveTimerDevices.current[key]);
      delete saveTimerDevices.current[key];
    }
  }, []);

  return {
    formData,
    saving,
    lastSaved,
    handleFieldChange,
    handleBatchChange,
    handleDeviceChange,
    handleAddDevice,
    handleRemoveDevice,
    flushPendingSaves,
  };
}
