"use client";

import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/utils";

interface RealMoneyDisplayProps {
  totalWagered: number;
  totalReturns: number;
  netProfit: number;
  visible: boolean;
  topCasino?: { name: string; color: string; offer: string; url: string; termsUrl?: string };
}

export default function RealMoneyDisplay({
  totalWagered,
  totalReturns,
  netProfit,
  visible,
  topCasino,
}: RealMoneyDisplayProps) {
  if (!visible) return null;

  const profitColor = netProfit >= 0 ? "text-pb-accent" : "text-pb-danger";
  const profitPrefix = netProfit > 0 ? "+" : "";

  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="bg-pb-bg-secondary border-2 border-pb-accent rounded-xl p-6"
    >
      <p className="text-base text-pb-text-secondary">
        If you played with real money...
      </p>

      <p className="font-mono-stats text-2xl text-pb-text-primary mt-3">
        {formatCurrency(totalWagered)} wagered &rarr; {formatCurrency(totalReturns)} returned
      </p>

      <p className={`font-mono-stats text-3xl font-bold mt-2 ${profitColor}`}>
        {profitPrefix}{formatCurrency(netProfit)}
      </p>

      <p className="text-xs text-pb-text-muted mt-3 leading-relaxed">
        Simulator results only. Real gambling involves risk — most players lose money over time.
      </p>

      {topCasino && (
        <div className="mt-4 pt-4 border-t border-pb-border">
          <p className="text-[11px] text-pb-text-muted uppercase tracking-wider mb-2">
            Crypto Casino Partner Offer
          </p>
          <p className="text-sm text-pb-text-secondary">
            <span className="font-semibold" style={{ color: topCasino.color }}>
              {topCasino.name}
            </span>
            {" — "}
            {topCasino.offer}
          </p>
          <a
            href={topCasino.url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="inline-block mt-2 text-sm text-pb-accent hover:underline"
          >
            View Offer &rarr;
          </a>
          {topCasino.termsUrl && (
            <a
              href={topCasino.termsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-[11px] text-pb-text-muted hover:underline mt-1"
            >
              T&amp;Cs apply
            </a>
          )}
        </div>
      )}
    </motion.div>
  );
}
