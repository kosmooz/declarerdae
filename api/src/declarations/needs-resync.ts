// Helpers partagés pour calculer si une déclaration / un device nécessite un
// resync GéoDAE. Utilisés par list endpoints (admin + user) pour exposer le
// flag `needsResync` côté API et garder une source de vérité unique.
//
// Tolérance de 10s pour absorber les artefacts de timing :
//  - Auto-transition COMPLETE→VALIDATED qui bumpe decl.updatedAt après le sync
//  - Migrations legacy qui ont copié updatedAt → dataUpdatedAt
// Un vrai edit utilisateur fait toujours plusieurs secondes d'écart.

export const RESYNC_TOLERANCE_MS = 10_000;

export interface ResyncDevice {
  geodaeStatus: string | null;
  geodaeLastSync: Date | null;
  dataUpdatedAt?: Date | null;
}

export interface ResyncDecl {
  dataUpdatedAt: Date | null;
  daeDevices: ResyncDevice[];
}

export function computeDeviceNeedsResync(
  device: ResyncDevice,
  declDataUpdatedAt: Date | null,
): boolean {
  if (
    !(device.geodaeStatus === "SENT" || device.geodaeStatus === "UPDATED") ||
    !device.geodaeLastSync
  ) {
    return false;
  }
  const sync = new Date(device.geodaeLastSync).getTime();
  const decl = declDataUpdatedAt ? new Date(declDataUpdatedAt).getTime() : 0;
  const dev = device.dataUpdatedAt ? new Date(device.dataUpdatedAt).getTime() : 0;
  return decl - sync > RESYNC_TOLERANCE_MS || dev - sync > RESYNC_TOLERANCE_MS;
}

export function computeDeclarationNeedsResync(decl: ResyncDecl): boolean {
  return decl.daeDevices.some((d) =>
    computeDeviceNeedsResync(d, decl.dataUpdatedAt),
  );
}
