/** Shared types for Declaration and DaeDevice across admin, dashboard, and public forms */

export interface DaeDevice {
  id: string;
  position: number;
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
  dateInstal: string | null;
  dermnt: string | null;
  dispSurv: string | null;
  lcPed: string | null;
  dtprLcped: string | null;
  dtprLcad: string | null;
  photo1: string | null;
  photo2: string | null;
  daeLat: number | null;
  daeLng: number | null;
  geodaeGid: number | null;
  geodaeStatus: string | null;
  geodaeLastSync: string | null;
  geodaeLastError: string | null;
  updatedAt?: string;
}

export interface Declaration {
  id: string;
  number?: number;
  exptNom: string | null;
  exptPrenom: string | null;
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
  nomEtablissement: string | null;
  typeERP: string | null;
  categorieERP: string | null;
  adrNum: string | null;
  adrVoie: string | null;
  adrComplement?: string | null;
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
  ip?: string | null;
  status: string;
  step: number;
  notes: string | null;
  userId?: string | null;
  user?: { id: string; email: string; emailVerified: boolean; firstName?: string | null; lastName?: string | null } | null;
  createdAt: string;
  updatedAt: string;
  dataUpdatedAt?: string;
  daeDevices: DaeDevice[];
}

export const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Brouillon",
  COMPLETE: "Complète",
  VALIDATED: "Validée",
  CANCELLED: "Annulée",
};

export const FIELD_LABELS: Record<string, string> = {
  exptNom: "Nom contact", exptPrenom: "Prenom", exptRais: "Raison sociale",
  exptSiren: "SIREN", exptSiret: "SIRET", exptTel1: "Tel. exploitant",
  exptEmail: "Email exploitant", exptNum: "Numero", exptVoie: "Voie",
  exptCp: "Code postal expl.", exptCom: "Commune expl.",
  exptType: "Type exploitant", exptInsee: "INSEE expl.",
  nomEtablissement: "Etablissement", typeERP: "Type ERP",
  adrNum: "Numero", adrVoie: "Voie", adrComplement: "Complement",
  codePostal: "Code postal", codeInsee: "Code INSEE", ville: "Ville",
  latCoor1: "Latitude", longCoor1: "Longitude",
  tel1: "Tel. site", tel2: "Tel. secondaire", siteEmail: "Email site",
  notes: "Notes", status: "Statut",
  nom: "Nom DAE", acc: "Environnement", accLib: "Acces libre",
  accEtg: "Etage", accComplt: "Complement acces",
  daeMobile: "DAE itinerant", dispJ: "Jours dispo.", dispH: "Heures dispo.",
  etatFonct: "Etat fonctionnement", fabRais: "Fabricant", modele: "Modele",
  numSerie: "N. serie",
  dateInstal: "Date installation", dermnt: "Dern. maintenance",
  photo1: "Photo 1", photo2: "Photo 2",
};
