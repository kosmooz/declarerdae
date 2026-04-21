import type { GeodaeDaeDevice, GeodaeDeclaration } from "./types";

export interface GeodaeFieldDef {
  key: string;
  label: string;
  localValue?: (device: GeodaeDaeDevice, decl: GeodaeDeclaration) => string | null;
  noDiff?: boolean;
  compare?: (remote: unknown, local: string | null) => boolean;
}

export function parseJsonStr(val: string | null): string[] {
  if (!val) return [];
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : [val];
  } catch {
    return [val];
  }
}

export function normalizePhone(val: string | null | undefined): string {
  if (!val) return "";
  return val.replace(/[^\d]/g, "").replace(/^0/, "").replace(/^33/, "");
}

const DIAL_MAP: Record<string, string> = {
  fr: "33", re: "262", gp: "590", gf: "594", mq: "596",
  yt: "262", nc: "687", pf: "689", pm: "508", wf: "681", bl: "590", mf: "590",
};

export function formatLocalPhone(phone: string | null, prefix: string | null): string | null {
  if (!phone?.trim()) return null;
  const dial = DIAL_MAP[(prefix || "fr").toLowerCase()] || "33";
  const cleaned = phone.replace(/[\s\-\.()]/g, "").replace(/^0/, "");
  return `+${dial}${cleaned}`;
}

export function formatGeodaeValue(val: unknown): string {
  if (val === null || val === undefined || val === "") return "\u2014";
  if (typeof val === "boolean") return val ? "OUI" : "NON";
  if (Array.isArray(val)) return val.join(", ") || "\u2014";
  return String(val);
}

