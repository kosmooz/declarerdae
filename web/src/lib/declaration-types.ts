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
  daeMobile: string;
  // Disponibilité
  dispJ: string[];
  dispH: string[];
  dispComplt: string;
  // État
  etatFonct: string;
  // Fabricant
  fabRais: string;
  modele: string;
  numSerie: string;
  // Maintenance
  hadMaintenance: string; // "OUI" | "NON" — UI only, not sent to API
  dateInstal: string;
  dermnt: string;
  dispSurv: string;
  // Électrodes & batterie
  lcPed: string;
  dtprLcped: string;
  dtprLcad: string;
  // Photos
  photo1: string;
  photo2: string;
  // Localisation DAE
  daeLat: number | null;
  daeLng: number | null;
  // GéoDAE (lecture seule, jamais ré-envoyé via DEVICE_API_FIELDS — sert à
  // afficher le numéro d'inscription nationale dans la preview, l'éditeur
  // multi-DAE et le récapitulatif).
  geodaeGid?: number | null;
  geodaeStatus?: string | null;
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
    daeMobile: "NON",
    dispJ: ["7j/7"],
    dispH: ["24h/24"],
    dispComplt: "",
    etatFonct: "En fonctionnement",
    fabRais: "",
    modele: "",
    numSerie: "",
    hadMaintenance: "NON",
    dateInstal: "",
    dermnt: "",
    dispSurv: "NON",
    lcPed: "",
    dtprLcped: "",
    dtprLcad: "",
    photo1: "",
    photo2: "",
    daeLat: null,
    daeLng: null,
    geodaeGid: null,
    geodaeStatus: null,
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
  "acc", "accLib", "accEtg", "accComplt", "daeMobile",
  "dispJ", "dispH", "dispComplt", "etatFonct",
  "fabRais", "modele", "numSerie",
  "dateInstal", "dermnt", "dispSurv",
  "lcPed", "dtprLcped", "dtprLcad",
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

/** Deserialize device from API (JSON strings → arrays, nulls → defaults) */
export function deserializeDevice(
  d: any,
  fallbackLocalId?: string,
): DaeDeviceFormState {
  const defaults = createEmptyDevice(d.position ?? 0);
  // Overlay server values, converting null → default for each field
  const result: Record<string, any> = { ...defaults };
  for (const key of Object.keys(defaults)) {
    if (d[key] != null) result[key] = d[key];
  }
  result.id = d.id;
  result.localId = fallbackLocalId || d.id || crypto.randomUUID();
  result.dispJ = safeParseArray(d.dispJ, defaults.dispJ);
  result.dispH = safeParseArray(d.dispH, defaults.dispH);
  // Carry GéoDAE info pour affichage UX (ne sera pas réenvoyé au backend).
  result.geodaeGid = d.geodaeGid ?? null;
  result.geodaeStatus = d.geodaeStatus ?? null;
  return result as DaeDeviceFormState;
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


export const ACC_OPTIONS = [
  { value: "interieur", label: "Intérieur" },
  { value: "exterieur", label: "Extérieur" },
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
