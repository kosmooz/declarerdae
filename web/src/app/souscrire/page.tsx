"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import {
  Step2Data,
  calculatePricing,
} from "@/lib/schemas/subscribe";
import StepperHeader from "@/components/souscrire/StepperHeader";
import SubscribeLayout from "@/components/souscrire/SubscribeLayout";
import OrderSidebar from "@/components/souscrire/OrderSidebar";
import OrderSummaryMobile from "@/components/souscrire/OrderSummaryMobile";
import Step1Configuration from "@/components/souscrire/Step1Configuration";
import Step2Informations from "@/components/souscrire/Step2Informations";
import Step3Recapitulatif from "@/components/souscrire/Step3Recapitulatif";
import Step4Signature from "@/components/souscrire/Step4Signature";
import HelpFloatingButton from "@/components/souscrire/HelpFloatingButton";
import { ArrowLeft } from "lucide-react";

const STORAGE_KEY = "staraid-subscribe";

interface SavedState {
  version: number;
  step: number;
  quantity: number;
  formData: Step2Data;
  consents: { acceptTerms: boolean; acceptContract: boolean; acceptDataProcessing: boolean };
  signatureData: { signatureRequestId: string; signerId: string; signatureLink: string } | null;
  subscriptionId: string | null;
  savedAt: number;
}

const DEFAULT_FORM: Step2Data = {
  entityType: "organisation",
  companyName: "",
  siret: "",
  companyAddress: "",
  companyPostalCode: "",
  companyCity: "",
  firstName: "",
  lastName: "",
  fonction: "",
  mobile: "",
  email: "",
  installAddress: "",
  installAddressComplement: "",
  installPostalCode: "",
  installCity: "",
};

const STATE_VERSION = 3; // Bumped for subscriptionId

