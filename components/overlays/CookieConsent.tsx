"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("pb_cookie_consent");
      if (!stored) {
        setVisible(true);
      }
    } catch {
      // localStorage blocked — don't show banner
    }
  }, []);

  function handleAccept() {
    try {
      localStorage.setItem("pb_cookie_consent", "accepted");
    } catch {
      // ignore
    }
    setVisible(false);
  }

  function handleDecline() {
    try {
      localStorage.setItem("pb_cookie_consent", "declined");
    } catch {
      // ignore
    }
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="region"
          aria-label="Cookie consent"
          className="fixed bottom-0 left-0 right-0 z-[55] bg-pb-bg-secondary border-t border-pb-border p-4"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-pb-text-secondary text-sm text-center sm:text-left">
              We use local storage to save your game progress and preferences. No tracking cookies are used.{" "}
              <Link
                href="/privacy"
                className="text-pb-accent hover:underline"
              >
                Privacy Policy
              </Link>
            </p>
            <div className="flex gap-3 shrink-0">
              <button
                type="button"
                onClick={handleDecline}
                className="border border-pb-border text-pb-text-secondary px-4 py-2 rounded-lg text-sm hover:opacity-80 transition-opacity"
              >
                Decline Optional
              </button>
              <button
                type="button"
                onClick={handleAccept}
                className="bg-pb-accent text-pb-bg-primary px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Accept All
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
