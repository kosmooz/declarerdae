/**
 * Déduit l'étape du formulaire à partir des données de la souscription.
 *
 * - Étape 4 : Signature faite (SIGNED / ACTIVE)
 * - Étape 3 : En cours de signature (PENDING_SIGNATURE ou signatureRequestId présent)
 * - Étape 2 : Infos client remplies (nom, prénom, email, mobile, adresse install)
 * - Étape 1 : Brouillon initial (juste la quantité)
 */
export function computeStep(sub: {
  status: string;
  signatureRequestId?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  mobile?: string | null;
  installAddress?: string | null;
  installPostalCode?: string | null;
  installCity?: string | null;
}): number {
  // Step 4: Signature completed
  if (sub.status === "SIGNED" || sub.status === "ACTIVE") return 4;

  // Step 3: In signing process
  if (sub.status === "PENDING_SIGNATURE" || sub.signatureRequestId) return 3;

  // Step 2: Identity fields filled
  if (
    sub.firstName?.trim() &&
    sub.lastName?.trim() &&
    sub.email?.trim() &&
    sub.mobile?.trim() &&
    sub.installAddress?.trim() &&
    sub.installPostalCode?.trim() &&
    sub.installCity?.trim()
  ) {
    return 2;
  }

  // Step 1: Default
  return 1;
}
