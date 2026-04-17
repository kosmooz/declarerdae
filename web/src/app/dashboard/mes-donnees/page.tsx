"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Download, Trash2, Shield, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function MesDonneesPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [exporting, setExporting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await apiFetch("/api/gdpr/export");
      if (res.ok) {
        const data = await res.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `mes-donnees-${new Date().toISOString().split("T")[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Vos donnees ont ete exportees.");
      } else {
        toast.error("Erreur lors de l'export.");
      }
    } catch {
      toast.error("Erreur de connexion.");
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmText !== "SUPPRIMER") return;
    setDeleting(true);
    try {
      const res = await apiFetch("/api/gdpr/delete-account", {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Votre compte a ete supprime.");
        logout();
        router.push("/");
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || "Erreur lors de la suppression.");
      }
    } catch {
      toast.error("Erreur de connexion.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#3A3A3A]">
          Mes donnees personnelles
        </h1>
        <p className="text-sm text-[#929292] mt-1">
          Conformement au RGPD, vous disposez d&apos;un droit d&apos;acces, de
          portabilite et de suppression de vos donnees.
        </p>
      </div>

      {/* Export section */}
      <div className="bg-white border border-[#E5E5E5] rounded p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Download className="w-5 h-5 text-[#000091]" />
          <h2 className="font-semibold text-[#161616]">
            Exporter mes donnees
          </h2>
        </div>
        <p className="text-sm text-[#666]">
          Telechargez l&apos;ensemble de vos donnees personnelles dans un
          format lisible (JSON). Cela inclut votre profil, vos adresses, vos
          declarations, vos consentements et vos logs de connexion.
        </p>
        <Button
          onClick={handleExport}
          disabled={exporting}
          className="gap-2 bg-[#000091] hover:bg-[#000070]"
        >
          {exporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Telecharger mes donnees
        </Button>
      </div>

      {/* Info section */}
      <div className="bg-[#F5F5FE] border border-[#000091]/20 rounded p-5 space-y-2">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#000091]" />
          <h2 className="font-semibold text-[#161616]">
            Vos droits RGPD
          </h2>
        </div>
        <ul className="text-sm text-[#3A3A3A] space-y-1 list-disc list-inside">
          <li>
            <strong>Droit d&apos;acces :</strong> consultez toutes vos donnees
            via l&apos;export ci-dessus
          </li>
          <li>
            <strong>Droit de rectification :</strong> modifiez vos informations
            dans l&apos;onglet{" "}
            <Link
              href="/dashboard/edit-profile"
              className="text-[#000091] underline"
            >
              Modifier
            </Link>
          </li>
          <li>
            <strong>Droit a la portabilite :</strong> telechargez vos donnees
            au format JSON
          </li>
          <li>
            <strong>Droit a l&apos;effacement :</strong> supprimez votre compte
            ci-dessous
          </li>
          <li>
            <strong>Reclamation :</strong> vous pouvez contacter la{" "}
            <a
              href="https://www.cnil.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#000091] underline"
            >
              CNIL
            </a>
          </li>
        </ul>
      </div>

      {/* Delete section */}
      <div className="bg-white border border-[#E1000F]/30 rounded p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Trash2 className="w-5 h-5 text-[#E1000F]" />
          <h2 className="font-semibold text-[#161616]">
            Supprimer mon compte
          </h2>
        </div>
        <p className="text-sm text-[#666]">
          La suppression de votre compte entraine l&apos;anonymisation de vos
          donnees personnelles. Vos declarations seront conservees (obligation
          legale) mais vos informations personnelles seront supprimees. Cette
          action est irreversible.
        </p>

        {!showDeleteConfirm ? (
          <Button
            variant="outline"
            onClick={() => setShowDeleteConfirm(true)}
            className="gap-2 border-[#E1000F] text-[#E1000F] hover:bg-[#E1000F]/5"
          >
            <Trash2 className="h-4 w-4" />
            Supprimer mon compte
          </Button>
        ) : (
          <div className="bg-[#FEF2F2] border border-[#E1000F]/20 rounded p-4 space-y-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-[#E1000F] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-[#E1000F]">
                  Confirmation de suppression
                </p>
                <p className="text-xs text-[#666] mt-1">
                  Tapez <strong>SUPPRIMER</strong> pour confirmer la suppression
                  definitive de votre compte.
                </p>
              </div>
            </div>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Tapez SUPPRIMER"
              className="w-full px-3 py-2 border border-[#E1000F]/30 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#E1000F]/30"
            />
            <div className="flex gap-2">
              <Button
                onClick={handleDelete}
                disabled={deleteConfirmText !== "SUPPRIMER" || deleting}
                className="gap-2 bg-[#E1000F] hover:bg-[#C00000] text-white"
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Confirmer la suppression
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText("");
                }}
              >
                Annuler
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
