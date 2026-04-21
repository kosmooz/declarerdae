/**
 * Pre-send validation for GéoDAE API.
 * Checks all required fields BEFORE calling the API, returning
 * clear French error messages instead of the opaque
 * "Erreur lors de l'insertion du feature".
 */

import { toE164, GEODAE_PHONE_REGEX } from "./geodae-phone";

export interface GeodaeValidationError {
  field: string;
  label: string;
  message: string;
}

interface DeclarationData {
  exptRais: string | null;
  exptSiren: string | null;
  exptTel1: string | null;
  exptTel1Prefix: string | null;
  latCoor1: number | null;
  longCoor1: number | null;
  tel1: string | null;
  tel1Prefix: string | null;
}

interface DeviceData {
  nom: string | null;
  acc: string | null;
  accLib: string | null;
  daeMobile: string | null;
  etatFonct: string | null;
  fabRais: string | null;
  modele: string | null;
  numSerie: string | null;
  dermnt: string | null;
  daeLat: number | null;
  daeLng: number | null;
}

const VALID_ACC = ["interieur", "intérieur", "exterieur", "extérieur"];
const VALID_ETAT_FONCT = [
  "En fonctionnement",
  "Hors service",
  "Supprimé définitivement",
  "Absent momentanément",
  "Inconnu",
];
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function validateForGeodae(
  decl: DeclarationData,
  device: DeviceData,
  options: { mntSiren: string | null; mntRais: string | null },
): GeodaeValidationError[] {
  const errors: GeodaeValidationError[] = [];

  // ── Device identification ──
  if (!device.nom?.trim()) {
    errors.push({ field: "nom", label: "Nom du DAE", message: "Obligatoire" });
  }

  // ── Coordinates (device-level preferred, then declaration-level) ──
  const lat = device.daeLat ?? decl.latCoor1;
  const lng = device.daeLng ?? decl.longCoor1;
  if (lat == null || lng == null) {
    errors.push({
      field: "lat_coor1/long_coor1",
      label: "Coordonnées GPS",
      message: "Obligatoires (latitude et longitude requises)",
    });
  }

  // ── Access ──
  if (!device.acc || !VALID_ACC.includes(device.acc.toLowerCase())) {
    errors.push({
      field: "acc",
      label: "Environnement (intérieur/extérieur)",
      message: "Obligatoire — valeurs acceptées : Intérieur, Extérieur",
    });
  }

  if (!device.accLib || (device.accLib !== "OUI" && device.accLib !== "NON")) {
    errors.push({
      field: "acc_lib",
      label: "Accès libre",
      message: "Obligatoire — doit être OUI ou NON",
    });
  }

  if (!device.daeMobile || (device.daeMobile !== "OUI" && device.daeMobile !== "NON")) {
    errors.push({
      field: "dae_mobile",
      label: "DAE itinérant",
      message: "Obligatoire — doit être OUI ou NON",
    });
  }

  // ── Site phone (tel1) ──
  const tel1E164 = toE164(decl.tel1, decl.tel1Prefix);
  if (!tel1E164) {
    errors.push({
      field: "tel1",
      label: "Téléphone du site",
      message: "Obligatoire (9 chiffres + indicatif français)",
    });
  } else if (!GEODAE_PHONE_REGEX.test(tel1E164)) {
    errors.push({
      field: "tel1",
      label: "Téléphone du site",
      message: `Format invalide (attendu : +33XXXXXXXXX). Reçu : ${tel1E164}`,
    });
  }

  // ── Exploitant phone (expt_tel1) ──
  const exptTel1E164 = toE164(decl.exptTel1, decl.exptTel1Prefix);
  if (!exptTel1E164) {
    errors.push({
      field: "expt_tel1",
      label: "Téléphone exploitant",
      message: "Obligatoire (9 chiffres + indicatif français)",
    });
  } else if (!GEODAE_PHONE_REGEX.test(exptTel1E164)) {
    errors.push({
      field: "expt_tel1",
      label: "Téléphone exploitant",
      message: `Format invalide (attendu : +33XXXXXXXXX). Reçu : ${exptTel1E164}`,
    });
  }

  // ── Functional state ──
  const etatFonct = device.etatFonct || "En fonctionnement";
  if (!VALID_ETAT_FONCT.includes(etatFonct)) {
    errors.push({
      field: "etat_fonct",
      label: "État fonctionnel",
      message: `Valeur invalide "${etatFonct}". Acceptées : ${VALID_ETAT_FONCT.join(", ")}`,
    });
  }

  // ── Manufacturer / model / serial ──
  if (!device.fabRais?.trim()) {
    errors.push({ field: "fab_rais", label: "Fabricant", message: "Obligatoire" });
  }
  if (!device.modele?.trim()) {
    errors.push({ field: "modele", label: "Modèle", message: "Obligatoire" });
  }
  if (!device.numSerie?.trim()) {
    errors.push({ field: "num_serie", label: "Numéro de série", message: "Obligatoire" });
  }

  // ── Last maintenance date (dermnt) — REQUIRED by GéoDAE ──
  if (!device.dermnt?.trim()) {
    errors.push({
      field: "dermnt",
      label: "Date dernière maintenance",
      message: "Obligatoire (format AAAA-MM-JJ)",
    });
  } else if (!DATE_REGEX.test(device.dermnt.trim())) {
    errors.push({
      field: "dermnt",
      label: "Date dernière maintenance",
      message: `Format invalide "${device.dermnt}" — attendu AAAA-MM-JJ`,
    });
  }

  // ── Exploitant identification ──
  if (!decl.exptSiren?.trim()) {
    errors.push({ field: "expt_siren", label: "SIREN exploitant", message: "Obligatoire" });
  }
  if (!decl.exptRais?.trim()) {
    errors.push({ field: "expt_rais", label: "Raison sociale exploitant", message: "Obligatoire" });
  }

  return errors;
}
