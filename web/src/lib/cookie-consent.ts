const STORAGE_KEY = "cookie-consent";
const CONSENT_VERSION = "1.0";

export interface CookieConsentState {
  essential: boolean;
  maps: boolean;
  version: string;
  date: string;
}

export function getConsent(): CookieConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CookieConsentState;
    if (parsed.version !== CONSENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setConsent(maps: boolean): void {
  const state: CookieConsentState = {
    essential: true,
    maps,
    version: CONSENT_VERSION,
    date: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event("cookie-consent-change"));
}

export function hasConsented(): boolean {
  return getConsent() !== null;
}

export function isMapsAllowed(): boolean {
  const consent = getConsent();
  return consent?.maps ?? false;
}

export function resetConsent(): void {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("cookie-consent-change"));
}