function loadSavedState(): SavedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    // Expire after 24h or if version mismatch
    if (
      Date.now() - saved.savedAt > 24 * 60 * 60 * 1000 ||
      saved.version !== STATE_VERSION
    ) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return saved as SavedState;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export default function SouscrirePage() {
  const [hydrated, setHydrated] = useState(false);
  const [step, setStep] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [consents, setConsents] = useState({
    acceptTerms: false,
    acceptContract: false,
    acceptDataProcessing: false,
  });
  const [signatureData, setSignatureData] = useState<{
    signatureRequestId: string;
    signerId: string;
    signatureLink: string;
  } | null>(null);

  const form = useForm<Step2Data>({
    defaultValues: DEFAULT_FORM,
  });

  // Refs for auto-save debounce
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savingRef = useRef(false);
  const subscriptionIdRef = useRef<string | null>(null);

  // Keep ref in sync
  useEffect(() => {
    subscriptionIdRef.current = subscriptionId;
  }, [subscriptionId]);

  // Restore saved state from localStorage after hydration
  useEffect(() => {
    const saved = loadSavedState();
    if (saved) {
      setStep(saved.step);
      setQuantity(saved.quantity);
      setConsents(saved.consents);
      setSignatureData(saved.signatureData);
      setSubscriptionId(saved.subscriptionId);
      form.reset(saved.formData);
    }
    setHydrated(true);
  }, []);

  // Persist state to localStorage on every change
  const persist = useCallback(() => {
    if (!hydrated) return;
    const state: SavedState = {
      version: STATE_VERSION,
      step,
      quantity,
      formData: form.getValues(),
      consents,
      signatureData,
      subscriptionId,
      savedAt: Date.now(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch { /* quota exceeded — ignore */ }
  }, [step, quantity, consents, signatureData, subscriptionId, form, hydrated]);

  useEffect(() => {
    persist();
  }, [persist]);

  // Also persist on form field changes (debounced via watch)
  useEffect(() => {
    const sub = form.watch(() => persist());
    return () => sub.unsubscribe();
  }, [form, persist]);

  // ─── Auto-save to backend (debounced 1s) ────────────────────

  const autoSaveToBackend = useCallback(() => {
    if (!hydrated) return;

    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }

    autoSaveTimer.current = setTimeout(async () => {
      if (savingRef.current) return;
      savingRef.current = true;

      try {
        const formData = form.getValues();

        // Build payload with only non-empty fields (step is computed server-side)
        const payload: Record<string, any> = { quantity };

        if (formData.entityType) payload.entityType = formData.entityType;
        if (formData.companyName?.trim()) payload.companyName = formData.companyName;
        if (formData.siret?.trim()) payload.siret = formData.siret;
        if (formData.companyAddress?.trim()) payload.companyAddress = formData.companyAddress;
        if (formData.companyPostalCode?.trim()) payload.companyPostalCode = formData.companyPostalCode;
        if (formData.companyCity?.trim()) payload.companyCity = formData.companyCity;
        if (formData.firstName?.trim()) payload.firstName = formData.firstName;
        if (formData.lastName?.trim()) payload.lastName = formData.lastName;
        if (formData.fonction?.trim()) payload.fonction = formData.fonction;
        if (formData.mobile?.trim()) payload.mobile = formData.mobile;
        if (formData.email?.trim()) payload.email = formData.email;
        if (formData.installAddress?.trim()) payload.installAddress = formData.installAddress;
        if (formData.installAddressComplement?.trim()) payload.installAddressComplement = formData.installAddressComplement;
        if (formData.installPostalCode?.trim()) payload.installPostalCode = formData.installPostalCode;
        if (formData.installCity?.trim()) payload.installCity = formData.installCity;

        const currentId = subscriptionIdRef.current;

        if (!currentId) {
          // CREATE draft
          const res = await fetch("/api/subscriptions/draft", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (res.ok) {
            const data = await res.json();
            setSubscriptionId(data.id);
          }
        } else {
          // UPDATE draft
          await fetch(`/api/subscriptions/draft/${currentId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        }
      } catch {
        // Silent — don't disturb user
      } finally {
        savingRef.current = false;
      }
    }, 1000);
  }, [hydrated, quantity, form]);

  // Trigger auto-save on quantity changes
  useEffect(() => {
    if (hydrated) autoSaveToBackend();
  }, [quantity, hydrated, autoSaveToBackend]);

  // Trigger auto-save on form field changes
  useEffect(() => {
    const sub = form.watch(() => autoSaveToBackend());
    return () => sub.unsubscribe();
  }, [form, autoSaveToBackend]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, []);

  async function handleStep2Next() {
    const values = form.getValues();
    const errors: Record<string, string> = {};

    if (!values.firstName?.trim()) errors.firstName = "Prénom requis";
    if (!values.lastName?.trim()) errors.lastName = "Nom requis";
    if (!values.mobile || values.mobile.length < 10) errors.mobile = "Numéro invalide";
    if (!values.email || !/\S+@\S+\.\S+/.test(values.email)) errors.email = "Email invalide";
    if (!values.installAddress?.trim()) errors.installAddress = "Adresse requise";
    if (!values.installPostalCode || values.installPostalCode.length < 5) errors.installPostalCode = "Code postal requis";
    if (!values.installCity?.trim()) errors.installCity = "Ville requise";

    if (values.entityType === "organisation") {
      if (!values.companyName?.trim()) errors.companyName = "Raison sociale requise";
      if (!values.siret?.trim()) errors.siret = "SIRET requis";
    }

    if (Object.keys(errors).length > 0) {
      Object.entries(errors).forEach(([field, message]) => {
        form.setError(field as keyof Step2Data, { message });
      });
      return;
    }

    form.clearErrors();
    setStep(3);
  }

  function handleReset() {
    localStorage.removeItem(STORAGE_KEY);
    setStep(1);
    setQuantity(1);
    setConsents({ acceptTerms: false, acceptContract: false, acceptDataProcessing: false });
    setSignatureData(null);
    setSubscriptionId(null);
    form.reset(DEFAULT_FORM);
  }

  async function handleStep3Next() {
    setLoading(true);
    try {
      const formData = form.getValues();
      const { monthlyHT, monthlyTTC } = calculatePricing(quantity);

      const res = await fetch("/api/yousign/signature-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          quantity,
          monthlyPriceHT: monthlyHT.toString(),
          monthlyPriceTTC: monthlyTTC.toFixed(2),
          ...(subscriptionId ? { subscriptionId } : {}),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erreur lors de la création du contrat");
      }

      const data = await res.json();
      setSignatureData({
        signatureRequestId: data.signatureRequestId,
        signerId: data.signerId,
        signatureLink: data.signatureLink,
      });
      setStep(4);
    } catch (err: any) {
      alert(err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Retour au site
          </Link>
          <Link href="/" className="font-bold text-xl text-primary">
            STAR aid
          </Link>
          <div className="w-24" />
        </div>
      </header>

      <StepperHeader currentStep={step} />

      {step > 1 && <OrderSummaryMobile quantity={quantity} />}

      <SubscribeLayout
        sidebar={<OrderSidebar quantity={quantity} />}
      >
        {step === 1 && (
          <Step1Configuration
            quantity={quantity}
            onQuantityChange={setQuantity}
            onNext={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <Step2Informations
            form={form}
            onNext={handleStep2Next}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && (
          <Step3Recapitulatif
            formData={form.getValues()}
            quantity={quantity}
            consents={consents}
            onConsentsChange={setConsents}
            onNext={handleStep3Next}
            onBack={() => setStep(2)}
            loading={loading}
          />
        )}

        {step === 4 && signatureData && (
          <Step4Signature
            signatureRequestId={signatureData.signatureRequestId}
            signerId={signatureData.signerId}
            signatureLink={signatureData.signatureLink}
            onBack={() => setStep(3)}
            onReset={handleReset}
          />
        )}
      </SubscribeLayout>

      <HelpFloatingButton />
    </div>
  );
}
