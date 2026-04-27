"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { serverToFormState } from "@/lib/declaration-convert";
import { useDeclarationEdit, validateStep, type StepErrors } from "@/hooks/useDeclarationEdit";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  User,
  Building2,
  MapPin,
  Cpu,
  Clock,
  CheckCircle,
  CheckCircle2,
  ShieldCheck,
  XCircle,
  AlertTriangle,
  Pencil,
  Loader2,
  Send,
  Save,
  Globe,
  Upload,
  RotateCw,
  RefreshCw,
  Trash2,
  ShieldAlert,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

// Lazy-load Step components (they pull in Leaflet, etc.)
import dynamic from "next/dynamic";
const Step1Exploitant = dynamic(
  () => import("@/components/declarerdae/declaration/steps/Step1Exploitant"),
  { ssr: false },
);
const Step2SiteLocalisation = dynamic(
  () => import("@/components/declarerdae/declaration/steps/Step2SiteLocalisation"),
  { ssr: false },
);
const Step3Defibrillateurs = dynamic(
  () => import("@/components/declarerdae/declaration/steps/Step3Defibrillateurs"),
  { ssr: false },
);
import DeclarationLayout from "@/components/declarerdae/declaration/DeclarationLayout";
import DeclarationPreview from "@/components/declarerdae/declaration/DeclarationPreview";

/* ─── Types ──────────────────────────────────────────────────── */

import type { DaeDevice, Declaration } from "@/types/declarations";
/* ─── Constants ──────────────────────────────────────────────── */

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Brouillon",
  COMPLETE: "Finaliser l'envoi",
  VALIDATED: "Validée",
  CANCELLED: "Annulée",
};

const STATUS_CONFIG: Record<string, { bg: string; text: string; icon: any }> = {
  DRAFT: { bg: "bg-[#F6F6F6]", text: "text-[#666]", icon: Clock },
  COMPLETE: { bg: "bg-[#FEF3C7]", text: "text-[#92400E]", icon: CheckCircle },
  VALIDATED: { bg: "bg-[#D1FAE5]", text: "text-[#18753C]", icon: ShieldCheck },
  CANCELLED: { bg: "bg-[#FEE2E2]", text: "text-[#E1000F]", icon: XCircle },
};

const TYPE_ERP_LABELS: Record<string, string> = {
  erp: "ERP (Établissement Recevant du Public)",
  "non-erp": "Autre établissement",
  entreprise: "Entreprise privée",
  association: "Association",
  collectivite: "Collectivité territoriale",
};


const EDIT_STEPS = [
  { id: 1, title: "Exploitant", icon: User },
  { id: 2, title: "Site", icon: Building2 },
  { id: 3, title: "DAE", icon: Cpu },
  { id: 4, title: "Récapitulatif", icon: CheckCircle2 },
];

/* ─── InfoRow (readonly mode) ───────────────────────────────── */

function parseJsonArray(val: string | null): string[] {
  if (!val) return [];
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : [val];
  } catch {
    return [val];
  }
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex flex-col sm:flex-row sm:items-center py-2 border-b border-[#F6F6F6] last:border-0">
      <span className="text-xs text-[#929292] sm:w-40 shrink-0 mb-0.5 sm:mb-0">
        {label}
      </span>
      <span className="text-sm text-[#161616]">{value}</span>
    </div>
  );
}

/* ─── Recap helpers ─────────────────────────────────────────── */

