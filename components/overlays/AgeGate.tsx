"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function AgeGate() {
  const [verified, setVerified] = useState(true);
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [error, setError] = useState("");
  const firstSelectRef = useRef<HTMLSelectElement>(null);

  const currentYear = new Date().getFullYear();

  useEffect(() => {
    try {
      const stored = localStorage.getItem("pb_age_verified");
      if (!stored) {
        setVerified(false);
      }
    } catch {
      // localStorage may be blocked — show age gate
      setVerified(false);
    }
  }, []);

  // Focus trap: focus the first select when the gate opens
  useEffect(() => {
    if (!verified) {
      // Short delay to allow animation to start
      const timer = setTimeout(() => firstSelectRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [verified]);

  function handleVerify() {
    setError("");

    if (!day || !month || !year) {
      setError("Please select your full date of birth.");
      return;
    }

    const dayNum = Number(day);
    const monthNum = Number(month);
    const yearNum = Number(year);

    // Validate that the date is real (catches Feb 30, etc.)
    const dob = new Date(yearNum, monthNum - 1, dayNum);
    if (
      isNaN(dob.getTime()) ||
      dob.getDate() !== dayNum ||
      dob.getMonth() !== monthNum - 1 ||
      dob.getFullYear() !== yearNum
    ) {
      setError("Please enter a valid date of birth.");
      return;
    }

    // Reject future dates
    const today = new Date();
    if (dob > today) {
      setError("Please enter a valid date of birth.");
      return;
    }

    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    if (age < 18) {
      setError("You must be 18 or older to use this site.");
      return;
    }

    try {
      localStorage.setItem("pb_age_verified", "true");
    } catch {
      // localStorage blocked — still allow through
    }
    setVerified(true);
  }

  // Handle keyboard: prevent tabbing outside the modal
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Tab") {
      const focusableElements = e.currentTarget.querySelectorAll<HTMLElement>(
        'select, button, [tabindex]:not([tabindex="-1"])'
      );
      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }
  }

  const selectClass =
    "w-full bg-pb-bg-tertiary border border-pb-border text-pb-text-primary rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pb-accent";

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
            role="dialog"
            aria-modal="true"
            aria-labelledby="age-gate-title"
            className="bg-pb-bg-secondary rounded-2xl border border-pb-border p-8 max-w-md w-full"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
            onKeyDown={handleKeyDown}
          >
            <div className="text-center mb-6">
              <h2
                id="age-gate-title"
                className="text-pb-text-primary font-heading text-2xl font-bold"
              >
                PaperBet.io
              </h2>
              <p className="text-pb-text-secondary text-sm mt-2">
                You must be 18+ to use this site
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <select
                ref={firstSelectRef}
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className={selectClass}
                aria-label="Day of birth"
              >
                <option value="">Day</option>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className={selectClass}
                aria-label="Month of birth"
              >
                <option value="">Month</option>
                {months.map((m, i) => (
                  <option key={m} value={i + 1}>
                    {m}
                  </option>
                ))}
              </select>

              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className={selectClass}
                aria-label="Year of birth"
              >
                <option value="">Year</option>
                {Array.from({ length: currentYear - 1920 + 1 }, (_, i) => currentYear - i).map(
                  (y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  )
                )}
              </select>
            </div>

            {error && (
              <p role="alert" className="text-pb-danger text-sm text-center mb-4">{error}</p>
            )}

            <button
              type="button"
              onClick={handleVerify}
              className="w-full bg-pb-accent text-pb-bg-primary font-semibold py-2.5 rounded-lg hover:opacity-90 transition-opacity text-sm"
            >
              Verify Age
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
