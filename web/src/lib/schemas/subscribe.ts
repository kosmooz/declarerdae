import { z } from "zod";

// Step 1 — Configuration
export const step1Schema = z.object({
  quantity: z.number().min(1, "Minimum 1 défibrillateur").max(50),
});

// Step 2 — Informations
export const step2Schema = z.object({
  entityType: z.enum(["organisation", "particulier"]),
  companyName: z.string(),
  siret: z.string(),
  companyAddress: z.string(),
  companyPostalCode: z.string(),
  companyCity: z.string(),
  firstName: z.string().min(1, "Prénom requis"),
  lastName: z.string().min(1, "Nom requis"),
  fonction: z.string(),
  mobile: z.string().min(10, "Numéro de téléphone invalide"),
  email: z.string().email("Email invalide"),
  installAddress: z.string().min(1, "Adresse requise"),
  installAddressComplement: z.string(),
  installPostalCode: z.string().min(5, "Code postal requis"),
  installCity: z.string().min(1, "Ville requise"),
});

// Step 3 — Récapitulatif (consentements)
export const step3Schema = z.object({
  acceptTerms: z.literal(true, {
    message: "Vous devez accepter les conditions générales",
  }),
  acceptContract: z.literal(true, {
    message: "Vous devez accepter le contrat",
  }),
  acceptDataProcessing: z.literal(true, {
    message: "Vous devez accepter le traitement des données",
  }),
});

// Step 4 — Signature
export const step4Schema = z.object({
  otp: z.string().length(6, "Code à 6 chiffres requis"),
});

// Combined type
export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type Step3Data = z.infer<typeof step3Schema>;
export type Step4Data = z.infer<typeof step4Schema>;

export type SubscribeFormData = Step1Data & Step2Data & Step3Data & Step4Data;

// Pricing — 89€ TTC est le prix affiché
export const UNIT_PRICE_TTC = 89;
export const TVA_RATE = 0.085; // 8.5% La Réunion
export const UNIT_PRICE_HT = Math.round((UNIT_PRICE_TTC / (1 + TVA_RATE)) * 100) / 100; // ~82.03€

export function calculatePricing(quantity: number) {
  const monthlyTTC = UNIT_PRICE_TTC * quantity;
  const monthlyHT = Math.round((monthlyTTC / (1 + TVA_RATE)) * 100) / 100;
  const yearlyTTC = monthlyTTC * 12;
  const yearlyHT = Math.round((yearlyTTC / (1 + TVA_RATE)) * 100) / 100;
  return { monthlyHT, monthlyTTC, yearlyHT, yearlyTTC };
}
