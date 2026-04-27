import { useState, useEffect } from "react";
import { DAE_MANUFACTURERS, getModelsForManufacturer, OTHER_VALUE } from "@/data/dae-manufacturers";

const knownFabNames = DAE_MANUFACTURERS.map((m) => m.name);

interface UseDaeDeviceFormOptions {
  fabRais: string;
  modele: string;
  dermnt: string;
  dateInstal: string;
  hadMaintenance: string;
  set: (field: string, value: any) => void;
}

export function useDaeDeviceForm({
  fabRais,
  modele,
  dermnt,
  dateInstal,
  hadMaintenance: hadMaintenanceProp,
  set,
}: UseDaeDeviceFormOptions) {
  // ── Maintenance mode ──
  useEffect(() => {
    if (!hadMaintenanceProp || hadMaintenanceProp === "NON") {
      if (dermnt && dateInstal && dermnt !== dateInstal) {
        set("hadMaintenance", "OUI");
      } else if (dermnt && !dateInstal) {
        set("hadMaintenance", "OUI");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hadMaintenance = hadMaintenanceProp || "NON";
  const setHadMaintenance = (v: string) => set("hadMaintenance", v);

  const onMaintenanceToggle = (v: string) => {
    setHadMaintenance(v);
    if (v === "NON") {
      set("dermnt", dateInstal || "");
    } else {
      if (dermnt === dateInstal) set("dermnt", "");
    }
  };

  // ── Fabricant "Autre" mode ──
  const [fabAutre, setFabAutre] = useState(
    () => fabRais !== "" && !knownFabNames.includes(fabRais),
  );
  const isKnownFab = !fabAutre && knownFabNames.includes(fabRais);
  const modelsForSelected = isKnownFab ? getModelsForManufacturer(fabRais) : [];

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

  const onFabChange = (v: string) => {
    if (v === OTHER_VALUE) {
      setFabAutre(true);
      set("fabRais", "");
      set("modele", "");
      setModelAutre(false);
    } else {
      setFabAutre(false);
      set("fabRais", v);
      set("modele", "");
      setModelAutre(false);
    }
  };

  const onModelChange = (v: string) => {
    if (v === OTHER_VALUE) {
      setModelAutre(true);
      set("modele", "");
    } else {
      setModelAutre(false);
      set("modele", v);
    }
  };

  return {
    // Manufacturer
    fabAutre,
    isKnownFab,
    modelsForSelected,
    modelAutre,
    selectFabValue,
    selectModelValue,
    onFabChange,
    onModelChange,
    setFabAutre,
    setModelAutre,
    knownFabNames,
    // Maintenance
    hadMaintenance,
    setHadMaintenance,
    onMaintenanceToggle,
  };
}
