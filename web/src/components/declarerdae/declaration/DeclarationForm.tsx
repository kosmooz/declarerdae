"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { ChevronRight, ChevronLeft, Send } from "lucide-react";
import {
  INITIAL_FORM_DATA,
  createEmptyDevice,
  serializeDevice,
  deserializeDevice,
  type DeclarationFormState,
  type DaeDeviceFormState,
} from "@/lib/declaration-types";
import DeclarationLayout from "./DeclarationLayout";
import DeclarationStepper from "./DeclarationStepper";
import DeclarationPreview from "./DeclarationPreview";
import Step1Exploitant from "./steps/Step1Exploitant";
import Step2SiteLocalisation from "./steps/Step2SiteLocalisation";
import Step3Defibrillateurs from "./steps/Step3Defibrillateurs";
import Step4Recapitulatif from "./steps/Step4Recapitulatif";
import { useAuth } from "@/lib/auth";
import AuthDialog from "@/components/AuthDialog";

const LS_KEY_ID = "declaration_draft_id";
const LS_KEY_DATA = "declaration_draft_data";
const LS_KEY_VERSION = "declaration_draft_version";
const LS_KEY_DEVICES = "declaration_draft_devices";
const LS_KEY_STEP = "declaration_draft_step";
const LS_KEY_EXTRA = "declaration_draft_extra";

