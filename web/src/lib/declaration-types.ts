/** Types for the multi-DAE declaration form */

export interface DaeDeviceFormState {
  id?: string;
  localId: string;
  position: number;
  // Identification
  nom: string;
  // Accès
  acc: string;
  accLib: string;
  accEtg: string;
  accComplt: string;
  accPcsec: string;
  accAcc: string;
  daeMobile: string;
  // Disponibilité
  dispJ: string[];
  dispH: string[];
  dispComplt: string;
  // État
  etatFonct: string;
  // Fabricant
  fabRais: string;
  fabSiren: string;
  modele: string;
  numSerie: string;
  typeDAE: string;
  idEuro: string;
  // Maintenance
  dateInstal: string;
  dermnt: string;
  mntRais: string;
  mntSiren: string;
  freqMnt: string;
  dispSurv: string;
  // Électrodes & batterie
  lcPed: string;
  dtprLcped: string;
  dtprLcad: string;
  dtprBat: string;
  // Photos
  photo1: string;
  photo2: string;
  // Localisation DAE
  daeLat: number | null;
  daeLng: number | null;
}

export interface DeclarationFormState {
  // Exploitant
  exptNom: string;
  exptPrenom: string;
  exptRais: string;
  exptSiren: string;
  exptSiret: string;
  exptTel1: string;
  exptTel1Prefix: string;
  exptEmail: string;
  exptNum: string;
  exptVoie: string;
  exptCp: string;
  exptCom: string;
  exptComplement: string;
  exptType: string;
  exptInsee: string;
  // Site
  nomEtablissement: string;
  typeERP: string;
  categorieERP: string;
  // Adresse site
  adrNum: string;
  adrVoie: string;
  adrComplement: string;
  codePostal: string;
  codeInsee: string;
  ville: string;
  latCoor1: number | null;
  longCoor1: number | null;
  xyPrecis: number | null;
  // Contact site
  tel1: string;
  tel1Prefix: string;
  tel2: string;
  tel2Prefix: string;
  siteEmail: string;
  // Devices
  daeDevices: DaeDeviceFormState[];
}

export function createEmptyDevice(position: number): DaeDeviceFormState {
  return {
    localId: crypto.randomUUID(),
    position,
    nom: "",
    acc: "interieur",
    accLib: "OUI",
    accEtg: "",
    accComplt: "",
    accPcsec: "",
    accAcc: "",
    daeMobile: "NON",
    dispJ: ["7j/7"],
    dispH: ["24h/24"],
    dispComplt: "",
    etatFonct: "En fonctionnement",
    fabRais: "",
    fabSiren: "",
    modele: "",
    numSerie: "",
    typeDAE: "automatique",
    idEuro: "",
    dateInstal: "",
    dermnt: "",
    mntRais: "",
    mntSiren: "",
    freqMnt: "",
    dispSurv: "NON",
    lcPed: "",
    dtprLcped: "",
    dtprLcad: "",
    dtprBat: "",
    photo1: "",
    photo2: "",
    daeLat: null,
    daeLng: null,
  };
}

export const INITIAL_FORM_DATA: DeclarationFormState = {
  exptNom: "",
  exptPrenom: "",
  exptRais: "",
  exptSiren: "",
  exptSiret: "",
  exptTel1: "",
  exptTel1Prefix: "fr",
  exptEmail: "",
  exptNum: "",
  exptVoie: "",
  exptCp: "",
  exptCom: "",
  exptComplement: "",
  exptType: "",
  exptInsee: "",
  nomEtablissement: "",
  typeERP: "non-erp",
  categorieERP: "cat-1",
  adrNum: "",
  adrVoie: "",
  adrComplement: "",
  codePostal: "",
  codeInsee: "",
  ville: "",
  latCoor1: null,
  longCoor1: null,
  xyPrecis: null,
  tel1: "",
  tel1Prefix: "fr",
  tel2: "",
  tel2Prefix: "fr",
  siteEmail: "",
  daeDevices: [createEmptyDevice(0)],
};