export const GEODAE_FIELDS: GeodaeFieldDef[] = [
  {
    key: "nom", label: "Nom du DAE", localValue: (d) => d.nom,
    compare: (remote, local) => {
      const r = String(remote || "").replace(/^test\s+/i, "").toLowerCase().trim();
      const l = (local || "").toLowerCase().trim();
      return r === l;
    },
  },
  { key: "fab_rais", label: "Fabricant", localValue: (d) => d.fabRais },
  { key: "modele", label: "Modèle", localValue: (d) => d.modele },
  { key: "num_serie", label: "N° série", localValue: (d) => d.numSerie },
  { key: "etat_fonct", label: "État fonctionnel", localValue: (d) => d.etatFonct },
  { key: "acc", label: "Environnement", localValue: (d) => d.acc === "interieur" ? "Intérieur" : d.acc === "exterieur" ? "Extérieur" : d.acc },
  { key: "acc_lib", label: "Accès libre", localValue: (d) => d.accLib },
  { key: "acc_etg", label: "Étage", localValue: (d) => d.accEtg },
  { key: "acc_complt", label: "Complément accès", localValue: (d) => d.accComplt },
  { key: "dae_mobile", label: "DAE itinérant", localValue: (d) => d.daeMobile },
  {
    key: "lat_coor1", label: "Latitude",
    localValue: (d, decl) => { const v = d.daeLat ?? decl.latCoor1; return v != null ? Number(v).toFixed(6) : null; },
    compare: (remote, local) => Math.abs(Number(remote || 0) - Number(local || 0)) < 0.00001,
  },
  {
    key: "long_coor1", label: "Longitude",
    localValue: (d, decl) => { const v = d.daeLng ?? decl.longCoor1; return v != null ? Number(v).toFixed(6) : null; },
    compare: (remote, local) => Math.abs(Number(remote || 0) - Number(local || 0)) < 0.00001,
  },
  { key: "adr_num", label: "N° voie", localValue: (_d, decl) => decl.adrNum },
  { key: "adr_voie", label: "Voie", localValue: (_d, decl) => decl.adrVoie },
  { key: "com_cp", label: "Code postal", localValue: (_d, decl) => decl.codePostal },
  { key: "com_nom", label: "Commune", localValue: (_d, decl) => decl.ville },
  {
    key: "tel1", label: "Téléphone site",
    localValue: (_d, decl) => formatLocalPhone(decl.tel1, decl.tel1Prefix),
    compare: (remote, local) => normalizePhone(String(remote || "")) === normalizePhone(local),
  },
  {
    key: "tel2", label: "Téléphone 2",
    localValue: (_d, decl) => formatLocalPhone(decl.tel2, decl.tel2Prefix),
    compare: (remote, local) => normalizePhone(String(remote || "")) === normalizePhone(local),
  },
  { key: "site_email", label: "Email site", localValue: (_d, decl) => decl.siteEmail },
  { key: "date_instal", label: "Date installation", localValue: (d) => d.dateInstal },
  { key: "dermnt", label: "Dernière maintenance", localValue: (d) => d.dermnt },
  { key: "dispsurv", label: "Surveillance", localValue: (d) => d.dispSurv },
  {
    key: "disp_j", label: "Jours disponibilité",
    localValue: (d) => { const v = parseJsonStr(d.dispJ); return v.length > 0 ? v.join(", ") : null; },
  },
  {
    key: "disp_h", label: "Heures disponibilité",
    localValue: (d) => { const v = parseJsonStr(d.dispH); return v.length > 0 ? v.join(", ") : null; },
  },
  { key: "disp_complt", label: "Complément dispo.", localValue: (d) => d.dispComplt },
  { key: "lc_ped", label: "Électrodes pédiatriques", localValue: (d) => d.lcPed },
  { key: "dtpr_lcad", label: "Péremption électrodes adultes", localValue: (d) => d.dtprLcad },
  { key: "dtpr_lcped", label: "Péremption électrodes pédiatriques", localValue: (d) => d.dtprLcped },
  { key: "expt_rais", label: "Exploitant", localValue: (_d, decl) => decl.exptRais },
  { key: "expt_siren", label: "SIREN exploitant", localValue: (_d, decl) => decl.exptSiren },
  { key: "expt_siret", label: "SIRET exploitant", localValue: (_d, decl) => decl.exptSiret },
  {
    key: "expt_tel1", label: "Téléphone exploitant",
    localValue: (_d, decl) => formatLocalPhone(decl.exptTel1, decl.exptTel1Prefix),
    compare: (remote, local) => normalizePhone(String(remote || "")) === normalizePhone(local),
  },
  { key: "expt_email", label: "Email exploitant", localValue: (_d, decl) => decl.exptEmail },
  { key: "expt_num", label: "N° voie exploitant", localValue: (_d, decl) => decl.exptNum },
  { key: "expt_voie", label: "Voie exploitant", localValue: (_d, decl) => decl.exptVoie },
  { key: "expt_cp", label: "Code postal exploitant", localValue: (_d, decl) => decl.exptCp },
  { key: "expt_com", label: "Commune exploitant", localValue: (_d, decl) => decl.exptCom },
  { key: "expt_type", label: "Type exploitant", localValue: (_d, decl) => decl.exptType },
  { key: "expt_insee", label: "Code INSEE exploitant", localValue: (_d, decl) => decl.exptInsee },
  { key: "com_insee", label: "Code INSEE commune", localValue: (_d, decl) => decl.codeInsee },
  {
    key: "xy_precis", label: "Précision GPS",
    localValue: (_d, decl) => decl.xyPrecis != null ? Number(decl.xyPrecis).toFixed(8) : null,
    compare: (remote, local) => Math.abs(Number(remote || 0) - Number(local || 0)) < 0.0001,
  },
];

export function computeDiffCount(
  geodaeData: Record<string, any>,
  device: GeodaeDaeDevice,
  decl: GeodaeDeclaration,
): number {
  let count = 0;
  for (const field of GEODAE_FIELDS) {
    if (field.noDiff || !field.localValue) continue;
    const remoteRaw = geodaeData[field.key];
    const remote = formatGeodaeValue(remoteRaw);
    const localRaw = field.localValue(device, decl);
    const local = formatGeodaeValue(localRaw);
    if (field.compare) {
      if (!field.compare(remoteRaw, localRaw ?? null)) count++;
    } else {
      const nr = remote.toLowerCase().trim();
      const nl = local.toLowerCase().trim();
      if (nr !== nl && !(nr === "\u2014" && nl === "\u2014")) count++;
    }
  }
  return count;
}
