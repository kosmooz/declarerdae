/**
 * Maps Declaration + DaeDevice DB records to GéoDAE GeoJSON format.
 */

import { toE164 } from "./geodae-phone";

interface DeclarationData {
  exptRais: string | null;
  exptSiren: string | null;
  exptSiret: string | null;
  exptTel1: string | null;
  exptTel1Prefix: string | null;
  exptEmail: string | null;
  exptNum: string | null;
  exptVoie: string | null;
  exptCp: string | null;
  exptCom: string | null;
  exptType: string | null;
  exptInsee: string | null;
  adrNum: string | null;
  adrVoie: string | null;
  codePostal: string | null;
  codeInsee: string | null;
  ville: string | null;
  latCoor1: number | null;
  longCoor1: number | null;
  xyPrecis: number | null;
  tel1: string | null;
  tel1Prefix: string | null;
  tel2: string | null;
  tel2Prefix: string | null;
  siteEmail: string | null;
}

interface DeviceData {
  nom: string | null;
  acc: string | null;
  accLib: string | null;
  accEtg: string | null;
  accComplt: string | null;
  daeMobile: string | null;
  dispJ: string | null;
  dispH: string | null;
  dispComplt: string | null;
  etatFonct: string | null;
  fabRais: string | null;
  modele: string | null;
  numSerie: string | null;
  lcPed: string | null;
  dtprLcped: string | null;
  dtprLcad: string | null;
  dateInstal: string | null;
  dermnt: string | null;
  dispSurv: string | null;
  photo1: string | null;
  photo2: string | null;
  daeLat: number | null;
  daeLng: number | null;
  geodaeGid: number | null;
}

/** Convert "OUI"/"NON" to boolean, null stays null */
function ouiNonToBool(v: string | null): boolean | null {
  if (v === "OUI") return true;
  if (v === "NON") return false;
  return null;
}

/** Convert acc value: "interieur" → "Intérieur", "exterieur" → "Extérieur" */
function mapAcc(v: string | null): string | null {
  if (!v) return null;
  const lower = v.toLowerCase();
  if (lower === "interieur" || lower === "intérieur") return "Intérieur";
  if (lower === "exterieur" || lower === "extérieur") return "Extérieur";
  return v;
}

/** Parse JSON string to array, fallback to ["non renseigné"] */
function parseJsonArray(v: string | null): string[] {
  if (!v) return ["non renseigné"];
  try {
    const parsed = JSON.parse(v);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    return ["non renseigné"];
  } catch {
    return ["non renseigné"];
  }
}

/**
 * Build the GeoJSON FeatureCollection for a single DAE submission to GéoDAE.
 *
 * @param decl  Declaration data (exploitant + site)
 * @param device  DaeDevice data
 * @param options.testMode  If true, prepend "test " to device name
 * @param options.photo1Base64  Base64 data URI for photo1 (or null)
 * @param options.photo2Base64  Base64 data URI for photo2 (or null)
 */
export function mapDeviceToGeoJson(
  decl: DeclarationData,
  device: DeviceData,
  options: {
    testMode: boolean;
    photo1Base64: string | null;
    photo2Base64: string | null;
    mntSiren: string | null;
    mntRais: string | null;
  },
) {
  // Device name with optional test prefix.
  // Always prefix unconditionally in test mode so the comparator's strip is symmetric
  // (the comparator only handles a single leading "test " — adding only when absent
  // would create false-positive diffs for names already containing "test").
  let nom = device.nom || "";
  if (options.testMode && nom) {
    nom = `test ${nom}`;
  }

  // Coordinates: prefer device-level, fall back to declaration-level
  const lat = device.daeLat ?? decl.latCoor1;
  const lng = device.daeLng ?? decl.longCoor1;

  // Build properties
  const properties: Record<string, unknown> = {
    // Include gid for PATCH (update) operations
    ...(device.geodaeGid ? { gid: device.geodaeGid } : {}),

    // Identification
    nom,

    // Coordinates
    x_coor2: null,
    y_coor2: null,
    lat_coor1: lat,
    long_coor1: lng,
    xy_precis: decl.xyPrecis ?? null,

    // Address
    id_adr: null,
    adr_num: decl.adrNum || "",
    adr_voie: decl.adrVoie || "",
    com_cp: decl.codePostal || "",
    com_insee: decl.codeInsee || "",
    com_nom: decl.ville || "",

    // Access
    acc: mapAcc(device.acc),
    acc_lib: ouiNonToBool(device.accLib),
    acc_etg: device.accEtg || null,
    acc_complt: device.accComplt || null,

    // Photos
    photo1: options.photo1Base64,
    photo2: options.photo2Base64,

    // Availability
    disp_j: parseJsonArray(device.dispJ),
    disp_h: parseJsonArray(device.dispH),
    disp_complt: device.dispComplt || null,

    // Site contact
    tel1: toE164(decl.tel1, decl.tel1Prefix),
    tel2: toE164(decl.tel2, decl.tel2Prefix),
    site_email: decl.siteEmail || null,

    // Installation & status
    date_instal: device.dateInstal || null,
    etat_fonct: device.etatFonct || "En fonctionnement",

    // Manufacturer
    fab_rais: device.fabRais || "",
    modele: device.modele || "",
    num_serie: device.numSerie || "",

    // Maintenance — SIREN/Rais du compte mainteneur GéoDAE (obligatoire, imposé par l'API)
    mnt_siren: options.mntSiren || "",
    mnt_rais: options.mntRais || "",
    dispsurv: ouiNonToBool(device.dispSurv),
    dermnt: device.dermnt || null,

    // Electrodes & battery
    lc_ped: ouiNonToBool(device.lcPed),
    dtpr_lcped: device.dtprLcped || null,
    dtpr_lcad: device.dtprLcad || null,

    // Exploitant
    expt_siren: decl.exptSiren || "",
    expt_siret: decl.exptSiret || null,
    expt_rais: decl.exptRais || "",
    expt_num: decl.exptNum || "",
    expt_voie: decl.exptVoie || "",
    expt_com: decl.exptCom || "",
    expt_cp: decl.exptCp || "",
    expt_type: decl.exptType || null,
    expt_insee: decl.exptInsee || null,
    expt_tel1: toE164(decl.exptTel1, decl.exptTel1Prefix),
    expt_tel2: null,
    expt_email: decl.exptEmail || null,

    // State & mobile
    etat: "Actif",
    dae_mobile: ouiNonToBool(device.daeMobile),
  };

  return {
    type: "FeatureCollection" as const,
    name: "sql_statement",
    crs: {
      type: "name" as const,
      properties: {
        name: "urn:ogc:def:crs:OGC:1.3:CRS84",
      },
    },
    features: [
      {
        type: "Feature" as const,
        properties,
        geometry: {
          type: "MultiPoint" as const,
          coordinates: lng != null && lat != null ? [[lng, lat]] : [],
        },
      },
    ],
  };
}
