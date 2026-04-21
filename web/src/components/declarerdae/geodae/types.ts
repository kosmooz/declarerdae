/** Minimal DaeDevice interface needed by GéoDAE comparison components */
export interface GeodaeDaeDevice {
  id: string;
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
  daeLat: number | null;
  daeLng: number | null;
  geodaeGid: number | null;
  geodaeStatus: string | null;
  geodaeLastSync: string | null;
  geodaeLastError: string | null;
}

/** Minimal Declaration interface needed by GéoDAE comparison components */
export interface GeodaeDeclaration {
  id: string;
  status: string;
  updatedAt: string;
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
  daeDevices: GeodaeDaeDevice[];
}

export interface DeviceSyncStatus {
  device: GeodaeDaeDevice;
  loading: boolean;
  geodaeData: Record<string, any> | null;
  error: string | null;
  diffCount: number;
  syncing: boolean;
  deleting: boolean;
}

export interface DeviceSendResult {
  deviceId: string;
  deviceName: string;
  success: boolean;
  gid?: number;
  updated?: boolean;
  error?: string;
}

/** API callbacks — injected by the parent to abstract admin vs user endpoints */
export interface GeodaeSyncApi {
  fetchDeviceData: (deviceId: string) => Promise<Response>;
  sendDevices: (deviceIds?: string[]) => Promise<Response>;
  deleteDevice: (deviceId: string) => Promise<Response>;
}
