"use client";

import { useState, useCallback, useRef } from "react";
import { apiFetch } from "@/lib/api";
import type { DeclarationFormState, DaeDeviceFormState } from "@/lib/declaration-types";
import { serializeDevice, createEmptyDevice } from "@/lib/declaration-types";
import { toast } from "sonner";

const PARENT_FIELDS_EXCLUDE = new Set(["daeDevices", "exptComplement"]);

/* ─── Validation per step ──────────────────────────────────── */

export interface StepErrors {
  [field: string]: string;
}

export function validateStep(step: number, data: DeclarationFormState): StepErrors {
  const errors: StepErrors = {};

  if (step === 1) {
    if (!data.exptRais?.trim()) errors.exptRais = "Raison sociale obligatoire";
    if (!data.exptSiren?.trim()) errors.exptSiren = "SIREN obligatoire";
    if (!data.exptEmail?.trim()) errors.exptEmail = "Email exploitant obligatoire";
    if (!data.exptTel1?.trim()) errors.exptTel1 = "Téléphone exploitant obligatoire";
  }

  if (step === 2) {
    if (!data.adrVoie?.trim()) errors.adrVoie = "Adresse du site obligatoire";
    if (!data.codePostal?.trim()) errors.codePostal = "Code postal obligatoire";
    if (!data.ville?.trim()) errors.ville = "Ville obligatoire";
    if (!data.tel1?.trim()) errors.tel1 = "Téléphone sur site obligatoire";
  }

  if (step === 3) {
    if (data.daeDevices.length === 0) {
      errors._devices = "Au moins un défibrillateur est requis";
    } else {
      const hasComplete = data.daeDevices.some(
        (d) =>
          d.nom?.trim() &&
          d.fabRais?.trim() &&
          d.modele?.trim() &&
          d.numSerie?.trim() &&
          d.etatFonct?.trim() &&
          d.acc?.trim() &&
          d.accLib?.trim() &&
          d.daeMobile?.trim() &&
          d.dispJ?.length > 0 &&
          d.dispH?.length > 0,
      );
      if (!hasComplete) {
        errors._devices =
          "Au moins 1 DAE doit avoir tous les champs obligatoires remplis (nom, fabricant, modèle, N° série, état, accès, disponibilité)";
      }
    }
  }

  return errors;
}

/* ─── Hook ─────────────────────────────────────────────────── */

export function useDeclarationEdit(declarationId: string, initialData: DeclarationFormState) {
  const [formData, setFormData] = useState<DeclarationFormState>(initialData);
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);

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

  // ─── Local-only field change handlers ──────────────────────
  const handleFieldChange = useCallback((field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  }, []);

  const handleBatchChange = useCallback((fields: Record<string, any>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
    setIsDirty(true);
  }, []);

  const handleDeviceChange = useCallback((localId: string, field: string, value: any) => {
    setFormData((prev) => {
      const devices = prev.daeDevices.map((d) =>
        d.localId === localId ? { ...d, [field]: value } : d,
      );
      return { ...prev, daeDevices: devices };
    });
    setIsDirty(true);
  }, []);

  // ─── Device add/remove (immediate server calls) ────────────
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

  // ─── Save all changes to server ────────────────────────────
  const saveAll = useCallback(async (): Promise<boolean> => {
    setSaving(true);

    try {
      // 1) Save parent fields
      const payload: Record<string, any> = {};
      for (const [k, v] of Object.entries(formData)) {
        if (PARENT_FIELDS_EXCLUDE.has(k)) continue;
        if (v !== "" && v !== null) payload[k] = v;
      }

      const parentRes = await apiFetch(`/api/declarations/my/${declarationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!parentRes.ok) {
        const err = await parentRes.json().catch(() => ({}));
        toast.error(err.message || "Erreur lors de l'enregistrement");
        setSaving(false);
        return false;
      }

      // 2) Save each device
      for (const device of formData.daeDevices) {
        const serverId = deviceIdsRef.current[device.localId];
        if (!serverId) continue;

        const devRes = await apiFetch(
          `/api/declarations/my/${declarationId}/devices/${serverId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(serializeDevice(device)),
          },
        );

        if (!devRes.ok) {
          const err = await devRes.json().catch(() => ({}));
          toast.error(err.message || "Erreur lors de l'enregistrement du DAE");
          setSaving(false);
          return false;
        }
      }

      setIsDirty(false);
      setSaving(false);
      return true;
    } catch {
      toast.error("Erreur réseau");
      setSaving(false);
      return false;
    }
  }, [declarationId, formData]);

  return {
    formData,
    isDirty,
    saving,
    handleFieldChange,
    handleBatchChange,
    handleDeviceChange,
    handleAddDevice,
    handleRemoveDevice,
    saveAll,
  };
}
