"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AgeGate() {
  const [verified, setVerified] = useState(true);
  const yesRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("pb_age_verified");
      if (!stored) {
        setVerified(false);
      }
    } catch {
      setVerified(false);
    }
  }, []);

  useEffect(() => {
    if (!verified) {
      const timer = setTimeout(() => yesRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [verified]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key !== "Tab" || !dialogRef.current) return;

    const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, []);

  useEffect(() => {
    if (verified) return;
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [verified, handleKeyDown]);

  function handleYes() {
    try {
      localStorage.setItem("pb_age_verified", "true");
    } catch {
      // localStorage blocked — still allow through
    }
    setVerified(true);
  }

  function handleNo() {
    window.location.href = "https://www.google.com";
  }

  return (
    <AnimatePresence>
      {!verified && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="age-gate-title"
            className="bg-pb-bg-secondary rounded-2xl border border-pb-border p-8 max-w-sm w-full text-center"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2
              id="age-gate-title"
              className="text-pb-text-primary font-heading text-2xl font-bold"
            >
              Are you 18 or older?
            </h2>
            <p className="text-pb-text-secondary text-sm mt-2">
              You must be 18+ to use this site.
            </p>

            <div className="flex gap-3 mt-6">
              <button
                ref={yesRef}
                type="button"
                onClick={handleYes}
                className="flex-1 bg-pb-accent text-pb-bg-primary font-semibold py-2.5 rounded-lg hover:opacity-90 transition-opacity text-sm"
              >
                Yes, I'm 18+
              </button>
              <button
                type="button"
                onClick={handleNo}
                className="flex-1 bg-pb-bg-tertiary text-pb-text-secondary border border-pb-border font-semibold py-2.5 rounded-lg hover:text-pb-text-primary transition-colors text-sm"
              >
                No
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
