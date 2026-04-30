import type { DaeDevice, Declaration } from "@/types/declarations";

// Tolérance pour absorber les artefacts de timing :
//  - Auto-transition COMPLETE→VALIDATED qui bumpe decl.updatedAt après le sync
//  - Migrations legacy qui ont copié updatedAt → dataUpdatedAt
// Un vrai edit utilisateur fait toujours plusieurs secondes d'écart.
export const RESYNC_TOLERANCE_MS = 10_000;

export function deviceNeedsResync(
  device: Pick<DaeDevice, "geodaeStatus" | "geodaeLastSync"> & {
    dataUpdatedAt?: string | null;
  },
  declDataUpdatedAt?: string | null,
): boolean {
  const isSynced =
    (device.geodaeStatus === "SENT" || device.geodaeStatus === "UPDATED") &&
    !!device.geodaeLastSync;
  if (!isSynced) return false;
  const sync = new Date(device.geodaeLastSync!).getTime();
  const decl = declDataUpdatedAt ? new Date(declDataUpdatedAt).getTime() : 0;
  const dev = device.dataUpdatedAt ? new Date(device.dataUpdatedAt).getTime() : 0;
  return decl - sync > RESYNC_TOLERANCE_MS || dev - sync > RESYNC_TOLERANCE_MS;
}

export function declarationNeedsResync(decl: Declaration): boolean {
  return decl.daeDevices.some((d) =>
    deviceNeedsResync(d, decl.dataUpdatedAt),
  );
}