/** Fields accepted by the backend PATCH DTO (whitelist) */
const DEVICE_API_FIELDS = [
  "position", "nom",
  "acc", "accLib", "accEtg", "accComplt", "accPcsec", "accAcc", "daeMobile",
  "dispJ", "dispH", "dispComplt", "etatFonct",
  "fabRais", "fabSiren", "modele", "numSerie", "typeDAE", "idEuro",
  "dateInstal", "dermnt", "mntRais", "mntSiren", "freqMnt", "dispSurv",
  "lcPed", "dtprLcped", "dtprLcad", "dtprBat",
  "daeLat", "daeLng", "photo1", "photo2",
] as const;

/** Serialize device for API (dispJ/dispH arrays → JSON strings) */
export function serializeDevice(d: DaeDeviceFormState): Record<string, any> {
  const result: Record<string, any> = {};
  for (const key of DEVICE_API_FIELDS) {
    const val = (d as any)[key];
    if (val !== undefined) result[key] = val;
  }
  // Arrays → JSON strings for backend storage
  result.dispJ = JSON.stringify(d.dispJ);
  result.dispH = JSON.stringify(d.dispH);
  return result;
}

/** Deserialize device from API (JSON strings → arrays) */
export function deserializeDevice(
  d: any,
  fallbackLocalId?: string,
): DaeDeviceFormState {
  return {
    ...d,
    localId: fallbackLocalId || d.id || crypto.randomUUID(),
    dispJ: safeParseArray(d.dispJ, ["7j/7"]),
    dispH: safeParseArray(d.dispH, ["24h/24"]),
  };
}

function safeParseArray(val: any, fallback: string[]): string[] {
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : fallback;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

/** GEO DAE enums */
export const TYPE_ERP_OPTIONS = [
  { value: "erp", label: "Établissement Recevant du Public (ERP)" },
  { value: "non-erp", label: "Autre établissement" },
  { value: "entreprise", label: "Entreprise privée" },
  { value: "association", label: "Association" },
  { value: "collectivite", label: "Collectivité territoriale" },
];

export const CATEGORIE_ERP_OPTIONS = [
  { value: "cat-1", label: "Catégorie 1 (+ de 1 500 personnes)" },
  { value: "cat-2", label: "Catégorie 2 (701 à 1 500)" },
  { value: "cat-3", label: "Catégorie 3 (301 à 700)" },
  { value: "cat-4", label: "Catégorie 4 (300 et moins)" },
  { value: "cat-5", label: "Catégorie 5 (selon seuils réglementaires)" },
  { value: "non-applicable", label: "Non applicable" },
];

export const ACC_OPTIONS = [
  { value: "interieur", label: "Intérieur" },
  { value: "exterieur", label: "Extérieur" },
];

export const TYPE_DAE_OPTIONS = [
  { value: "automatique", label: "Entièrement automatique (DEA)" },
  { value: "semi-automatique", label: "Semi-automatique (DSA)" },
];

export const ETAT_FONCT_OPTIONS = [
  { value: "En fonctionnement", label: "En fonctionnement" },
  { value: "Hors service", label: "Hors service" },
  { value: "Supprimé définitivement", label: "Supprimé définitivement" },
  { value: "Absent momentanément", label: "Absent momentanément" },
  { value: "Inconnu", label: "Inconnu" },
];

export const DISP_J_OPTIONS = [
  { value: "7j/7", label: "7j/7" },
  { value: "lundi", label: "Lundi" },
  { value: "mardi", label: "Mardi" },
  { value: "mercredi", label: "Mercredi" },
  { value: "jeudi", label: "Jeudi" },
  { value: "vendredi", label: "Vendredi" },
  { value: "samedi", label: "Samedi" },
  { value: "dimanche", label: "Dimanche" },
  { value: "jours fériés", label: "Jours fériés" },
  { value: "événements", label: "Événements" },
];

export const DISP_H_OPTIONS = [
  { value: "24h/24", label: "24h/24" },
  { value: "heures ouvrables", label: "Heures ouvrables" },
  { value: "heures de nuit", label: "Heures de nuit" },
];
