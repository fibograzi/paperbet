"use client";

import { useState, useCallback } from "react";
import type { DealWheelState } from "./dealWheelTypes";
import { FREE_SPINS } from "./dealWheelEngine";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface DealWheelControlsProps {
  state: DealWheelState;
  canSpin: boolean;
  onSpin: () => void;
  onSubmitEmail: (email: string) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DealWheelControls({
  state,
  canSpin,
  onSpin,
  onSubmitEmail,
}: DealWheelControlsProps) {
  const { phase, email, stats } = state;
  const [emailInput, setEmailInput] = useState("");
  const [emailError, setEmailError] = useState("");

  const freeSpinsLeft = Math.max(0, FREE_SPINS - stats.freeSpinsUsed);
  const bonusSpinsLeft = stats.emailSpinsRemaining;
  const allUsed = freeSpinsLeft === 0 && bonusSpinsLeft === 0;
  const needsEmail = allUsed && !email.captured;

  // -----------------------------------------------------------------------
  // Email submit
  // -----------------------------------------------------------------------

  const handleEmailSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setEmailError("");

      const trimmed = emailInput.trim();
      if (!trimmed) {
        setEmailError("Email is required");
        return;
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(trimmed)) {
        setEmailError("Please enter a valid email");
        return;
      }

      onSubmitEmail(trimmed);
    },
    [emailInput, onSubmitEmail]
  );

  // -----------------------------------------------------------------------
  // Spin button state
  // -----------------------------------------------------------------------

  let buttonText = "SPIN THE WHEEL";
  let buttonEnabled = canSpin;
  let buttonSubtext = "Press spacebar";
  let showPulse = canSpin;

  if (phase === "spinning") {
    buttonText = "SPINNING...";
    buttonEnabled = false;
    buttonSubtext = "";
    showPulse = false;
  } else if (needsEmail) {
    buttonText = "UNLOCK MORE SPINS";
    buttonEnabled = true; // Clicks to show email form
    buttonSubtext = "";
    showPulse = true;
  } else if (allUsed && email.captured) {
    buttonText = "ALL SPINS USED";
    buttonEnabled = false;
    buttonSubtext = "Come back tomorrow";
    showPulse = false;
  }

  const handleButtonClick = () => {
    if (needsEmail) {
      // Scroll to / reveal the email form — don't submit
      const formEl = document.getElementById("deal-wheel-email-form");
      formEl?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (canSpin) onSpin();
  };

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* 1. Spin Status */}
      <div className="bg-pb-bg-secondary border border-pb-border rounded-xl p-4">
        <h3 className="text-sm font-heading font-semibold text-pb-text-secondary mb-3">
          Spin Status
        </h3>
        <div className="space-y-2">
          {/* Free spins */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-pb-text-secondary">Free Spin</span>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: FREE_SPINS }).map((_, i) => (
                <div
                  key={`free-${i}`}
                  className="w-3 h-3 rounded-full border-2"
                  style={{
                    borderColor: "#00E5A0",
                    backgroundColor:
                      i < stats.freeSpinsUsed
                        ? "#00E5A0"
                        : "transparent",
                  }}
                />
              ))}
              <span className="text-xs text-pb-text-muted ml-1">
                {freeSpinsLeft} left
              </span>
            </div>
          </div>

          {/* Bonus spins */}
          {email.captured && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-pb-text-secondary">
                Bonus Spins
              </span>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div
                    key={`bonus-${i}`}
                    className="w-3 h-3 rounded-full border-2"
                    style={{
                      borderColor: "#00B4D8",
                      backgroundColor:
                        i < 2 - bonusSpinsLeft
                          ? "#00B4D8"
                          : "transparent",
                    }}
                  />
                ))}
                <span className="text-xs text-pb-text-muted ml-1">
                  {bonusSpinsLeft} left
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. SPIN Button */}
      <button
        type="button"
        onClick={handleButtonClick}
        disabled={!buttonEnabled && !needsEmail}
        className="relative w-full py-4 rounded-xl font-heading font-bold text-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          backgroundColor: buttonEnabled || needsEmail ? "#00E5A0" : "#374151",
          color: buttonEnabled || needsEmail ? "#0B0F1A" : "#6B7280",
          boxShadow:
            showPulse
              ? "0 0 20px rgba(0, 229, 160, 0.3), 0 0 40px rgba(0, 229, 160, 0.1)"
              : "none",
        }}
      >
        {phase === "spinning" && (
          <span className="inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2 align-middle" />
        )}
        {buttonText}
        {buttonSubtext && (
          <span className="block text-xs font-normal mt-1 opacity-70">
            {buttonSubtext}
          </span>
        )}
      </button>

      {/* 3. Email Form */}
      {(email.showForm || needsEmail) && !email.captured && (
        <div id="deal-wheel-email-form" className="bg-pb-bg-secondary border border-pb-border rounded-xl p-4">
          <h3 className="font-heading font-bold text-pb-text-primary">
            Unlock 2 Bonus Spins
          </h3>
          <p className="text-sm text-pb-text-secondary mt-1">
            Enter your email for 2 more spins + featured deals
          </p>
          <form onSubmit={handleEmailSubmit} className="mt-3 space-y-3">
            <div>
              <input suppressHydrationWarning
                type="email"
                value={emailInput}
                onChange={(e) => {
                  setEmailInput(e.target.value);
                  setEmailError("");
                }}
                placeholder="your@email.com"
                className="w-full bg-pb-bg-tertiary border border-pb-border rounded-lg px-4 py-3 text-sm text-pb-text-primary placeholder:text-pb-text-muted focus:outline-none focus:border-pb-accent transition-colors"
              />
              {emailError && (
                <p className="text-xs text-pb-danger mt-1">{emailError}</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg font-heading font-bold text-sm bg-pb-accent text-pb-bg-primary hover:shadow-[0_0_20px_rgba(0,229,160,0.2)] transition-shadow"
            >
              Unlock Spins
            </button>
          </form>
        </div>
      )}

      {/* Email confirmed */}
      {email.captured && (
        <div className="flex items-center gap-2 bg-pb-bg-secondary border border-pb-border rounded-xl px-4 py-3">
          <span className="text-pb-accent text-lg">&#10003;</span>
          <div>
            <p className="text-sm text-pb-text-primary font-semibold">
              Email registered
            </p>
            <p className="text-xs text-pb-text-muted">
              {email.email
                ? email.email.replace(
                    /^(.{2})(.*)(@.*)$/,
                    (_, a, b, c) => a + "*".repeat(b.length) + c
                  )
                : ""}
            </p>
          </div>
        </div>
      )}

      {/* 4. How It Works */}
      <div className="bg-pb-bg-secondary border border-pb-border rounded-xl p-4">
        <h3 className="text-sm font-heading font-semibold text-pb-text-secondary mb-3">
          How It Works
        </h3>
        <ol className="space-y-2">
          {[
            "One free spin, no email needed",
            "Enter email for 2 bonus spins",
            "Every spin reveals a featured partner offer",
          ].map((text, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-pb-text-primary">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-pb-bg-tertiary flex items-center justify-center text-xs font-bold text-pb-text-secondary">
                {i + 1}
              </span>
              {text}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
