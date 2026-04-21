"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Globe,
  Upload,
  RotateCw,
  Loader2,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Trash2,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import type {
  GeodaeDeclaration,
  GeodaeDaeDevice,
  DeviceSyncStatus,
  GeodaeSyncApi,
} from "./types";
import { computeDiffCount } from "./geodae-fields";

interface GeodaeSyncManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  decl: GeodaeDeclaration;
  onDone: () => void;
  onDiffsFound: (hasDiffs: boolean) => void;
  onAllDeleted: () => Promise<void> | void;
  api: GeodaeSyncApi;
}

export default function GeodaeSyncManager({
  open,
  onOpenChange,
  decl,
  onDone,
  onDiffsFound,
  onAllDeleted,
  api,
}: GeodaeSyncManagerProps) {
  const [devices, setDevices] = useState<DeviceSyncStatus[]>([]);
  const [syncingAll, setSyncingAll] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [deleteOneId, setDeleteOneId] = useState<string | null>(null);
  const deleteOneDevice = devices.find((d) => d.device.id === deleteOneId);

  // Keep stable refs to avoid re-triggering the effect
  const declRef = useRef(decl);
  declRef.current = decl;
  const onDiffsFoundRef = useRef(onDiffsFound);
  onDiffsFoundRef.current = onDiffsFound;
  const apiRef = useRef(api);
  apiRef.current = api;

  // Fetch live data for all synced devices -- only when dialog opens
  const [fetchKey] = useState(0);
  useEffect(() => {
    if (!open) return;

    const currentDecl = declRef.current;
    const currentApi = apiRef.current;
    let cancelled = false;

    const initial: DeviceSyncStatus[] = currentDecl.daeDevices.map((d) => ({
      device: d,
      loading: !!(d.geodaeGid && d.geodaeStatus !== "DELETED"),
      geodaeData: null,
      error: null,
      diffCount: 0,
      syncing: false,
      deleting: false,
    }));
    setDevices(initial);

    const syncedIndexes = currentDecl.daeDevices
      .map((d, idx) => ({ d, idx }))
      .filter(({ d }) => !!d.geodaeGid && d.geodaeStatus !== "DELETED");

    (async () => {
      const BATCH_SIZE = 3;
      let totalDiffs = 0;
      for (let b = 0; b < syncedIndexes.length; b += BATCH_SIZE) {
        if (cancelled) return;
        const batch = syncedIndexes.slice(b, b + BATCH_SIZE);
        await Promise.all(
          batch.map(async ({ d, idx }) => {
            try {
              const res = await currentApi.fetchDeviceData(d.id);
              if (cancelled) return;
              if (res.ok) {
                const data = await res.json();
                const diffs = computeDiffCount(data, d, currentDecl);
                totalDiffs += diffs;
                setDevices((prev) => prev.map((p, i) =>
                  i === idx ? { ...p, loading: false, geodaeData: data, diffCount: diffs } : p
                ));
              } else {
                const err = await res.json().catch(() => ({}));
                setDevices((prev) => prev.map((p, i) =>
                  i === idx ? { ...p, loading: false, error: err.message || "Erreur" } : p
                ));
              }
            } catch {
              if (cancelled) return;
              setDevices((prev) => prev.map((p, i) =>
                i === idx ? { ...p, loading: false, error: "Erreur réseau" } : p
              ));
            }
          }),
        );
      }
      if (cancelled) return;
      const notSentCount = currentDecl.daeDevices.filter(
        (d) => !d.geodaeGid && d.geodaeStatus !== "DELETED",
      ).length;
      onDiffsFoundRef.current(totalDiffs > 0 || notSentCount > 0);
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, fetchKey]);

  const activeDevices = devices.filter((d) => d.device.geodaeStatus !== "DELETED");
  const syncedDevices = devices.filter((d) => d.device.geodaeGid && d.device.geodaeStatus !== "DELETED");
  const devicesWithDiffs = activeDevices.filter((d) => d.diffCount > 0);
  const notSentDevices = activeDevices.filter((d) => !d.device.geodaeGid);
  const anyLoading = activeDevices.some((d) => d.loading);

  const handleSyncOne = async (deviceId: string) => {
    setDevices((prev) => prev.map((p) =>
      p.device.id === deviceId ? { ...p, syncing: true } : p
    ));
    try {
      const res = await api.sendDevices([deviceId]);
      const data = await res.json();
      if (Array.isArray(data) && data[0]?.success) {
        toast.success(`${data[0].deviceName} synchronisé`);
      } else {
        toast.error(data[0]?.error || "Erreur");
      }
    } catch {
      toast.error("Erreur réseau");
    }
    setDevices((prev) => prev.map((p) =>
      p.device.id === deviceId ? { ...p, syncing: false, diffCount: 0 } : p
    ));
  };

  const handleSyncAllChanged = async () => {
    setSyncingAll(true);
    const ids = [
      ...devicesWithDiffs.map((d) => d.device.id),
      ...notSentDevices.map((d) => d.device.id),
    ];
    try {
      const allActive = activeDevices.length;
      const res = await api.sendDevices(ids.length < allActive ? ids : undefined);
      const data = await res.json();
      if (Array.isArray(data)) {
        const ok = data.filter((r: any) => r.success).length;
        const ko = data.filter((r: any) => !r.success).length;
        if (ko === 0) toast.success(`${ok} DAE synchronisé${ok > 1 ? "s" : ""}`);
        else toast.error(`${ko} échec(s) sur ${data.length}`);
      }
    } catch {
      toast.error("Erreur réseau");
    }
    setSyncingAll(false);
    onOpenChange(false);
    onDone();
  };

  const handleDeleteOne = async (deviceId: string) => {
    setDevices((prev) => prev.map((p) =>
      p.device.id === deviceId ? { ...p, deleting: true } : p
    ));
    try {
      const res = await api.deleteDevice(deviceId);
      const data = await res.json();
      if (data.success) {
        toast.success("DAE supprimé de GéoDAE");
      } else {
        toast.error(data.error || "Erreur");
      }
    } catch {
      toast.error("Erreur réseau");
    }
    setDevices((prev) => prev.map((p) =>
      p.device.id === deviceId ? { ...p, deleting: false } : p
    ));
    onDone();
  };

  const handleDeleteAll = async () => {
    setShowDeleteAllConfirm(false);
    setDeletingAll(true);
    for (const d of syncedDevices) {
      try {
        await api.deleteDevice(d.device.id);
      } catch {}
    }
    setDeletingAll(false);
    toast.success("Tous les DAE ont été supprimés de GéoDAE");
    onOpenChange(false);
    onAllDeleted();
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-[#000091]" />
            Gestion GéoDAE
          </DialogTitle>
          <DialogDescription>
            {anyLoading
              ? "Chargement des données GéoDAE..."
              : devicesWithDiffs.length > 0 || notSentDevices.length > 0
                ? `${devicesWithDiffs.length + notSentDevices.length} DAE nécessite${devicesWithDiffs.length + notSentDevices.length > 1 ? "nt" : ""} une action`
                : "Tous les DAE sont à jour"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 my-2 overflow-y-auto flex-1 min-h-0">
          {[...devices].sort((a, b) => {
            const aD = a.device.geodaeStatus === "DELETED" ? 1 : 0;
            const bD = b.device.geodaeStatus === "DELETED" ? 1 : 0;
            return aD - bD;
          }).map((ds, i) => {
            const isDeleted = ds.device.geodaeStatus === "DELETED";
            const hasGid = !!ds.device.geodaeGid;
            const hasDiffs = ds.diffCount > 0;
            const isNotSent = !hasGid && !isDeleted;

            return (
              <div
                key={ds.device.id}
                className={`rounded-lg border p-3 ${
                  ds.loading
                    ? "border-[#E5E5E5] bg-[#F6F6F6]"
                    : hasDiffs
                      ? "border-amber-200 bg-amber-50"
                      : isNotSent
                        ? "border-[#000091]/20 bg-[#F5F5FE]"
                        : isDeleted
                          ? "border-[#E5E5E5] bg-[#F6F6F6] opacity-60"
                          : "border-green-200 bg-green-50"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    {ds.loading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-[#929292] shrink-0" />
                    ) : hasDiffs ? (
                      <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                    ) : isNotSent ? (
                      <Globe className="h-4 w-4 text-[#000091] shrink-0" />
                    ) : isDeleted ? (
                      <Trash2 className="h-4 w-4 text-[#929292] shrink-0" />
                    ) : ds.error ? (
                      <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-[#18753C] shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#161616] truncate">
                        {ds.device.nom || `DAE ${i + 1}`}
                      </p>
                      <p className="text-[10px] text-[#929292]">
                        {ds.loading
                          ? "Vérification..."
                          : ds.error
                            ? ds.error
                            : isDeleted
                              ? "Supprimé de GéoDAE"
                              : isNotSent
                                ? "Non encore envoyé"
                                : hasDiffs
                                  ? `${ds.diffCount} différence${ds.diffCount > 1 ? "s" : ""} détectée${ds.diffCount > 1 ? "s" : ""}`
                                  : `À jour — #${ds.device.geodaeGid}`}
                      </p>
                    </div>
                  </div>

                  {!ds.loading && !isDeleted && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      {(hasDiffs || isNotSent) && (
                        <Button
                          size="sm"
                          onClick={() => handleSyncOne(ds.device.id)}
                          disabled={ds.syncing || syncingAll}
                          className="bg-[#000091] hover:bg-[#000091]/90 text-white text-xs h-7 px-2.5"
                        >
                          {ds.syncing ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : isNotSent ? (
                            <>
                              <Upload className="h-3 w-3 mr-1" />
                              Envoyer
                            </>
                          ) : (
                            <>
                              <RotateCw className="h-3 w-3 mr-1" />
                              Synchroniser
                            </>
                          )}
                        </Button>
                      )}
                      {hasGid && (
                        <button
                          type="button"
                          onClick={() => setDeleteOneId(ds.device.id)}
                          disabled={ds.deleting || deletingAll}
                          title="Supprimer de GéoDAE"
                          className="p-1.5 rounded text-[#929292] hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
                        >
                          {ds.deleting ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 pt-3 border-t border-[#E5E5E5] shrink-0">
          <div className="flex items-center gap-2 flex-1">
            {syncedDevices.length > 0 && (
              <button
                type="button"
                onClick={() => setShowDeleteAllConfirm(true)}
                disabled={deletingAll || syncingAll}
                className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors disabled:opacity-40"
              >
                <Trash2 className="h-3 w-3" />
                Tout supprimer de GéoDAE
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Fermer
            </Button>
            {(devicesWithDiffs.length > 0 || notSentDevices.length > 0) && (() => {
              const total = devicesWithDiffs.length + notSentDevices.length;
              const allNew = devicesWithDiffs.length === 0;
              return (
                <Button
                  onClick={handleSyncAllChanged}
                  disabled={syncingAll || anyLoading}
                  className="bg-gradient-to-r from-[#000091] via-[#1a0f91] to-[#4a00e0] hover:from-[#000078] hover:via-[#15087a] hover:to-[#3d00c0] text-white shadow-md"
                >
                  {syncingAll ? (
                    <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-1.5" />
                  )}
                  {syncingAll
                    ? "Envoi en cours..."
                    : allNew
                      ? `Envoyer vers GéoDAE (${total})`
                      : `Tout mettre à jour (${total})`}
                </Button>
              );
            })()}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Delete all confirmation */}
    <Dialog open={showDeleteAllConfirm} onOpenChange={setShowDeleteAllConfirm}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#E1000F]">
            <ShieldAlert className="h-5 w-5" />
            Supprimer tous les DAE de GéoDAE
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 my-2">
          <div className="alert-danger rounded text-sm">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-[#E1000F] mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-[#E1000F]">Action irréversible</p>
                <p className="text-[#E1000F]/80 mt-1">
                  Les {syncedDevices.length} fiche{syncedDevices.length > 1 ? "s" : ""} DAE seront définitivement supprimée{syncedDevices.length > 1 ? "s" : ""} de la base nationale GéoDAE et ne seront plus visibles sur la carte nationale des défibrillateurs.
                </p>
              </div>
            </div>
          </div>
          <div className="text-sm text-[#3A3A3A] space-y-2">
            <p>Pour redéclarer ces DAE, il faudra créer une <strong>nouvelle déclaration complète</strong> depuis le début.</p>
            <p className="text-[#000091] font-medium">Si vous changez de mainteneur, celui-ci devra déclarer les DAE depuis sa propre interface GéoDAE.</p>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => setShowDeleteAllConfirm(false)}>Annuler</Button>
          <Button onClick={handleDeleteAll} disabled={deletingAll} className="bg-[#E1000F] hover:bg-[#E1000F]/90 text-white">
            {deletingAll ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Trash2 className="h-4 w-4 mr-1.5" />}
            Supprimer définitivement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Delete single device confirmation */}
    <Dialog open={!!deleteOneId} onOpenChange={(v) => { if (!v) setDeleteOneId(null); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#E1000F]">
            <ShieldAlert className="h-5 w-5" />
            Supprimer ce DAE de GéoDAE
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 my-2">
          <div className="alert-danger rounded text-sm">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-[#E1000F] mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-[#E1000F]">Action irréversible</p>
                <p className="text-[#E1000F]/80 mt-1">
                  Le DAE <strong>{deleteOneDevice?.device.nom || "sans nom"}</strong> (GéoDAE #{deleteOneDevice?.device.geodaeGid}) sera définitivement supprimé de la base nationale et ne sera plus visible sur la carte nationale des défibrillateurs.
                </p>
              </div>
            </div>
          </div>
          <div className="text-sm text-[#3A3A3A] space-y-2">
            <p>Pour redéclarer ce DAE, il faudra créer une <strong>nouvelle déclaration complète</strong> depuis le début.</p>
            <p className="text-[#000091] font-medium">Si vous changez de mainteneur, celui-ci devra déclarer le DAE depuis sa propre interface GéoDAE.</p>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => setDeleteOneId(null)}>Annuler</Button>
          <Button
            onClick={() => { if (deleteOneId) { handleDeleteOne(deleteOneId); setDeleteOneId(null); } }}
            className="bg-[#E1000F] hover:bg-[#E1000F]/90 text-white"
          >
            <Trash2 className="h-4 w-4 mr-1.5" />
            Supprimer définitivement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