function RecapSection({
  icon: Icon,
  title,
  children,
}: {
  icon: any;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-[#CECECE] rounded-sm overflow-hidden">
      <div className="bg-[#F6F6F6] px-4 py-2 flex items-center gap-2 border-b border-[#CECECE]">
        <Icon className="w-4 h-4 text-[#000091]" />
        <h4 className="text-sm font-semibold text-[#161616]">{title}</h4>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function RecapField({ label, value }: { label: string; value?: string | null }) {
  if (!value?.trim()) return null;
  return (
    <div className="flex justify-between text-sm py-1">
      <span className="text-[#666]">{label}</span>
      <span className="font-medium text-[#161616] text-right max-w-[60%] break-words">
        {value}
      </span>
    </div>
  );
}

/* ─── Edit stepper ──────────────────────────────────────────── */

function EditStepper({ currentStep, onStepClick }: { currentStep: number; onStepClick: (step: number) => void }) {
  return (
    <div className="flex items-center justify-between mb-6">
      {EDIT_STEPS.map((step, i) => {
        const Icon = step.icon;
        const isActive = currentStep === step.id;
        const isCompleted = currentStep > step.id;

        return (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            <button
              type="button"
              onClick={() => onStepClick(step.id)}
              className="flex flex-col items-center group"
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                  isCompleted
                    ? "bg-[#18753C] text-white"
                    : isActive
                      ? "bg-[#000091] text-white"
                      : "bg-[#E5E5E5] text-[#929292] group-hover:bg-[#E5E5E5]/80"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Icon className="w-4.5 h-4.5" />
                )}
              </div>
              <span
                className={`text-[10px] mt-1 font-medium ${
                  isActive
                    ? "text-[#000091]"
                    : isCompleted
                      ? "text-[#18753C]"
                      : "text-[#929292]"
                }`}
              >
                {step.title}
              </span>
            </button>
            {i < EDIT_STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 mt-[-16px] ${
                  isCompleted ? "bg-[#18753C]" : "bg-[#E5E5E5]"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Edit view ──────────────────────────────────────────────── */

function EditView({
  decl,
  onSubmitted,
  onNeedsResync,
  needsResync,
  onSyncToGeodae,
  onScrollToGeodae,
  onDeleteSyncedDevice,
}: {
  decl: Declaration;
  onSubmitted: () => void;
  onNeedsResync: (needs: boolean) => void;
  needsResync: boolean;
  onSyncToGeodae: () => void;
  onScrollToGeodae: () => void;
  onDeleteSyncedDevice: (serverId: string) => void;
}) {
  const initialFormData = serverToFormState(decl);
  const {
    formData,
    isDirty,
    saving,
    handleFieldChange,
    handleBatchChange,
    handleDeviceChange,
    handleAddDevice,
    handleRemoveDevice,
    saveAll,
  } = useDeclarationEdit(decl.id, initialFormData);

  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [stepErrors, setStepErrors] = useState<StepErrors>({});
  const errorsRef = useRef<HTMLDivElement>(null);
  const stepperRef = useRef<HTMLDivElement>(null);

  const hasSyncedDevices = decl.daeDevices.some(
    (d) => d.geodaeStatus === "SENT" || d.geodaeStatus === "UPDATED",
  );

  // ─── beforeunload: warn if unsaved changes ─────────────────
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  // ─── Save & continue: validate step, save, advance ─────────
  const handleSaveAndContinue = useCallback(async () => {
    const errors = validateStep(currentStep, formData);
    if (Object.keys(errors).length > 0) {
      setStepErrors(errors);
      setTimeout(() => errorsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
      return;
    }
    setStepErrors({});

    const wasDirty = isDirty;
    const ok = await saveAll();
    if (ok) {
      if (wasDirty) {
        toast.success("Modifications enregistrées");
        if (hasSyncedDevices) onNeedsResync(true);
      }
      setCurrentStep((s) => s + 1);
      setTimeout(() => stepperRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    }
  }, [currentStep, formData, saveAll, isDirty, hasSyncedDevices, onNeedsResync]);

  const handleStepClick = useCallback(
    (target: number) => {
      if (target < currentStep) {
        setStepErrors({});
        setCurrentStep(target);
        setTimeout(() => stepperRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
        return;
      }
      // Going forward: validate current step only (no save, just block if errors)
      const errors = validateStep(currentStep, formData);
      if (Object.keys(errors).length > 0) {
        setStepErrors(errors);
        setTimeout(() => errorsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
        return;
      }
      setStepErrors({});
      setCurrentStep(target);
      setTimeout(() => stepperRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    },
    [currentStep, formData],
  );

  // ─── Submit (DRAFT -> COMPLETE) ────────────────────────────
  const handleSubmit = useCallback(async () => {
    // Validate all steps
    for (let s = 1; s <= 3; s++) {
      const errors = validateStep(s, formData);
      if (Object.keys(errors).length > 0) {
        setStepErrors(errors);
        setCurrentStep(s);
        toast.error("Veuillez corriger les erreurs avant de soumettre");
        return;
      }
    }

    setSubmitting(true);

    // Save all changes first
    const saved = await saveAll();
    if (!saved) {
      setSubmitting(false);
      return;
    }

    try {
      const res = await apiFetch(`/api/declarations/draft/${decl.id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        toast.success("Déclaration soumise avec succès");
        onSubmitted();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || "Erreur lors de la soumission");
      }
    } catch {
      toast.error("Erreur réseau");
    }
    setSubmitting(false);
  }, [decl.id, formData, saveAll, onSubmitted]);

  // Recap: check completeness (for display only on step 4)
  const missingFields: string[] = [];
  if (!formData.exptRais?.trim()) missingFields.push("Raison sociale");
  if (!formData.exptSiren?.trim()) missingFields.push("SIREN");
  if (!formData.exptEmail?.trim()) missingFields.push("Email exploitant");
  if (!formData.exptTel1?.trim()) missingFields.push("Téléphone exploitant");
  if (!formData.adrVoie?.trim()) missingFields.push("Adresse du site");
  if (!formData.codePostal?.trim()) missingFields.push("Code postal");
  if (!formData.ville?.trim()) missingFields.push("Ville");
  if (!formData.tel1?.trim()) missingFields.push("Téléphone sur site");
  const hasCompleteDevice = formData.daeDevices.some(
    (d) =>
      d.nom?.trim() &&
      d.fabRais?.trim() &&
      d.modele?.trim() &&
      d.numSerie?.trim() &&
      d.etatFonct?.trim() &&
      d.acc?.trim() &&
      d.accLib?.trim() &&
      d.daeMobile?.trim() &&
      d.dispJ?.length > 0 &&
      d.dispH?.length > 0,
  );
  if (!hasCompleteDevice) {
    missingFields.push("Au moins 1 DAE avec les champs obligatoires");
  }

  const errorList = Object.values(stepErrors);

  return (
    <DeclarationLayout
      sidebar={
        <DeclarationPreview
          data={formData}
          currentStep={currentStep}
          onGoToStep={(step) => handleStepClick(step)}
          warningMessage={
            isDirty && hasSyncedDevices
              ? "Modifications non enregistrées — une mise à jour GéoDAE sera nécessaire"
              : needsResync
                ? "Mise à jour GéoDAE requise — synchronisez vos DAE"
                : null
          }
          onWarningClick={needsResync && !isDirty ? onScrollToGeodae : undefined}
        />
      }
    >
      {/* Stepper */}
      <div ref={stepperRef} className="scroll-mt-4">
        <EditStepper currentStep={currentStep} onStepClick={handleStepClick} />
      </div>

      {/* Dirty indicator */}
      {isDirty && (
        <div className={`rounded text-sm mb-3 px-3 py-2 ${hasSyncedDevices ? "alert-warning" : ""}`}>
          <div className="flex items-center gap-2 text-xs text-[#92400E]">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            <span>
              Modifications non enregistrées
              {hasSyncedDevices && (
                <span className="text-[#92400E]/80">
                  {" "}— une mise à jour GéoDAE sera nécessaire après enregistrement
                </span>
              )}
            </span>
          </div>
        </div>
      )}

      {/* Validation errors for current step */}
      {errorList.length > 0 && (
        <div ref={errorsRef} className="alert-danger rounded text-sm mb-4">
          <div className="flex items-start gap-2">
            <XCircle className="w-4 h-4 text-[#E1000F] mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-[#E1000F]">
                Veuillez corriger les erreurs suivantes
              </p>
              <ul className="list-disc list-inside text-[#E1000F]/80 text-xs mt-1">
                {errorList.map((err) => (
                  <li key={err}>{err}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Step content */}
      <div className="bg-white border border-[#E5E5E5] rounded-lg p-5 mb-4">
        {currentStep === 1 && (
          <Step1Exploitant
            data={formData}
            onChange={handleFieldChange}
            onBatchChange={handleBatchChange}
          />
        )}
        {currentStep === 2 && (
          <Step2SiteLocalisation
            data={formData}
            onChange={handleFieldChange}
            onBatchChange={handleBatchChange}
          />
        )}
        {currentStep === 3 && (
          <Step3Defibrillateurs
            devices={formData.daeDevices}
            siteLat={formData.latCoor1}
            siteLng={formData.longCoor1}
            onDeviceChange={handleDeviceChange}
            onAddDevice={handleAddDevice}
            onRemoveDevice={handleRemoveDevice}
            onDeleteSyncedDevice={onDeleteSyncedDevice}
            deletedDeviceIds={new Set(
              decl.daeDevices
                .filter((d) => d.geodaeStatus === "DELETED")
                .map((d) => d.id),
            )}
            syncedDeviceIds={new Set(
              decl.daeDevices
                .filter((d) => d.geodaeStatus === "SENT" || d.geodaeStatus === "UPDATED")
                .map((d) => d.id),
            )}
          />
        )}
        {currentStep === 4 && (
          <div className="space-y-5">
            <div>
              <h3 className="font-heading font-semibold text-lg text-[#161616] mb-1">
                Récapitulatif de votre déclaration
              </h3>
              <p className="text-sm text-[#666]">
                Vérifiez les informations avant d'enregistrer ou de soumettre votre déclaration.
              </p>
            </div>

            {missingFields.length > 0 && (
              <div className="alert-warning rounded text-sm">
                <div className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-[#92400E] mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-[#92400E]">Champs manquants</p>
                    <ul className="list-disc list-inside text-[#92400E]/80 text-xs mt-1">
                      {missingFields.map((f) => (
                        <li key={f}>{f}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {missingFields.length === 0 && needsResync && !isDirty && (
              <div className="alert-warning rounded text-sm">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#92400E] shrink-0" />
                  <span className="text-[#92400E] font-medium">
                    Vos informations ont été modifiées. Mettez à jour vos DAE sur GéoDAE pour synchroniser les changements.
                  </span>
                </div>
              </div>
            )}

            {missingFields.length === 0 && !(needsResync && !isDirty) && (
              <div className="alert-success rounded text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#18753C]" />
                  <span className="text-[#166534] font-medium">
                    {decl.status === "DRAFT"
                      ? "Votre déclaration est complète. Vous pouvez la soumettre."
                      : decl.status === "VALIDATED"
                        ? "Toutes les informations sont complètes."
                        : "Votre déclaration est complète. Finalisez l'envoi vers GéoDAE ci-dessus."}
                  </span>
                </div>
              </div>
            )}

            {/* Exploitant recap */}
            <RecapSection icon={User} title="Exploitant">
              <div className="space-y-1">
                <RecapField label="Raison sociale" value={formData.exptRais} />
                <RecapField label="SIREN" value={formData.exptSiren} />
                {formData.exptSiret && <RecapField label="SIRET" value={formData.exptSiret} />}
                <RecapField
                  label="Contact"
                  value={
                    formData.exptPrenom || formData.exptNom
                      ? `${formData.exptPrenom} ${formData.exptNom}`.trim()
                      : undefined
                  }
                />
                <RecapField label="Email" value={formData.exptEmail} />
                <RecapField label="Téléphone" value={formData.exptTel1} />
                {(formData.exptVoie || formData.exptCp) && (
                  <RecapField
                    label="Adresse"
                    value={[formData.exptNum, formData.exptVoie].filter(Boolean).join(" ")}
                  />
                )}
                {(formData.exptCp || formData.exptCom) && (
                  <RecapField
                    label="Commune"
                    value={[formData.exptCp, formData.exptCom].filter(Boolean).join(" ")}
                  />
                )}
              </div>
            </RecapSection>

            {/* Site recap */}
            <RecapSection icon={Building2} title="Site d'implantation">
              <div className="space-y-1">
                {formData.nomEtablissement && (
                  <RecapField label="Établissement" value={formData.nomEtablissement} />
                )}
                <RecapField
                  label="Adresse"
                  value={[formData.adrNum, formData.adrVoie].filter(Boolean).join(" ") || undefined}
                />
                <RecapField
                  label="Commune"
                  value={
                    formData.codePostal && formData.ville
                      ? `${formData.codePostal} ${formData.ville}`
                      : undefined
                  }
                />
                <RecapField label="Téléphone site" value={formData.tel1} />
                {formData.latCoor1 != null && formData.longCoor1 != null && (
                  <RecapField
                    label="GPS"
                    value={`${formData.latCoor1.toFixed(6)}, ${formData.longCoor1.toFixed(6)}`}
                  />
                )}
              </div>
            </RecapSection>

            {/* Devices recap */}
            <RecapSection icon={Cpu} title={`Défibrillateur(s) — ${formData.daeDevices.length}`}>
              <div className="space-y-3">
                {formData.daeDevices.map((device, i) => (
                  <div key={device.localId} className="border border-[#E5E5E5] rounded-sm p-3 space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Cpu className="w-4 h-4 text-[#000091]" />
                      <span className="text-sm font-semibold">{device.nom || `DAE ${i + 1}`}</span>
                    </div>
                    <RecapField label="Fabricant" value={device.fabRais} />
                    <RecapField label="Modèle" value={device.modele} />
                    <RecapField label="N° série" value={device.numSerie} />
                    <RecapField label="Etat" value={device.etatFonct} />
                    <RecapField
                      label="Accès"
                      value={`${device.acc === "interieur" ? "Intérieur" : "Extérieur"} — ${device.accLib === "OUI" ? "Libre" : "Restreint"}`}
                    />
                    <RecapField label="Jours" value={device.dispJ.join(", ")} />
                    <RecapField label="Heures" value={device.dispH.join(", ")} />
                    <RecapField label="Dernière maintenance" value={device.dermnt} />
                    {device.dateInstal && <RecapField label="Installation" value={device.dateInstal} />}
                  </div>
                ))}
              </div>
            </RecapSection>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between">
        <div>
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={() => {
                setStepErrors({});
                setCurrentStep((s) => s - 1);
              }}
              className="text-[#3A3A3A] border-[#E5E5E5]"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Précédent
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {currentStep < 4 && (
            <Button
              onClick={handleSaveAndContinue}
              disabled={saving}
              className="bg-[#000091] hover:bg-[#000091]/90 text-white"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {saving ? "Enregistrement..." : "Enregistrer et continuer"}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
          {currentStep === 4 && decl.status === "DRAFT" && (
            <Button
              onClick={handleSubmit}
              disabled={submitting || missingFields.length > 0}
              className="bg-[#18753C] hover:bg-[#18753C]/90 text-white"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              {submitting ? "Soumission..." : "Soumettre la déclaration"}
            </Button>
          )}
          {currentStep === 4 && (decl.status === "COMPLETE" || decl.status === "VALIDATED") && isDirty && (
            <Button
              onClick={async () => {
                const ok = await saveAll();
                if (ok) {
                  toast.success("Modifications enregistrées");
                  if (hasSyncedDevices) onNeedsResync(true);
                  onSubmitted();
                }
              }}
              disabled={saving}
              className="bg-[#000091] hover:bg-[#000091]/90 text-white"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {saving ? "Enregistrement..." : "Enregistrer les modifications"}
            </Button>
          )}
          {currentStep === 4 && (decl.status === "COMPLETE" || decl.status === "VALIDATED") && !isDirty && needsResync && (
            <Button
              onClick={onSyncToGeodae}
              className="bg-gradient-to-r from-[#000091] via-[#1a0f91] to-[#4a00e0] hover:from-[#000078] hover:via-[#15087a] hover:to-[#3d00c0] text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              <RotateCw className="h-4 w-4 mr-2" />
              Mettre à jour sur GéoDAE
            </Button>
          )}
        </div>
      </div>
    </DeclarationLayout>
  );
}

/* ─── Readonly sections ─────────────────────────────────────── */

function ReadonlyView({ decl }: { decl: Declaration }) {
  return (
    <div className="space-y-4">
      {/* Exploitant */}
      <section className="bg-white border border-[#E5E5E5] rounded-sm overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3 bg-[#F6F6F6] border-b border-[#E5E5E5]">
          <User className="w-4 h-4 text-[#000091]" />
          <span className="text-sm font-semibold text-[#161616]">Exploitant</span>
        </div>
        <div className="px-5 py-3">
          <InfoRow label="Raison sociale" value={decl.exptRais} />
          <InfoRow label="SIREN" value={decl.exptSiren} />
          <InfoRow label="SIRET" value={decl.exptSiret} />
          <InfoRow
            label="Contact"
            value={[decl.exptPrenom, decl.exptNom].filter(Boolean).join(" ") || null}
          />
          <InfoRow label="Email" value={decl.exptEmail} />
          <InfoRow label="Téléphone" value={decl.exptTel1} />
          <InfoRow
            label="Adresse"
            value={
              [decl.exptNum, decl.exptVoie, decl.exptCp, decl.exptCom]
                .filter(Boolean)
                .join(" ") || null
            }
          />
        </div>
      </section>

      {/* Site */}
      <section className="bg-white border border-[#E5E5E5] rounded-sm overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3 bg-[#F6F6F6] border-b border-[#E5E5E5]">
          <Building2 className="w-4 h-4 text-[#000091]" />
          <span className="text-sm font-semibold text-[#161616]">Site d'implantation</span>
        </div>
        <div className="px-5 py-3">
          <InfoRow label="Établissement" value={decl.nomEtablissement} />
          <InfoRow
            label="Type"
            value={TYPE_ERP_LABELS[decl.typeERP || ""] || decl.typeERP || null}
          />
          <InfoRow
            label="Adresse"
            value={[decl.adrNum, decl.adrVoie].filter(Boolean).join(" ") || null}
          />
          <InfoRow
            label="Commune"
            value={[decl.codePostal, decl.ville].filter(Boolean).join(" ") || null}
          />
          {decl.latCoor1 != null && decl.longCoor1 != null && (
            <InfoRow
              label="Coordonnées GPS"
              value={`${decl.latCoor1.toFixed(6)}, ${decl.longCoor1.toFixed(6)}`}
            />
          )}
          <InfoRow label="Tél. site" value={decl.tel1} />
          <InfoRow label="Tél. secondaire" value={decl.tel2} />
          <InfoRow label="Email site" value={decl.siteEmail} />
        </div>
      </section>

      {/* DAE Devices */}
      {decl.daeDevices.map((device, i) => (
        <section
          key={device.id}
          className="bg-white border border-[#E5E5E5] rounded-sm overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-3 bg-[#F6F6F6] border-b border-[#E5E5E5]">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#000091]" />
              <span className="text-sm font-semibold text-[#161616]">
                {device.nom || `DAE ${i + 1}`}
              </span>
            </div>
            {device.etatFonct && (
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                  device.etatFonct === "En fonctionnement"
                    ? "bg-[#D1FAE5] text-[#18753C]"
                    : "bg-[#FEE2E2] text-[#E1000F]"
                }`}
              >
                {device.etatFonct}
              </span>
            )}
          </div>
          <div className="px-5 py-3">
            <InfoRow label="Fabricant" value={device.fabRais} />
            <InfoRow label="Modèle" value={device.modele} />
            <InfoRow label="N° série" value={device.numSerie} />
            <InfoRow
              label="Environnement"
              value={
                device.acc === "interieur"
                  ? "Intérieur"
                  : device.acc === "exterieur"
                    ? "Extérieur"
                    : device.acc
              }
            />
            <InfoRow label="Accès libre" value={device.accLib} />
            <InfoRow label="DAE itinérant" value={device.daeMobile} />
            <InfoRow label="Etage" value={device.accEtg} />
            <InfoRow label="Compl. accès" value={device.accComplt} />
            <InfoRow
              label="Jours"
              value={parseJsonArray(device.dispJ).join(", ") || null}
            />
            <InfoRow
              label="Heures"
              value={parseJsonArray(device.dispH).join(", ") || null}
            />
            <InfoRow label="Compl. dispo." value={device.dispComplt} />
            <InfoRow label="Installation" value={device.dateInstal} />
            <InfoRow label="Dern. maint." value={device.dermnt} />
            <InfoRow label="Surveillance" value={device.dispSurv} />
            <InfoRow label="Électr. pédiatriques" value={device.lcPed} />
            <InfoRow label="Date de péremption des électrodes adultes" value={device.dtprLcad} />
            <InfoRow label="Date de péremption des électrodes pédiatriques" value={device.dtprLcped} />
            {(device.photo1 || device.photo2) && (
              <div className="py-3 flex gap-3">
                {device.photo1 && (
                  <Image
                    src={device.photo1}
                    alt="Photo 1"
                    width={96}
                    height={96}
                    className="w-24 h-24 object-cover rounded-sm border border-[#E5E5E5]"
                  />
                )}
                {device.photo2 && (
                  <Image
                    src={device.photo2}
                    alt="Photo 2"
                    width={96}
                    height={96}
                    className="w-24 h-24 object-cover rounded-sm border border-[#E5E5E5]"
                  />
                )}
              </div>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}

/* ─── Main page ──────────────────────────────────────────────── */

/* ─── GéoDAE detail comparison ─────────────────────────────── */

// Helper: parse JSON array string from DB
function parseJsonStr(val: string | null): string[] {
  if (!val) return [];
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : [val];
  } catch {
    return [val];
  }
}

// Helper: normalize phone to digits-only for comparison
function normalizePhone(val: string | null | undefined): string {
  if (!val) return "";
  return val.replace(/[^\d]/g, "").replace(/^0/, "").replace(/^33/, "");
}

// Helper: format local phone with its prefix as E.164 display
function formatLocalPhone(phone: string | null, prefix: string | null): string | null {
  if (!phone?.trim()) return null;
  const DIAL_MAP: Record<string, string> = {
    fr: "33", re: "262", gp: "590", gf: "594", mq: "596",
    yt: "262", nc: "687", pf: "689", pm: "508", wf: "681", bl: "590", mf: "590",
  };
  const dial = DIAL_MAP[(prefix || "fr").toLowerCase()] || "33";
  const cleaned = phone.replace(/[\s\-\.()]/g, "").replace(/^0/, "");
  return `+${dial}${cleaned}`;
}

const GEODAE_FIELDS: Array<{
  key: string;
  label: string;
  localValue?: (device: DaeDevice, decl: Declaration) => string | null;
  // If true, don't flag differences (info-only fields from external source)
  noDiff?: boolean;
  // Custom comparator returning true if values match
  compare?: (remote: unknown, local: string | null) => boolean;
}> = [
  {
    key: "nom", label: "Nom du DAE", localValue: (d) => d.nom,
    // GéoDAE adds "test " prefix in test mode — strip it for comparison
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

function computeDiffCount(geodaeData: Record<string, any>, device: DaeDevice, decl: Declaration): number {
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

function formatGeodaeValue(val: unknown): string {
  if (val === null || val === undefined || val === "") return "—";
  if (typeof val === "boolean") return val ? "OUI" : "NON";
  if (Array.isArray(val)) return val.join(", ") || "—";
  return String(val);
}

/* ─── Sync manager dialog ─────────────────────────────────── */

interface DeviceSyncStatus {
  device: DaeDevice;
  loading: boolean;
  geodaeData: Record<string, any> | null;
  error: string | null;
  diffCount: number;
  syncing: boolean;
  deleting: boolean;
}

function GeodaeSyncManager({
  open,
  onOpenChange,
  decl,
  declarationId,
  onDone,
  onDiffsFound,
  onAllDeleted,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  decl: Declaration;
  declarationId: string;
  onDone: (allSucceeded?: boolean) => void | Promise<void>;
  onDiffsFound: (hasDiffs: boolean) => void;
  onAllDeleted: () => Promise<void> | void;
}) {
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

  // Fetch live data for all synced devices — only when dialog opens
  const [fetchKey, setFetchKey] = useState(0);
  useEffect(() => {
    if (!open) return;

    const currentDecl = declRef.current;
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

    // Only fetch live data for active synced devices (not DELETED)
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
              const res = await apiFetch(`/api/declarations/my/${declarationId}/geodae/fetch/${d.id}`);
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
  }, [open, declarationId, fetchKey]);

  const activeDevices = devices.filter((d) => d.device.geodaeStatus !== "DELETED");
  const syncedDevices = devices.filter((d) => d.device.geodaeGid && d.device.geodaeStatus !== "DELETED");
  const devicesWithDiffs = activeDevices.filter((d) => d.diffCount > 0);
  const notSentDevices = activeDevices.filter((d) => !d.device.geodaeGid);
  const errorDevices = activeDevices.filter((d) => d.error !== null);
  const anyLoading = activeDevices.some((d) => d.loading);
  const actionCount = devicesWithDiffs.length + notSentDevices.length;

  // Sync a single device
  const handleSyncOne = async (deviceId: string) => {
    setDevices((prev) => prev.map((p) =>
      p.device.id === deviceId ? { ...p, syncing: true, error: null } : p
    ));

    let success = false;
    let errorMsg: string | null = null;

    try {
      const res = await apiFetch(`/api/declarations/my/${declarationId}/geodae/send`, {
        method: "POST",
        body: JSON.stringify({ deviceIds: [deviceId] }),
      });
      const data = await res.json();
      if (Array.isArray(data) && data[0]?.success) {
        toast.success(`${data[0].deviceName} synchronisé`);
        success = true;
      } else {
        errorMsg = data[0]?.error || "Erreur de synchronisation";
        toast.error(errorMsg);
      }
    } catch {
      errorMsg = "Erreur réseau";
      toast.error(errorMsg);
    }

    if (success) {
      await onDone();
      setFetchKey((k) => k + 1);
    } else {
      setDevices((prev) => prev.map((p) =>
        p.device.id === deviceId ? { ...p, syncing: false, error: errorMsg } : p
      ));
    }
  };

  // Sync all that have diffs (+ not sent + errors)
  const handleSyncAllChanged = async () => {
    setSyncingAll(true);
    const ids = [
      ...devicesWithDiffs.map((d) => d.device.id),
      ...notSentDevices.map((d) => d.device.id),
      ...errorDevices.filter((d) => d.diffCount === 0 && d.device.geodaeGid).map((d) => d.device.id),
    ];
    const uniqueIds = [...new Set(ids)];
    let allSucceeded = false;
    try {
      const res = await apiFetch(`/api/declarations/my/${declarationId}/geodae/send`, {
        method: "POST",
        body: JSON.stringify(uniqueIds.length < decl.daeDevices.length ? { deviceIds: uniqueIds } : {}),
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        const ok = data.filter((r: any) => r.success).length;
        const ko = data.filter((r: any) => !r.success).length;
        allSucceeded = ko === 0;
        if (ko === 0) toast.success(`${ok} DAE synchronisé${ok > 1 ? "s" : ""}`);
        else toast.error(`${ko} échec(s) sur ${data.length}`);
      }
    } catch {
      toast.error("Erreur réseau");
    }
    setSyncingAll(false);
    onOpenChange(false);
    await onDone(allSucceeded);
  };

  // Delete a single device
  const handleDeleteOne = async (deviceId: string) => {
    setDevices((prev) => prev.map((p) =>
      p.device.id === deviceId ? { ...p, deleting: true } : p
    ));
    let success = false;
    try {
      const res = await apiFetch(`/api/declarations/my/${declarationId}/geodae/delete/${deviceId}`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("DAE supprimé de GéoDAE");
        success = true;
      } else {
        toast.error(data.error || "Erreur");
      }
    } catch {
      toast.error("Erreur réseau");
    }
    if (success) {
      await onDone();
      setFetchKey((k) => k + 1);
    } else {
      setDevices((prev) => prev.map((p) =>
        p.device.id === deviceId ? { ...p, deleting: false } : p
      ));
    }
  };

  // Delete all — delete from GéoDAE then cancel the declaration
  const handleDeleteAll = async () => {
    setShowDeleteAllConfirm(false);
    setDeletingAll(true);
    for (const d of syncedDevices) {
      try {
        await apiFetch(`/api/declarations/my/${declarationId}/geodae/delete/${d.device.id}`, {
          method: "POST",
        });
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
              : errorDevices.length > 0
                ? `${errorDevices.length} DAE en erreur${actionCount > 0 ? `, ${actionCount} en attente` : ""}`
                : actionCount > 0
                  ? `${actionCount} DAE nécessite${actionCount > 1 ? "nt" : ""} une action`
                  : "Tous les DAE sont à jour"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 my-2 overflow-y-auto flex-1 min-h-0">
          {[...devices].sort((a, b) => {
            const aD = a.device.geodaeStatus === "DELETED" ? 1 : 0;
            const bD = b.device.geodaeStatus === "DELETED" ? 1 : 0;
            return aD - bD;
          }).map((ds, i) => {
            const isSent = ds.device.geodaeStatus === "SENT" || ds.device.geodaeStatus === "UPDATED";
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
                    : ds.error
                      ? "border-red-200 bg-red-50"
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
                    ) : ds.error ? (
                      <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                    ) : hasDiffs ? (
                      <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                    ) : isNotSent ? (
                      <Globe className="h-4 w-4 text-[#000091] shrink-0" />
                    ) : isDeleted ? (
                      <Trash2 className="h-4 w-4 text-[#929292] shrink-0" />
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
                      {(hasDiffs || isNotSent || ds.error) && (
                        <Button
                          size="sm"
                          onClick={() => handleSyncOne(ds.device.id)}
                          disabled={ds.syncing || syncingAll}
                          className="bg-[#000091] hover:bg-[#000091]/90 text-white text-xs h-7 px-2.5"
                        >
                          {ds.syncing ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : ds.error ? (
                            <>
                              <RotateCw className="h-3 w-3 mr-1" />
                              Réessayer
                            </>
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
            {(devicesWithDiffs.length > 0 || notSentDevices.length > 0 || errorDevices.length > 0) && (() => {
              const total = devicesWithDiffs.length + notSentDevices.length + errorDevices.filter((d) => d.diffCount === 0 && d.device.geodaeGid).length;
              const allNew = devicesWithDiffs.length === 0 && errorDevices.length === 0;
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
            <p>
              Pour redéclarer ces DAE, il faudra créer une <strong>nouvelle déclaration complète</strong> depuis le début.
            </p>
            <p className="text-[#000091] font-medium">
              Si vous changez de mainteneur, celui-ci devra déclarer les DAE depuis sa propre interface GéoDAE.
            </p>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => setShowDeleteAllConfirm(false)}>
            Annuler
          </Button>
          <Button
            onClick={handleDeleteAll}
            disabled={deletingAll}
            className="bg-[#E1000F] hover:bg-[#E1000F]/90 text-white"
          >
            {deletingAll ? (
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 mr-1.5" />
            )}
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
            <p>
              Pour redéclarer ce DAE, il faudra créer une <strong>nouvelle déclaration complète</strong> depuis le début.
            </p>
            <p className="text-[#000091] font-medium">
              Si vous changez de mainteneur, celui-ci devra déclarer le DAE depuis sa propre interface GéoDAE.
            </p>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => setDeleteOneId(null)}>
            Annuler
          </Button>
          <Button
            onClick={() => {
              if (deleteOneId) {
                handleDeleteOne(deleteOneId);
                setDeleteOneId(null);
              }
            }}
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

function GeodaeDetailContent({
  geodaeData,
  device,
  decl,
  onResync,
  onDelete,
  deleting,
}: {
  geodaeData: Record<string, any>;
  device: DaeDevice;
  decl: Declaration;
  onResync: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  let diffCount = 0;

  const rows = GEODAE_FIELDS.map((field) => {
    const remoteRaw = geodaeData[field.key];
    const remote = formatGeodaeValue(remoteRaw);
    const localRaw = field.localValue ? field.localValue(device, decl) : undefined;
    const local = localRaw !== undefined ? formatGeodaeValue(localRaw) : null;

    let isDiff = false;
    if (!field.noDiff && local !== null) {
      if (field.compare) {
        isDiff = !field.compare(remoteRaw, localRaw ?? null);
      } else {
        const normRemote = remote.toLowerCase().trim();
        const normLocal = local.toLowerCase().trim();
        if (normRemote !== normLocal && !(normRemote === "\u2014" && normLocal === "\u2014")) {
          isDiff = true;
        }
      }
      if (isDiff) diffCount++;
    }

    return { ...field, remote, local, isDiff };
  });

  return (
    <div className="space-y-4">
      {diffCount > 0 && (
        <div className="alert-warning rounded text-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#92400E] shrink-0" />
              <span className="text-[#92400E]">
                <strong>{diffCount}</strong> différence{diffCount > 1 ? "s" : ""} détectée{diffCount > 1 ? "s" : ""} entre vos données et GéoDAE
              </span>
            </div>
            <Button
              size="sm"
              onClick={onResync}
              className="bg-[#000091] hover:bg-[#000091]/90 text-white shrink-0"
            >
              <RotateCw className="h-3.5 w-3.5 mr-1.5" />
              Mettre à jour
            </Button>
          </div>
        </div>
      )}

      {diffCount === 0 && (
        <div className="alert-success rounded text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#18753C] shrink-0" />
            <span className="text-[#166534]">
              Les données GéoDAE sont à jour avec votre déclaration.
            </span>
          </div>
        </div>
      )}

      <div className="border border-[#E5E5E5] rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F6F6F6] border-b border-[#E5E5E5]">
              <th className="text-left px-3 py-2 text-[10px] font-semibold text-[#929292] uppercase tracking-wide w-[30%]">
                Champ
              </th>
              <th className="text-left px-3 py-2 text-[10px] font-semibold text-[#929292] uppercase tracking-wide">
                GéoDAE
              </th>
              {rows.some((r) => r.local !== null) && (
                <th className="text-left px-3 py-2 text-[10px] font-semibold text-[#929292] uppercase tracking-wide">
                  Local
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.key}
                className={`border-b border-[#F6F6F6] last:border-0 ${
                  row.isDiff ? "bg-amber-50" : ""
                }`}
              >
                <td className="px-3 py-1.5 text-xs text-[#929292]">
                  {row.label}
                </td>
                <td className="px-3 py-1.5 text-xs text-[#161616] break-words max-w-[200px]">
                  {row.remote}
                </td>
                {rows.some((r) => r.local !== null) && (
                  <td className={`px-3 py-1.5 text-xs break-words max-w-[200px] ${
                    row.isDiff ? "text-[#92400E] font-medium" : "text-[#161616]"
                  }`}>
                    {row.local !== null ? row.local : "—"}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mainteneur card */}
      <div className="rounded-sm border border-[#E5E5E5] bg-[#F6F6F6] p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="w-4 h-4 text-[#000091]" />
              <h4 className="text-sm font-semibold text-[#3A3A3A]">
                Mainteneur GéoDAE
              </h4>
            </div>
            <p className="text-sm text-[#161616]">
              Ce DAE est actuellement maintenu par <strong>declarerdefibrillateur.re</strong> dans la base nationale GéoDAE.
            </p>
            <p className="text-xs text-[#929292] mt-1.5">
              Si vous souhaitez changer de mainteneur, vous devez d'abord supprimer cette fiche. Le nouveau mainteneur devra ensuite redéclarer le DAE depuis sa propre interface GéoDAE.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={deleting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-red-200 bg-white text-red-600 text-xs font-medium hover:bg-red-50 transition-colors shrink-0 disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Changer de mainteneur
          </button>
        </div>
      </div>

      {/* Delete maintainer confirmation dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#E1000F]">
              <ShieldAlert className="h-5 w-5" />
              Supprimer le mainteneur
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 my-2">
            <div className="alert-danger rounded text-sm">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-[#E1000F] mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-[#E1000F]">
                    Action irréversible
                  </p>
                  <p className="text-[#E1000F]/80 mt-1">
                    Cette action va définitivement supprimer la fiche de ce DAE dans la base nationale GéoDAE. Vous ne pourrez pas annuler cette opération.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm text-[#3A3A3A]">
              <p>
                Le DAE <strong>{device.nom || "sans nom"}</strong> (GéoDAE #{device.geodaeGid}) sera marqué comme <strong>« Supprimé définitivement »</strong> dans la base nationale.
              </p>
              <p>
                Il ne sera plus visible sur la carte nationale des défibrillateurs et ne pourra pas être restauré depuis votre compte.
              </p>
              <p className="text-[#000091] font-medium">
                Si vous changez de mainteneur, celui-ci devra redéclarer le DAE depuis sa propre interface GéoDAE.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={() => {
                setShowDeleteConfirm(false);
                onDelete();
              }}
              disabled={deleting}
              className="bg-[#E1000F] hover:bg-[#E1000F]/90 text-white"
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-1.5" />
              )}
              Supprimer définitivement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ─── GéoDAE result type ───────────────────────────────────── */

interface DeviceSendResult {
  deviceId: string;
  deviceName: string;
  success: boolean;
  gid?: number;
  updated?: boolean;
  error?: string;
}

function computeNeedsResync(decl: Declaration): boolean {
  const synced = decl.daeDevices.filter(
    (d) => (d.geodaeStatus === "SENT" || d.geodaeStatus === "UPDATED") && d.geodaeLastSync,
  );
  if (synced.length === 0) return false;
  const declUpdated = new Date(decl.updatedAt).getTime();
  return synced.some((d) => declUpdated > new Date(d.geodaeLastSync!).getTime());
}

export default function DeclarationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [decl, setDecl] = useState<Declaration | null>(null);
  const [loading, setLoading] = useState(true);

  // GéoDAE sync state
  const [showGeodaeConfirm, setShowGeodaeConfirm] = useState(false);

  // GéoDAE detail popup state
  const [geodaeDetailDevice, setGeodaeDetailDevice] = useState<DaeDevice | null>(null);
  const [geodaeDetailData, setGeodaeDetailData] = useState<Record<string, any> | null>(null);
  const [geodaeDetailLoading, setGeodaeDetailLoading] = useState(false);
  const [geodaeDetailError, setGeodaeDetailError] = useState<string | null>(null);
  const [deletingDevice, setDeletingDevice] = useState(false);
  const [deleteFromFormId, setDeleteFromFormId] = useState<string | null>(null);
  const deleteFromFormDevice = decl?.daeDevices.find((d) => d.id === deleteFromFormId);
  const [needsResync, setNeedsResync] = useState(false);
  const geodaeCardRef = useRef<HTMLDivElement>(null);

  const loadDecl = useCallback(async () => {
    const res = await apiFetch(`/api/declarations/my/${id}`);
    if (res.ok) {
      const data = await res.json();
      setDecl(data);
      setNeedsResync(computeNeedsResync(data));
    } else {
      router.push("/dashboard/mes-declarations");
    }
    setLoading(false);
  }, [id, router]);

  useEffect(() => {
    loadDecl();
  }, [loadDecl]);

  /* ─── GéoDAE detail fetch ────────────────────────────────────── */

  const handleShowGeodaeDetail = useCallback(async (device: DaeDevice) => {
    setGeodaeDetailDevice(device);
    setGeodaeDetailData(null);
    setGeodaeDetailError(null);
    setGeodaeDetailLoading(true);

    try {
      const res = await apiFetch(`/api/declarations/my/${id}/geodae/fetch/${device.id}`);
      if (res.ok) {
        setGeodaeDetailData(await res.json());
      } else {
        const err = await res.json().catch(() => ({}));
        setGeodaeDetailError(err.message || "Erreur lors de la récupération des données GéoDAE");
      }
    } catch {
      setGeodaeDetailError("Erreur réseau");
    }
    setGeodaeDetailLoading(false);
  }, [id]);

  const handleDeleteDevice = useCallback(async (deviceId: string) => {
    if (!decl) return;
    setDeletingDevice(true);
    try {
      const res = await apiFetch(`/api/declarations/my/${id}/geodae/delete/${deviceId}`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("DAE supprimé de GéoDAE");
        setGeodaeDetailDevice(null);
      } else {
        toast.error(data.error || "Erreur lors de la suppression");
      }
    } catch {
      toast.error("Erreur réseau");
    }
    setDeletingDevice(false);

    // Reload declaration
    const declRes = await apiFetch(`/api/declarations/my/${id}`);
    if (declRes.ok) {
      setDecl(await declRes.json());
    }
  }, [decl, id]);

  /* ─── Render ───────────────────────────────────────────────── */

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-[#000091]" />
      </div>
    );
  }

  if (!decl) return null;

  const isEditable = decl.status === "DRAFT" || decl.status === "COMPLETE" || decl.status === "VALIDATED";
  const statusCfg = STATUS_CONFIG[decl.status] || STATUS_CONFIG.DRAFT;
  const StatusIcon = statusCfg.icon;

  // GéoDAE sync computed values
  const showGeodaeCard = decl.status === "COMPLETE" || decl.status === "VALIDATED";
  const geodaeSent = decl.daeDevices.filter(
    (d) => d.geodaeStatus === "SENT" || d.geodaeStatus === "UPDATED",
  );
  const geodaeFailed = decl.daeDevices.filter((d) => d.geodaeStatus === "FAILED");
  const geodaeNotSent = decl.daeDevices.filter(
    (d) => !d.geodaeStatus || d.geodaeStatus === "NOT_SENT",
  );
  const geodaeAllSynced =
    geodaeSent.length === decl.daeDevices.length && decl.daeDevices.length > 0;
  const geodaeNoneSynced =
    geodaeSent.length === 0 && geodaeFailed.length === 0;
  const geodaeIsUpdate = geodaeSent.length > 0;
  const geodaeLastSync = geodaeSent.reduce((latest: string | null, d) => {
    if (!d.geodaeLastSync) return latest;
    return !latest || new Date(d.geodaeLastSync) > new Date(latest)
      ? d.geodaeLastSync
      : latest;
  }, null);

  return (
    <div>
      {/* Back + header */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard/mes-declarations")}
          className="text-[#000091]"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg font-bold text-[#161616] font-heading">
              {decl.exptRais || "Déclaration"}
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusCfg.bg} ${statusCfg.text}`}
            >
              <StatusIcon className="w-3 h-3" />
              {STATUS_LABELS[decl.status] || decl.status}
            </span>
            {isEditable && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#F5F5FE] text-[#000091]">
                <Pencil className="w-2.5 h-2.5" />
                Modifiable
              </span>
            )}
          </div>
          <p className="text-xs text-[#929292] mt-1">
            {decl.status === "DRAFT" ? "Créée" : "Complétée"} le{" "}
            {new Date(decl.createdAt).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
            {" \u00b7 "}
            {decl.daeDevices.length} DAE
          </p>
          {decl.status === "CANCELLED" && (
            <p className="text-xs text-[#E1000F] mt-1.5">
              Cette déclaration a été annulée.
            </p>
          )}
        </div>
      </div>

      {/* Last step banner — shown when COMPLETE and no device sent yet */}
      {decl.status === "COMPLETE" && geodaeNoneSynced && (
        <div className="rounded-lg border-2 border-[#000091] bg-[#F5F5FE] p-5 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#000091] flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-lg">!</span>
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-[#000091] font-heading mb-1">
                Dernière étape : enregistrez vos DAE dans la base nationale
              </h3>
              <p className="text-sm text-[#3A3A3A] mb-3">
                Votre déclaration est complète. Pour finaliser votre démarche, envoyez vos{" "}
                {decl.daeDevices.length} défibrillateur{decl.daeDevices.length > 1 ? "s" : ""}{" "}
                vers la base nationale GéoDAE (Ministère de la Santé). Cette étape est obligatoire
                pour que vos appareils soient référencés sur la carte nationale des défibrillateurs.
              </p>
              <Button
                onClick={() => setShowGeodaeConfirm(true)}
                className="bg-[#000091] hover:bg-[#000091]/90 text-white"
              >
                <Upload className="h-4 w-4 mr-2" />
                Envoyer vers GéoDAE
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* GéoDAE sync card — hidden when the "last step" banner is shown */}
      {showGeodaeCard && !(decl.status === "COMPLETE" && geodaeNoneSynced) && (
        <div
          ref={geodaeCardRef}
          className={`rounded-lg border mb-6 overflow-hidden scroll-mt-4 ${
            needsResync
              ? "border-amber-300 ring-2 ring-amber-200"
              : geodaeAllSynced
                ? "border-green-200"
                : geodaeFailed.length > 0
                  ? "border-red-200"
                  : geodaeNoneSynced
                    ? "border-amber-200"
                    : "border-[#000091]/20"
          }`}
        >
          {/* Colored top bar */}
          <div
            className={`h-1 ${
              needsResync
                ? "bg-amber-500"
                : geodaeAllSynced
                  ? "bg-[#18753C]"
                  : geodaeFailed.length > 0
                    ? "bg-red-500"
                    : geodaeNoneSynced
                      ? "bg-amber-400"
                      : "bg-[#000091]"
            }`}
          />

          <div className="bg-white p-5">
            {/* Resync needed banner */}
            {needsResync && (
              <div className="alert-warning rounded text-sm mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#92400E] shrink-0" />
                  <span className="text-[#92400E]">
                    Vos informations ont été modifiées. Mettez à jour vos DAE sur GéoDAE pour synchroniser les changements.
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-start gap-4">
              {/* Icon */}
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
                  needsResync
                    ? "bg-amber-100"
                    : geodaeAllSynced
                      ? "bg-green-100"
                      : geodaeFailed.length > 0
                        ? "bg-red-100"
                        : geodaeNoneSynced
                          ? "bg-amber-100"
                          : "bg-[#F5F5FE]"
                }`}
              >
                {needsResync ? (
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                ) : geodaeAllSynced ? (
                  <CheckCircle className="h-5 w-5 text-[#18753C]" />
                ) : geodaeFailed.length > 0 ? (
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                ) : (
                  <Globe className="h-5 w-5 text-[#000091]" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-bold text-[#3A3A3A]">
                    Base nationale GéoDAE
                  </h3>
                  {needsResync && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700 animate-pulse">
                      <AlertTriangle className="h-2.5 w-2.5" />
                      Mise à jour requise
                    </span>
                  )}
                  {geodaeAllSynced && !needsResync && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-[#18753C]">
                      <CheckCircle className="h-2.5 w-2.5" />
                      Synchronisé
                    </span>
                  )}
                  {geodaeFailed.length > 0 && geodaeSent.length === 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-700">
                      Échec
                    </span>
                  )}
                  {!geodaeAllSynced && geodaeSent.length > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F5F5FE] text-[#000091]">
                      Partiellement synchronisé
                    </span>
                  )}
                  {geodaeNoneSynced && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700">
                      Non envoyé
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#929292] mb-3">
                  {geodaeAllSynced
                    ? `${geodaeSent.length} DAE enregistré${geodaeSent.length > 1 ? "s" : ""} dans la base nationale`
                    : geodaeNoneSynced
                      ? `${decl.daeDevices.length} DAE en attente d'envoi vers la base nationale`
                      : `${geodaeSent.length}/${decl.daeDevices.length} DAE synchronisé${geodaeSent.length > 1 ? "s" : ""}${geodaeFailed.length > 0 ? `, ${geodaeFailed.length} en échec` : ""}${geodaeNotSent.length > 0 ? `, ${geodaeNotSent.length} non envoyé${geodaeNotSent.length > 1 ? "s" : ""}` : ""}`}
                  {geodaeLastSync && (
                    <>
                      {" "}
                      · Dernière sync :{" "}
                      {new Date(geodaeLastSync).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </>
                  )}
                </p>

                {/* Device badges with individual retry */}
                <div className="flex flex-wrap gap-1.5">
                  {decl.daeDevices.map((device, i) => {
                    const status = device.geodaeStatus;
                    const isSent = status === "SENT" || status === "UPDATED";
                    const isFailed = status === "FAILED";
                    return (
                      <div key={device.id} className="inline-flex items-center">
                        {isSent ? (
                          <button
                            type="button"
                            onClick={() => handleShowGeodaeDetail(device)}
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                              needsResync
                                ? "bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100"
                                : "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                            }`}
                            title="Voir la fiche GéoDAE"
                          >
                            {needsResync ? (
                              <AlertTriangle className="h-3 w-3" />
                            ) : (
                              <CheckCircle className="h-3 w-3" />
                            )}
                            {device.nom || `DAE ${i + 1}`}
                            <span className="text-[10px] opacity-75">
                              #{device.geodaeGid}
                            </span>
                          </button>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium border ${
                              isFailed
                                ? "bg-red-50 border-red-200 text-red-700"
                                : "bg-[#F6F6F6] border-[#E5E5E5] text-[#929292]"
                            }`}
                          >
                            {isFailed ? (
                              <XCircle className="h-3 w-3" />
                            ) : (
                              <Globe className="h-3 w-3" />
                            )}
                            {device.nom || `DAE ${i + 1}`}
                            {isFailed && (
                              <span className="text-[10px] opacity-75">Échec</span>
                            )}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action button */}
              <div className="shrink-0">
                <Button
                  size="sm"
                  onClick={() => setShowGeodaeConfirm(true)}
                  className={
                    geodaeIsUpdate && geodaeFailed.length === 0
                      ? "bg-white text-[#000091] border border-[#000091] hover:bg-[#F5F5FE] shadow-none"
                      : "bg-gradient-to-r from-[#000091] via-[#1a0f91] to-[#4a00e0] hover:from-[#000078] hover:via-[#15087a] hover:to-[#3d00c0] text-white shadow-md hover:shadow-lg transition-all duration-200"
                  }
                >
                  {geodaeIsUpdate ? (
                    <RotateCw className="h-3.5 w-3.5 mr-1.5" />
                  ) : (
                    <Upload className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  {geodaeFailed.length > 0 && geodaeSent.length === 0
                    ? "Réessayer l'envoi"
                    : geodaeIsUpdate
                      ? "Mettre à jour"
                      : "Envoyer vers GéoDAE"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit or Readonly */}
      {isEditable ? (
        <EditView
          decl={decl}
          onSubmitted={loadDecl}
          onNeedsResync={setNeedsResync}
          needsResync={needsResync}
          onSyncToGeodae={() => setShowGeodaeConfirm(true)}
          onScrollToGeodae={() => geodaeCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
          onDeleteSyncedDevice={(serverId) => setDeleteFromFormId(serverId)}
        />
      ) : (
        <ReadonlyView decl={decl} />
      )}

      {/* Historique (always shown) */}
      <section className="bg-white border border-[#E5E5E5] rounded-sm overflow-hidden mt-4">
        <div className="flex items-center gap-2 px-5 py-3 bg-[#F6F6F6] border-b border-[#E5E5E5]">
          <Clock className="w-4 h-4 text-[#000091]" />
          <span className="text-sm font-semibold text-[#161616]">Historique</span>
        </div>
        <div className="px-5 py-3">
          <InfoRow
            label="Créée le"
            value={new Date(decl.createdAt).toLocaleString("fr-FR")}
          />
          <InfoRow
            label="Mise à jour le"
            value={new Date(decl.updatedAt).toLocaleString("fr-FR")}
          />
        </div>
      </section>

      {/* GéoDAE sync manager dialog */}
      <GeodaeSyncManager
        open={showGeodaeConfirm}
        onOpenChange={setShowGeodaeConfirm}
        decl={decl}
        declarationId={id}
        onDone={async (allSucceeded) => {
          if (allSucceeded !== false) setNeedsResync(false);
          await loadDecl();
        }}
        onDiffsFound={(hasDiffs) => { if (hasDiffs) setNeedsResync(true); }}
        onAllDeleted={async () => {
          // Cancel the declaration and redirect
          await apiFetch(`/api/declarations/my/${id}/cancel`, {
            method: "POST",
          });
          toast.success("Déclaration supprimée");
          router.push("/dashboard/mes-declarations");
        }}
      />

      {/* Delete synced device from form confirmation */}
      <Dialog open={!!deleteFromFormId} onOpenChange={(v) => { if (!v) setDeleteFromFormId(null); }}>
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
                    Le DAE <strong>{deleteFromFormDevice?.nom || "sans nom"}</strong> (GéoDAE #{deleteFromFormDevice?.geodaeGid}) sera définitivement supprimé de la base nationale et ne sera plus visible sur la carte nationale des défibrillateurs.
                  </p>
                </div>
              </div>
            </div>
            <div className="text-sm text-[#3A3A3A] space-y-2">
              <p>
                Pour redéclarer ce DAE, il faudra créer une <strong>nouvelle déclaration complète</strong> depuis le début.
              </p>
              <p className="text-[#000091] font-medium">
                Si vous changez de mainteneur, celui-ci devra déclarer le DAE depuis sa propre interface GéoDAE.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setDeleteFromFormId(null)}>
              Annuler
            </Button>
            <Button
              onClick={async () => {
                if (!deleteFromFormId) return;
                const deviceId = deleteFromFormId;
                setDeleteFromFormId(null);
                await handleDeleteDevice(deviceId);
              }}
              disabled={deletingDevice}
              className="bg-[#E1000F] hover:bg-[#E1000F]/90 text-white"
            >
              {deletingDevice ? (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-1.5" />
              )}
              Supprimer définitivement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* GéoDAE detail dialog */}
      <Dialog
        open={!!geodaeDetailDevice}
        onOpenChange={(open) => { if (!open) setGeodaeDetailDevice(null); }}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-[#000091]" />
              Fiche GéoDAE — {geodaeDetailDevice?.nom || "DAE"}
              {geodaeDetailDevice?.geodaeGid && (
                <span className="text-xs font-normal text-[#929292]">
                  #{geodaeDetailDevice.geodaeGid}
                </span>
              )}
            </DialogTitle>
            <DialogDescription>
              Données actuellement enregistrées dans la base nationale GéoDAE
            </DialogDescription>
          </DialogHeader>

          {geodaeDetailLoading && (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-[#000091]" />
            </div>
          )}

          {geodaeDetailError && (
            <div className="alert-danger rounded text-sm">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-[#E1000F] shrink-0" />
                <span>{geodaeDetailError}</span>
              </div>
            </div>
          )}

          {geodaeDetailData && geodaeDetailDevice && decl && (
            <GeodaeDetailContent
              geodaeData={geodaeDetailData}
              device={geodaeDetailDevice}
              decl={decl}
              onResync={() => {
                setGeodaeDetailDevice(null);
                setShowGeodaeConfirm(true);
              }}
              onDelete={() => handleDeleteDevice(geodaeDetailDevice.id)}
              deleting={deletingDevice}
            />
          )}

          <DialogFooter>
            <Button variant="ghost" onClick={() => setGeodaeDetailDevice(null)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
