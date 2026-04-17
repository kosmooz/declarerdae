/**
 * Déduit l'étape du formulaire de déclaration DAE (multi-device).
 *
 * - Étape 4 : Statut COMPLETE ou VALIDATED
 * - Étape 3 : Au moins 1 DaeDevice avec champs obligatoires remplis
 * - Étape 2 : Site/localisation remplie (adrVoie, codePostal, ville, tel1)
 * - Étape 1 : Brouillon initial (exploitant)
 */

interface DeviceFields {
  nom?: string | null;
  acc?: string | null;
  accLib?: string | null;
  daeMobile?: string | null;
  dispJ?: string | null;
  dispH?: string | null;
  etatFonct?: string | null;
  fabRais?: string | null;
  modele?: string | null;
  numSerie?: string | null;
  dermnt?: string | null;
}

interface DeclarationFields {
  status: string;
  // Exploitant
  exptRais?: string | null;
  exptSiren?: string | null;
  exptEmail?: string | null;
  exptTel1?: string | null;
  // Site
  adrVoie?: string | null;
  codePostal?: string | null;
  ville?: string | null;
  tel1?: string | null;
  // Devices
  daeDevices?: DeviceFields[];
}

function filled(v?: string | null): boolean {
  return !!v?.trim();
}

export function isDeviceComplete(d: DeviceFields): boolean {
  return (
    filled(d.nom) &&
    filled(d.acc) &&
    filled(d.accLib) &&
    filled(d.daeMobile) &&
    filled(d.dispJ) &&
    filled(d.dispH) &&
    filled(d.etatFonct) &&
    filled(d.fabRais) &&
    filled(d.modele) &&
    filled(d.numSerie)
  );
}

export function computeDeclarationStep(d: DeclarationFields): number {
  if (d.status === "COMPLETE" || d.status === "VALIDATED") return 4;

  // Step 3: at least 1 device with required fields
  const devices = d.daeDevices || [];
  if (devices.length > 0 && devices.some(isDeviceComplete)) {
    return 3;
  }

  // Step 2: site/location filled
  if (filled(d.adrVoie) && filled(d.codePostal) && filled(d.ville) && filled(d.tel1)) {
    return 2;
  }

  // Step 1: default
  return 1;
}
