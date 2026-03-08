export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatMultiplier(mult: number): string {
  return `${mult.toFixed(2)}x`;
}

export function generateId(): string {
  return crypto.randomUUID().slice(0, 8);
}

export function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function getSlotColor(multiplier: number): string {
  if (multiplier >= 100) return "#F59E0B";
  if (multiplier >= 10) return "#EF4444";
  if (multiplier >= 3) return "#F97316";
  if (multiplier >= 1.5) return "#00E5A0";
  if (multiplier >= 1) return "rgba(0, 229, 160, 0.6)";
  if (multiplier >= 0.5) return "#6B7280";
  return "#374151";
}

export function getResultColor(multiplier: number): string {
  if (multiplier >= 100) return "#F59E0B";
  if (multiplier >= 10) return "#EF4444";
  if (multiplier >= 2) return "#F97316";
  if (multiplier >= 1) return "#00E5A0";
  return "#9CA3AF";
}

export type WinTier = "loss" | "normal" | "good" | "big" | "jackpot";

export function getWinTier(multiplier: number): WinTier {
  if (multiplier >= 100) return "jackpot";
  if (multiplier >= 10) return "big";
  if (multiplier >= 2) return "good";
  if (multiplier >= 1) return "normal";
  return "loss";
}

export function hasConsented(): boolean {
  try {
    return localStorage.getItem("pb_cookie_consent") === "accepted";
  } catch {
    return false;
  }
}

export function safeJsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}
