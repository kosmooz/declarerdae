"use client";

import { useEffect, useState, useCallback } from "react";
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
} from "lucide-react";

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

interface DaeDevice {
  id: string;
  position: number;
  nom: string | null;
  acc: string | null;
  accLib: string | null;
  accEtg: string | null;
  accComplt: string | null;
  accPcsec: string | null;
  accAcc: string | null;
  daeMobile: string | null;
  dispJ: string | null;
  dispH: string | null;
  dispComplt: string | null;
  etatFonct: string | null;
  fabRais: string | null;
  fabSiren: string | null;
  modele: string | null;
  numSerie: string | null;
  typeDAE: string | null;
  idEuro: string | null;
  dateInstal: string | null;
  dermnt: string | null;
  mntRais: string | null;
  mntSiren: string | null;
  freqMnt: string | null;
  dispSurv: string | null;
  lcPed: string | null;
  dtprLcped: string | null;
  dtprLcad: string | null;
  dtprBat: string | null;
  photo1: string | null;
  photo2: string | null;
}

interface Declaration {
  id: string;
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
  adrComplement: string | null;
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
  status: string;
  step: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  daeDevices: DaeDevice[];
}

/* ─── Constants ──────────────────────────────────────────────── */

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Brouillon",
  COMPLETE: "Soumise",
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

const CATEGORIE_ERP_LABELS: Record<string, string> = {
  "cat-1": "Catégorie 1 (+ de 1 500 personnes)",
  "cat-2": "Catégorie 2 (701 à 1 500)",
  "cat-3": "Catégorie 3 (301 à 700)",
  "cat-4": "Catégorie 4 (300 et moins)",
  "cat-5": "Catégorie 5 (seuils réglementaires)",
  "non-applicable": "Non applicable",
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
}: {
  decl: Declaration;
  onSubmitted: () => void;
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
      return;
    }
    setStepErrors({});

    const ok = await saveAll();
    if (ok) {
      toast.success("Modifications enregistrées");
      setCurrentStep((s) => s + 1);
    }
  }, [currentStep, formData, saveAll]);

  const handleStepClick = useCallback(
    (target: number) => {
      if (target < currentStep) {
        setStepErrors({});
        setCurrentStep(target);
        return;
      }
      // Going forward: validate current step only (no save, just block if errors)
      const errors = validateStep(currentStep, formData);
      if (Object.keys(errors).length > 0) {
        setStepErrors(errors);
        return;
      }
      setStepErrors({});
      setCurrentStep(target);
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
        />
      }
    >
      {/* Stepper */}
      <EditStepper currentStep={currentStep} onStepClick={handleStepClick} />

      {/* Dirty indicator */}
      {isDirty && (
        <div className="flex items-center justify-end gap-2 text-xs text-[#92400E] mb-3">
          <AlertTriangle className="h-3.5 w-3.5" />
          Modifications non enregistrées
        </div>
      )}

      {/* Validation errors for current step */}
      {errorList.length > 0 && (
        <div className="alert-danger rounded text-sm mb-4">
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

            {missingFields.length === 0 && (
              <div className="alert-success rounded text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#18753C]" />
                  <span className="text-[#166534] font-medium">
                    {decl.status === "DRAFT"
                      ? "Votre déclaration est complète. Vous pouvez la soumettre."
                      : "Votre déclaration a bien été mise à jour et est en cours de traitement."}
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
                    <RecapField label="Type" value={device.typeDAE === "automatique" ? "DEA" : "DSA"} />
                    <RecapField label="Etat" value={device.etatFonct} />
                    <RecapField
                      label="Accès"
                      value={`${device.acc === "interieur" ? "Intérieur" : "Extérieur"} — ${device.accLib === "OUI" ? "Libre" : "Restreint"}`}
                    />
                    <RecapField label="Jours" value={device.dispJ.join(", ")} />
                    <RecapField label="Heures" value={device.dispH.join(", ")} />
                    <RecapField label="Dernière maintenance" value={device.dermnt} />
                    {device.dateInstal && <RecapField label="Installation" value={device.dateInstal} />}
                    {device.mntRais && <RecapField label="Mainteneur" value={device.mntRais} />}
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
          {decl.typeERP === "erp" && (
            <InfoRow
              label="Catégorie ERP"
              value={CATEGORIE_ERP_LABELS[decl.categorieERP || ""] || decl.categorieERP}
            />
          )}
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
              label="Type DAE"
              value={
                device.typeDAE === "automatique"
                  ? "DEA (automatique)"
                  : device.typeDAE === "semi-automatique"
                    ? "DSA (semi-auto)"
                    : device.typeDAE
              }
            />
            <InfoRow label="IUD europeen" value={device.idEuro} />
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
            <InfoRow label="Mainteneur" value={device.mntRais} />
            <InfoRow label="Fréq. maintenance" value={device.freqMnt} />
            <InfoRow label="Surveillance" value={device.dispSurv} />
            <InfoRow label="Électr. pédiatriques" value={device.lcPed} />
            <InfoRow label="Pér. électr. adultes" value={device.dtprLcad} />
            <InfoRow label="Pér. électr. pédia." value={device.dtprLcped} />
            <InfoRow label="Pér. batterie" value={device.dtprBat} />
            {(device.photo1 || device.photo2) && (
              <div className="py-3 flex gap-3">
                {device.photo1 && (
                  <img
                    src={device.photo1}
                    alt="Photo 1"
                    className="w-24 h-24 object-cover rounded-sm border border-[#E5E5E5]"
                  />
                )}
                {device.photo2 && (
                  <img
                    src={device.photo2}
                    alt="Photo 2"
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

export default function DeclarationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [decl, setDecl] = useState<Declaration | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDecl = useCallback(async () => {
    setLoading(true);
    const res = await apiFetch(`/api/declarations/my/${id}`);
    if (res.ok) {
      setDecl(await res.json());
    } else {
      router.push("/dashboard/mes-declarations");
    }
    setLoading(false);
  }, [id, router]);

  useEffect(() => {
    loadDecl();
  }, [loadDecl]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-[#000091]" />
      </div>
    );
  }

  if (!decl) return null;

  const isEditable = decl.status === "DRAFT" || decl.status === "COMPLETE";
  const statusCfg = STATUS_CONFIG[decl.status] || STATUS_CONFIG.DRAFT;
  const StatusIcon = statusCfg.icon;

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
            {decl.status === "DRAFT" ? "Créée" : "Soumise"} le{" "}
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

      {/* Edit or Readonly */}
      {isEditable ? (
        <EditView decl={decl} onSubmitted={loadDecl} />
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
    </div>
  );
}
