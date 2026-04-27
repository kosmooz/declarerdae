import type { DaeDeviceFormState, DeclarationFormState } from "@/lib/declaration-types";

/** Indicatifs acceptés par GéoDAE (France + DOM-TOM) */
export const GEODAE_PREFIXES = new Set([
  "fr", "re", "gp", "gf", "mq", "yt", "nc", "pf", "pm", "wf", "bl", "mf",
]);

/** Check phone has 9 digits (excluding leading 0, spaces, dashes, dots) */
export function isPhoneValid(phone: string | undefined | null): boolean {
  if (!phone?.trim()) return false;
  const cleaned = phone.replace(/[\s\-\.()]/g, "").replace(/^0/, "");
  return /^\d{9}$/.test(cleaned);
}

/** Check phone prefix is a GéoDAE-compatible French territory code */
export function isPrefixValid(prefix: string | undefined | null): boolean {
  if (!prefix?.trim()) return false;
  return GEODAE_PREFIXES.has(prefix.toLowerCase());
}

/** Validate a single device and return missing field labels */
export function validateDevice(d: DaeDeviceFormState): string[] {
  const missing: string[] = [];
  if (!d.nom?.trim()) missing.push("nom");
  if (!d.fabRais?.trim()) missing.push("fabricant");
  if (!d.modele?.trim()) missing.push("modèle");
  if (!d.numSerie?.trim()) missing.push("n° série");
  if (!d.etatFonct?.trim()) missing.push("état de fonctionnement");
  if (!d.acc?.trim()) missing.push("environnement");
  if (!d.accLib?.trim()) missing.push("accès libre");
  if (!d.daeMobile?.trim()) missing.push("DAE itinérant");
  if (!d.dermnt?.trim()) missing.push(d.hadMaintenance === "OUI" ? "date de maintenance" : "date d'installation");
  if (!d.dispJ || d.dispJ.length === 0) missing.push("jours de disponibilité");
  if (!d.dispH || d.dispH.length === 0) missing.push("heures de disponibilité");
  return missing;
}

/** Format device validation errors as user-readable strings */
export function formatDeviceErrors(devices: DaeDeviceFormState[]): string[] {
  const errors: string[] = [];
  devices.forEach((d, i) => {
    const missing = validateDevice(d);
    if (missing.length > 0) {
      errors.push(`DAE ${i + 1} (${d.nom?.trim() || "sans nom"}) : ${missing.join(", ")}`);
    }
  });
  return errors;
}

export interface StepErrors {
  [field: string]: string;
}

/** Validate declaration form by step — returns field-level errors (for useDeclarationEdit) */
export function validateStepFields(step: number, data: DeclarationFormState): StepErrors {
  const errors: StepErrors = {};

  if (step === 1) {
    if (!data.exptRais?.trim()) errors.exptRais = "Raison sociale obligatoire";
    if (!data.exptSiren?.trim()) errors.exptSiren = "SIREN obligatoire";
    if (!data.exptEmail?.trim()) errors.exptEmail = "Email exploitant obligatoire";
    if (!data.exptTel1?.trim()) {
      errors.exptTel1 = "Téléphone exploitant obligatoire";
    } else if (!isPhoneValid(data.exptTel1)) {
      errors.exptTel1 = "Téléphone : 9 chiffres requis (hors indicatif)";
    } else if (!isPrefixValid((data as any).exptTel1Prefix)) {
      errors.exptTel1 = "Indicatif téléphonique obligatoire (France ou DOM-TOM)";
    }
  }

  if (step === 2) {
    if (!data.adrVoie?.trim()) errors.adrVoie = "Adresse du site obligatoire";
    if (!data.codePostal?.trim()) errors.codePostal = "Code postal obligatoire";
    if (!data.ville?.trim()) errors.ville = "Ville obligatoire";
    if (!data.tel1?.trim()) {
      errors.tel1 = "Téléphone sur site obligatoire";
    } else if (!isPhoneValid(data.tel1)) {
      errors.tel1 = "Téléphone : 9 chiffres requis (hors indicatif)";
    } else if (!isPrefixValid((data as any).tel1Prefix)) {
      errors.tel1 = "Indicatif téléphonique obligatoire (France ou DOM-TOM)";
    }
    if (data.tel2?.trim()) {
      if (!isPhoneValid(data.tel2)) {
        errors.tel2 = "Téléphone secondaire : 9 chiffres requis (hors indicatif)";
      } else if (!isPrefixValid((data as any).tel2Prefix)) {
        errors.tel2 = "Téléphone secondaire : indicatif obligatoire (France ou DOM-TOM)";
      }
    }
    if (!data.latCoor1 || !data.longCoor1) {
      errors.latCoor1 = "Coordonnées GPS manquantes — sélectionnez une adresse sur la carte";
    }
  }

  if (step === 3) {
    if (data.daeDevices.length === 0) {
      errors._devices = "Au moins un défibrillateur est requis";
    } else {
      data.daeDevices.forEach((d, i) => {
        const missing = validateDevice(d);
        if (missing.length > 0) {
          errors[`_device_${i}`] = `DAE ${i + 1} (${d.nom?.trim() || "sans nom"}) : ${missing.join(", ")}`;
        }
      });
    }
  }

  return errors;
}