export default function DeclarationForm() {
  const { user, register } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<DeclarationFormState>(INITIAL_FORM_DATA);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [deviceIds, setDeviceIds] = useState<Record<string, string>>({}); // localId → serverId
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [stepErrors, setStepErrors] = useState<string[]>([]);
  const [password, setPassword] = useState("");
  const [accountEmail, setAccountEmail] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [consentRgpd, setConsentRgpd] = useState(false);

  // Refs to avoid stale closures in callbacks
  const draftIdRef = useRef<string | null>(null);
  const deviceIdsRef = useRef<Record<string, string>>({});

  // Keep refs in sync
  draftIdRef.current = draftId;
  deviceIdsRef.current = deviceIds;

  const saveTimerParent = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveTimerDevices = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // ─── Restore from localStorage ──────────────────────────
  useEffect(() => {
    const id = localStorage.getItem(LS_KEY_ID);
    const version = localStorage.getItem(LS_KEY_VERSION);

    // Restore step
    const savedStep = localStorage.getItem(LS_KEY_STEP);
    if (savedStep) setStep(parseInt(savedStep, 10) || 1);

    // Restore extra fields not stored in backend
    let extra: Record<string, any> = {};
    try {
      const raw = localStorage.getItem(LS_KEY_EXTRA);
      if (raw) extra = JSON.parse(raw);
    } catch {}

    if (id && version === "2") {
      setDraftId(id);
      // Restore data from server
      fetch(`/api/declarations/draft/${id}`)
        .then((r) => {
          if (!r.ok) {
            // Draft no longer exists on server — clear stale localStorage
            setDraftId(null);
            setStep(1);
            localStorage.removeItem(LS_KEY_ID);
            localStorage.removeItem(LS_KEY_VERSION);
            localStorage.removeItem(LS_KEY_STEP);
            localStorage.removeItem(LS_KEY_EXTRA);
            return null;
          }
          return r.json();
        })
        .then((data) => {
          if (!data) return;
          const devices = (data.daeDevices || []).map((d: any) =>
            deserializeDevice(d),
          );
          const devMap: Record<string, string> = {};
          devices.forEach((d: DaeDeviceFormState) => {
            if (d.id) devMap[d.localId] = d.id;
          });
          setDeviceIds(devMap);
          setFormData({
            exptNom: data.exptNom || "",
            exptPrenom: data.exptPrenom || "",
            exptRais: data.exptRais || "",
            exptSiren: data.exptSiren || "",
            exptSiret: data.exptSiret || "",
            exptTel1: data.exptTel1 || "",
            exptTel1Prefix: data.exptTel1Prefix || extra.exptTel1Prefix || "fr",
            exptEmail: data.exptEmail || "",
            exptNum: data.exptNum || "",
            exptVoie: data.exptVoie || "",
            exptCp: data.exptCp || "",
            exptCom: data.exptCom || "",
            exptComplement: extra.exptComplement || "",
            exptType: data.exptType || "",
            exptInsee: data.exptInsee || "",
            nomEtablissement: data.nomEtablissement || "",
            typeERP: data.typeERP || "non-erp",
            categorieERP: data.categorieERP || "cat-1",
            adrNum: data.adrNum || "",
            adrVoie: data.adrVoie || "",
            codePostal: data.codePostal || "",
            ville: data.ville || "",
            latCoor1: data.latCoor1 ?? null,
            longCoor1: data.longCoor1 ?? null,
            xyPrecis: data.xyPrecis ?? null,
            tel1: data.tel1 || "",
            tel1Prefix: data.tel1Prefix || extra.tel1Prefix || "fr",
            tel2: data.tel2 || "",
            tel2Prefix: data.tel2Prefix || extra.tel2Prefix || "fr",
            siteEmail: data.siteEmail || "",
            adrComplement: data.adrComplement || "",
            codeInsee: data.codeInsee || "",
            daeDevices: devices.length > 0 ? devices : [createEmptyDevice(0)],
          });
        })
        .catch(() => {
          // Network error — clear stale state
          setDraftId(null);
          setStep(1);
          localStorage.removeItem(LS_KEY_ID);
          localStorage.removeItem(LS_KEY_VERSION);
          localStorage.removeItem(LS_KEY_STEP);
          localStorage.removeItem(LS_KEY_EXTRA);
        });
    } else if (id && !version) {
      // v1 migration: old flat format → clear and restart
      localStorage.removeItem(LS_KEY_ID);
      localStorage.removeItem(LS_KEY_DATA);
    }
  }, []);

  // ─── Link draft to user on login ─────────────────────────
  useEffect(() => {
    if (user && draftId) {
      apiFetch(`/api/declarations/draft/${draftId}/link`, {
        method: "POST",
        silent: true,
      }).catch(() => {});
    }
  }, [user, draftId]);

  // ─── Persist extra fields (not in backend) to localStorage ──
  const persistExtra = useCallback((data: DeclarationFormState) => {
    localStorage.setItem(
      LS_KEY_EXTRA,
      JSON.stringify({
        exptTel1Prefix: data.exptTel1Prefix,
        exptComplement: data.exptComplement,
        tel1Prefix: data.tel1Prefix,
        tel2Prefix: data.tel2Prefix,
      }),
    );
  }, []);

  // ─── Auto-save parent fields ────────────────────────────
  const saveParent = useCallback(
    (data: DeclarationFormState, currentDraftId: string | null) => {
      if (saveTimerParent.current) clearTimeout(saveTimerParent.current);

      // Always persist extra fields immediately
      persistExtra(data);

      saveTimerParent.current = setTimeout(async () => {
        const { daeDevices, ...parentFields } = data;
        // Fields stored only in localStorage, not accepted by backend DTO
        const LOCAL_ONLY = new Set(["exptComplement"]);
        // Strip empty strings and local-only fields
        const payload: Record<string, any> = {};
        for (const [k, v] of Object.entries(parentFields)) {
          if (v !== "" && v !== null && !LOCAL_ONLY.has(k)) payload[k] = v;
        }

        try {
          if (!currentDraftId) {
            const res = await fetch(`/api/declarations/draft`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
            if (res.ok) {
              const result = await res.json();
              setDraftId(result.id);
              localStorage.setItem(LS_KEY_ID, result.id);
              localStorage.setItem(LS_KEY_VERSION, "2");
              // Store initial device ID
              if (result.deviceId && data.daeDevices[0]) {
                setDeviceIds((prev) => ({
                  ...prev,
                  [data.daeDevices[0].localId]: result.deviceId,
                }));
              }
            }
          } else {
            await fetch(`/api/declarations/draft/${currentDraftId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
          }
        } catch {
          // silent
        }
      }, 1000);
    },
    [],
  );

  // ─── Auto-save device fields ────────────────────────────
  const saveDevice = useCallback(
    (
      device: DaeDeviceFormState,
      currentDraftId: string | null,
      serverId: string | undefined,
    ) => {
      if (!currentDraftId) return;

      const key = device.localId;
      if (saveTimerDevices.current[key]) {
        clearTimeout(saveTimerDevices.current[key]);
      }

      saveTimerDevices.current[key] = setTimeout(async () => {
        const payload = serializeDevice(device);

        try {
          if (serverId) {
            await fetch(
              `/api/declarations/draft/${currentDraftId}/devices/${serverId}`,
              {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              },
            );
          } else {
            const res = await fetch(
              `/api/declarations/draft/${currentDraftId}/devices`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              },
            );
            if (res.ok) {
              const result = await res.json();
              setDeviceIds((prev) => ({ ...prev, [key]: result.id }));
            }
          }
        } catch {
          // silent
        }
      }, 1000);
    },
    [],
  );

  // ─── Field change handlers ──────────────────────────────
  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      saveParent(next, draftIdRef.current);
      return next;
    });
  };

  const handleBatchChange = (fields: Record<string, any>) => {
    setFormData((prev) => {
      const next = { ...prev, ...fields };
      saveParent(next, draftIdRef.current);
      return next;
    });
  };

  const handleDeviceChange = (localId: string, field: string, value: any) => {
    setFormData((prev) => {
      const devices = prev.daeDevices.map((d) =>
        d.localId === localId ? { ...d, [field]: value } : d,
      );
      const updated = devices.find((d) => d.localId === localId);
      if (updated) {
        saveDevice(updated, draftIdRef.current, deviceIdsRef.current[localId]);
      }
      return { ...prev, daeDevices: devices };
    });
  };

  const handleAddDevice = async (): Promise<string> => {
    const newDevice = createEmptyDevice(formData.daeDevices.length);
    setFormData((prev) => ({
      ...prev,
      daeDevices: [...prev.daeDevices, newDevice],
    }));

    // Create on server if draft exists
    if (draftId) {
      try {
        const res = await fetch(
          `/api/declarations/draft/${draftId}/devices`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ position: formData.daeDevices.length }),
          },
        );
        if (res.ok) {
          const result = await res.json();
          setDeviceIds((prev) => ({ ...prev, [newDevice.localId]: result.id }));
        }
      } catch {
        // silent
      }
    }

    return newDevice.localId;
  };

  const handleRemoveDevice = async (localId: string) => {
    if (formData.daeDevices.length <= 1) return;

    const serverId = deviceIds[localId];

    setFormData((prev) => ({
      ...prev,
      daeDevices: prev.daeDevices.filter((d) => d.localId !== localId),
    }));

    setDeviceIds((prev) => {
      const next = { ...prev };
      delete next[localId];
      return next;
    });

    // Delete from server
    if (draftId && serverId) {
      try {
        await fetch(
          `/api/declarations/draft/${draftId}/devices/${serverId}`,
          { method: "DELETE" },
        );
      } catch {
        // silent
      }
    }
  };

  // ─── Step validation ─────────────────────────────────────
  const validateStep = (s: number): string[] => {
    const errors: string[] = [];
    if (s === 1) {
      if (!formData.exptRais?.trim()) errors.push("Raison sociale requise");
      if (!formData.exptSiren?.trim()) errors.push("SIREN requis");
      if (!formData.exptNom?.trim()) errors.push("Nom du contact requis");
      if (!formData.exptPrenom?.trim()) errors.push("Prénom du contact requis");
      if (!formData.exptEmail?.trim()) errors.push("Email requis");
      if (!formData.exptTel1?.trim()) errors.push("Téléphone requis");
    } else if (s === 2) {
      if (!formData.adrVoie?.trim()) errors.push("Adresse du site requise");
      if (!formData.codePostal?.trim()) errors.push("Code postal requis");
      if (!formData.ville?.trim()) errors.push("Ville requise");
      if (!formData.tel1?.trim()) errors.push("Téléphone sur site requis");
    } else if (s === 3) {
      formData.daeDevices.forEach((d, i) => {
        const missing: string[] = [];
        if (!d.nom?.trim()) missing.push("nom");
        if (!d.fabRais?.trim()) missing.push("fabricant");
        if (!d.modele?.trim()) missing.push("modèle");
        if (!d.numSerie?.trim()) missing.push("n° série");
        if (!d.etatFonct?.trim()) missing.push("état de fonctionnement");
        if (!d.acc?.trim()) missing.push("environnement");
        if (!d.accLib?.trim()) missing.push("accès libre");
        if (!d.daeMobile?.trim()) missing.push("DAE itinérant");
        if (!d.dispJ || d.dispJ.length === 0) missing.push("jours de disponibilité");
        if (!d.dispH || d.dispH.length === 0) missing.push("heures de disponibilité");
        if (missing.length > 0) {
          errors.push(`DAE ${i + 1} (${d.nom?.trim() || "sans nom"}) : ${missing.join(", ")}`);
        }
      });
    }
    return errors;
  };

  const formTopRef = useRef<HTMLDivElement>(null);

  const goToStep = (s: number, skipValidation = false) => {
    // Going forward: validate all steps up to (but not including) the target
    if (!skipValidation && s > step) {
      for (let i = step; i < s; i++) {
        const errors = validateStep(i);
        if (errors.length > 0) {
          setStep(i);
          localStorage.setItem(LS_KEY_STEP, String(i));
          setStepErrors(errors);
          setTimeout(() => {
            formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 50);
          return;
        }
      }
    }
    setStepErrors([]);
    setStep(s);
    localStorage.setItem(LS_KEY_STEP, String(s));
    if (s === 4 && !accountEmail) {
      setAccountEmail(formData.exptEmail);
    }
    setTimeout(() => {
      formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const handleNext = () => {
    const errors = validateStep(step);
    setStepErrors(errors);
    if (errors.length === 0) {
      goToStep(step + 1, true);
    }
  };

  // ─── Submit ─────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!draftId) return;
    setStepErrors([]);

    // Validate all steps before submitting
    for (let i = 1; i <= 3; i++) {
      const errors = validateStep(i);
      if (errors.length > 0) {
        setStepErrors(errors);
        return;
      }
    }

    // Validate RGPD consent
    if (!consentRgpd) {
      setStepErrors(["Vous devez accepter la politique de confidentialite pour soumettre votre declaration."]);
      return;
    }

    // Validate account if not logged in
    if (!user) {
      const accountErrors: string[] = [];
      if (!accountEmail?.trim()) accountErrors.push("Email requis pour enregistrer votre demande");
      if (!password || password.length < 12) accountErrors.push("Le mot de passe doit contenir au moins 12 caractères");
      if (accountErrors.length > 0) {
        setStepErrors(accountErrors);
        return;
      }

      // Create account
      try {
        await register(accountEmail, password);
      } catch {
        setStepErrors(["Cette adresse email est déjà associée à un compte. Cliquez sur « J'ai déjà un compte » pour vous connecter."]);
        return;
      }
    }

    setSubmitting(true);
    try {
      // Flush all pending device saves before submitting — the 1s debounce
      // may not have fired yet, leaving the backend with stale data.
      for (const key of Object.keys(saveTimerDevices.current)) {
        clearTimeout(saveTimerDevices.current[key]);
      }
      if (saveTimerParent.current) clearTimeout(saveTimerParent.current);

      await Promise.all(
        formData.daeDevices.map(async (device) => {
          const serverId = deviceIdsRef.current[device.localId];
          if (!serverId) return;
          const payload = serializeDevice(device);
          await fetch(
            `/api/declarations/draft/${draftId}/devices/${serverId}`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            },
          );
        }),
      );

      const res = await apiFetch(
        `/api/declarations/draft/${draftId}/complete`,
        { method: "POST" },
      );

      if (res.ok) {
        setSubmitted(true);
        localStorage.removeItem(LS_KEY_ID);
        localStorage.removeItem(LS_KEY_DATA);
        localStorage.removeItem(LS_KEY_VERSION);
        localStorage.removeItem(LS_KEY_DEVICES);
        localStorage.removeItem(LS_KEY_STEP);
        localStorage.removeItem(LS_KEY_EXTRA);
        toast.success(
          "Déclaration soumise avec succès ! Notre équipe va la traiter et vous recevrez votre attestation de conformité.",
        );
      } else {
        const err = await res.json().catch(() => null);
        toast.error(
          err?.message ||
            "Erreur lors de la soumission. Veuillez vérifier les champs obligatoires.",
        );
      }
    } catch {
      toast.error("Erreur de connexion. Réessayez plus tard.");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Reset after submission ─────────────────────────────
  if (submitted) {
    return (
      <div className="border border-[#18753C] bg-[#e8f5e9] rounded-sm p-8 text-center">
        <div className="w-16 h-16 bg-[#18753C] rounded-full flex items-center justify-center mx-auto mb-4">
          <Send className="w-7 h-7 text-white" />
        </div>
        <h3 className="font-heading font-bold text-xl text-[#161616] mb-2">
          Déclaration envoyée !
        </h3>
        <p className="text-[#666] text-sm mb-6 max-w-md mx-auto">
          Votre déclaration de {formData.daeDevices.length} défibrillateur
          {formData.daeDevices.length > 1 ? "s" : ""} a été soumise avec
          succès. Notre équipe va la traiter et vous accompagner jusqu'à
          l'obtention de votre attestation de conformité Géo'DAE.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="/dashboard/mes-declarations"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-sm bg-[#18753C] hover:bg-[#18753C]/90 text-white text-sm font-medium transition-colors"
          >
            Suivre ma déclaration
          </a>
          <Button
            onClick={() => {
              setSubmitted(false);
              setDraftId(null);
              setDeviceIds({});
              setFormData(INITIAL_FORM_DATA);
              setStep(1);
            }}
            variant="outline"
            className="text-[#000091] border-[#000091] hover:bg-[#000091]/5"
          >
            Nouvelle déclaration
          </Button>
        </div>
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────
  return (
    <>
    <DeclarationLayout
      sidebar={<DeclarationPreview data={formData} currentStep={step} onGoToStep={goToStep} />}
    >
      <div ref={formTopRef} className="border border-[#CECECE] rounded-sm bg-white shadow-sm overflow-hidden scroll-mt-20">
        <div className="p-5 sm:p-6">
          <DeclarationStepper currentStep={step} />

          {/* Step content */}
          <div className="min-h-[300px]">
            {step === 1 && (
              <Step1Exploitant
                data={formData}
                onChange={handleFieldChange}
                onBatchChange={handleBatchChange}
              />
            )}
            {step === 2 && (
              <Step2SiteLocalisation
                data={formData}
                onChange={handleFieldChange}
                onBatchChange={handleBatchChange}
              />
            )}
            {step === 3 && (
              <Step3Defibrillateurs
                devices={formData.daeDevices}
                siteLat={formData.latCoor1}
                siteLng={formData.longCoor1}
                onDeviceChange={handleDeviceChange}
                onAddDevice={handleAddDevice}
                onRemoveDevice={handleRemoveDevice}
              />
            )}
            {step === 4 && (
              <Step4Recapitulatif
                data={formData}
                email={accountEmail}
                password={password}
                onEmailChange={setAccountEmail}
                onPasswordChange={setPassword}
                onOpenAuth={() => setAuthOpen(true)}
                consentRgpd={consentRgpd}
                onConsentRgpdChange={setConsentRgpd}
              />
            )}
          </div>

          {/* Validation errors */}
          {stepErrors.length > 0 && (
            <div className="mt-4 rounded-sm border border-[#E1000F]/30 bg-[#E1000F]/5 px-4 py-3">
              <p className="text-sm font-semibold text-[#E1000F] mb-1">
                Veuillez compléter les champs obligatoires :
              </p>
              <ul className="list-disc list-inside text-xs text-[#E1000F]/80 space-y-0.5">
                {stepErrors.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-[#E5E5E5]">
            {step > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => { setStepErrors([]); goToStep(step - 1); }}
                className="text-[#000091] border-[#000091] hover:bg-[#000091]/5"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Précédent
              </Button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="bg-[#000091] hover:bg-[#000091]/90 text-white"
              >
                Suivant
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-[#18753C] hover:bg-[#18753C]/90 text-white"
              >
                {submitting ? (
                  "Envoi en cours..."
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Soumettre la déclaration
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </DeclarationLayout>

    <AuthDialog open={authOpen} onOpenChange={setAuthOpen} skipRedirect />
    </>
  );
}
