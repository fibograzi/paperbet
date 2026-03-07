"use client";

import AgeGate from "./AgeGate";
import CookieConsent from "./CookieConsent";

export default function ClientOverlays() {
  return (
    <>
      <AgeGate />
      <CookieConsent />
    </>
  );
}
