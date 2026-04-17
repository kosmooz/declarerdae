"use client";

import { resetConsent } from "@/lib/cookie-consent";

export default function CookieSettingsButton() {
  return (
    <button
      type="button"
      onClick={() => resetConsent()}
      className="text-xs text-gray-500 hover:text-white transition-colors cursor-pointer"
    >
      Gerer mes cookies
    </button>
  );
}
