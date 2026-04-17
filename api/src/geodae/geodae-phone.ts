/**
 * Phone number conversion for GéoDAE API.
 *
 * GéoDAE expects E.164 format matching:
 * /^(\+33|\+590|\+594|\+262|\+596|\+269|\+687|\+689|\+508|\+681)(\d){9}$/
 */

/** ISO country code → international dial code (digits only) */
const DIAL_CODES: Record<string, string> = {
  fr: "33",
  re: "262", // Réunion
  gp: "590", // Guadeloupe
  gf: "594", // Guyane
  mq: "596", // Martinique
  yt: "269", // Mayotte
  nc: "687", // Nouvelle-Calédonie
  pf: "689", // Polynésie française
  pm: "508", // Saint-Pierre-et-Miquelon
  wf: "681", // Wallis-et-Futuna
  bl: "590", // Saint-Barthélemy
  mf: "590", // Saint-Martin
};

/**
 * Convert a local phone number + ISO prefix code to E.164 format.
 *
 * @param number  Local phone number (e.g. "0612345678")
 * @param prefixCode  ISO 3166-1 alpha-2 lowercase (e.g. "fr", "re")
 * @returns E.164 string (e.g. "+33612345678") or null
 */
export function toE164(
  number: string | null | undefined,
  prefixCode: string | null | undefined,
): string | null {
  if (!number) return null;

  const dialCode = prefixCode ? DIAL_CODES[prefixCode] : "33";
  if (!dialCode) return null;

  // Remove spaces, dashes, dots, parentheses
  let cleaned = number.replace(/[\s\-\.\(\)]/g, "");

  // If already in E.164, return as-is
  if (cleaned.startsWith("+")) return cleaned;

  // Remove leading 0 (local format)
  if (cleaned.startsWith("0")) {
    cleaned = cleaned.slice(1);
  }

  return `+${dialCode}${cleaned}`;
}
