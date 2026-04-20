/**
 * Client-side helper to query the national GéoDAE database
 * via the public data.gouv.fr tabular API.
 *
 * API: https://tabular-api.data.gouv.fr
 * Resource: Géo'DAE - Base Nationale des Défibrillateurs
 */

const GEODAE_RESOURCE_ID = "edb6a9e1-2f16-4bbf-99e7-c3eb6b90794c";
const GEODAE_API_BASE = `https://tabular-api.data.gouv.fr/api/resources/${GEODAE_RESOURCE_ID}/data/`;

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface DaeResult {
  gid: number;
  nom: string;
  lat: number;
  lng: number;
  adrNum: string;
  adrVoie: string;
  comCp: string;
  comNom: string;
  acc: string; // Intérieur | Extérieur
  accLib: boolean;
  accComplt: string;
  accEtg: string;
  dispJ: string;
  dispH: string;
  dispComplt: string;
  etatFonct: string;
  exptRais: string;
  daeMobile: boolean;
  dateInstal: string;
  dermnt: string;
  lcPed: boolean;
  photo1: string;
  distance: number; // km, calculated client-side
}

export interface SearchParams {
  lat: number;
  lng: number;
  radiusKm: number;
  accesLibre?: boolean;
  access?: string; // "Intérieur" | "Extérieur"
  pageSize?: number;
}

/* ------------------------------------------------------------------ */
/*  Geo utilities                                                      */
/* ------------------------------------------------------------------ */

/** Bounding box from center + radius */
function boundingBox(lat: number, lng: number, radiusKm: number) {
  const latDelta = radiusKm / 111.32;
  const lngDelta = radiusKm / (111.32 * Math.cos((lat * Math.PI) / 180));
  return {
    latMin: lat - latDelta,
    latMax: lat + latDelta,
    lngMin: lng - lngDelta,
    lngMax: lng + lngDelta,
  };
}

/** Haversine distance in km */
export function haversine(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Format distance for display */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

/* ------------------------------------------------------------------ */
/*  Columns to fetch (keep response small)                             */
/* ------------------------------------------------------------------ */

const COLUMNS = [
  "gid",
  "c_nom",
  "c_lat_coor1",
  "c_long_coor1",
  "c_adr_num",
  "c_adr_voie",
  "c_com_cp",
  "c_com_nom",
  "c_acc",
  "c_acc_lib",
  "c_acc_complt",
  "c_acc_etg",
  "c_acc_pcsec",
  "c_acc_acc",
  "c_disp_j",
  "c_disp_h",
  "c_disp_complt",
  "c_etat_fonct",
  "c_expt_rais",
  "c_dae_mobile",
  "c_date_instal",
  "c_dermnt",
  "c_lc_ped",
  "c_dtpr_bat",
  "c_photo1",
].join(",");

/* ------------------------------------------------------------------ */
/*  API call                                                           */
/* ------------------------------------------------------------------ */

function mapRow(row: any): Omit<DaeResult, "distance"> {
  return {
    gid: row.gid,
    nom: row.c_nom || "DAE",
    lat: Number(row.c_lat_coor1),
    lng: Number(row.c_long_coor1),
    adrNum: row.c_adr_num || "",
    adrVoie: row.c_adr_voie || "",
    comCp: row.c_com_cp || "",
    comNom: row.c_com_nom || "",
    acc: row.c_acc || "",
    accLib: row.c_acc_lib === "t" || row.c_acc_lib === true,
    accComplt: row.c_acc_complt || "",
    accEtg: row.c_acc_etg || "",
    dispJ: parsePgArray(row.c_disp_j),
    dispH: parsePgArray(row.c_disp_h),
    dispComplt: row.c_disp_complt || "",
    etatFonct: row.c_etat_fonct || "",
    exptRais: row.c_expt_rais || "",
    daeMobile: row.c_dae_mobile === "t" || row.c_dae_mobile === true,
    dateInstal: row.c_date_instal || "",
    dermnt: row.c_dermnt || "",
    lcPed: row.c_lc_ped === "t" || row.c_lc_ped === true,
    photo1: row.c_photo1 || "",
  };
}

/** Google Maps link — opens the DAE location on the map */
export function googleMapsDirectionsUrl(dae: DaeResult): string {
  return `https://www.google.com/maps/search/?api=1&query=${dae.lat},${dae.lng}`;
}

/** Parse PostgreSQL array string like {lundi,mardi} into readable text */
function parsePgArray(val: any): string {
  if (!val) return "";
  const s = String(val);
  if (s.startsWith("{") && s.endsWith("}")) {
    return s
      .slice(1, -1)
      .split(",")
      .map((v) => v.replace(/^"|"$/g, ""))
      .join(", ");
  }
  if (Array.isArray(val)) return val.join(", ");
  return s;
}

export async function searchDae(params: SearchParams & { distanceLat?: number; distanceLng?: number }): Promise<DaeResult[]> {
  const { lat, lng, radiusKm, accesLibre, access, pageSize = 50, distanceLat, distanceLng } = params;
  const bbox = boundingBox(lat, lng, radiusKm);
  const dLat = distanceLat ?? lat;
  const dLng = distanceLng ?? lng;

  const qs = new URLSearchParams();
  qs.set("page_size", String(pageSize));
  qs.set("columns", COLUMNS);
  qs.set("c_lat_coor1__greater", String(bbox.latMin));
  qs.set("c_lat_coor1__less", String(bbox.latMax));
  qs.set("c_long_coor1__greater", String(bbox.lngMin));
  qs.set("c_long_coor1__less", String(bbox.lngMax));
  qs.set("c_etat_fonct__exact", "En fonctionnement");

  if (accesLibre) qs.set("c_acc_lib__exact", "t");
  if (access) qs.set("c_acc__exact", access);

  const res = await fetch(`${GEODAE_API_BASE}?${qs.toString()}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);

  const json = await res.json();
  const rows: DaeResult[] = (json.data || [])
    .map((row: any) => {
      const mapped = mapRow(row);
      if (!mapped.lat || !mapped.lng) return null;
      return {
        ...mapped,
        distance: haversine(dLat, dLng, mapped.lat, mapped.lng),
      } as DaeResult;
    })
    .filter(Boolean)
    .filter((d: DaeResult) => d.distance <= radiusKm);

  rows.sort((a, b) => a.distance - b.distance);
  return rows;
}
