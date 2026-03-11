"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function RouletteHubHero() {
  return (
    <section className="relative overflow-hidden py-20 lg:py-28">
      {/* Animated roulette wheel background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <RouletteWheelBg />
      </div>

      {/* Radial gradient overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-radial from-transparent via-pb-bg-primary/60 to-pb-bg-primary"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 0%, rgba(11,15,26,0.65) 55%, #0B0F1A 80%)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
        {/* Label */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <span className="inline-flex items-center gap-2 text-xs font-mono-stats font-semibold uppercase tracking-widest text-pb-accent bg-pb-accent/10 border border-pb-accent/20 rounded-full px-4 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-pb-accent animate-pulse" />
            7 Free Tools
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl text-pb-text-primary leading-tight mb-5"
        >
          Roulette{" "}
          <span className="bg-gradient-to-r from-pb-accent to-pb-accent-secondary bg-clip-text text-transparent">
            Lab
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="text-pb-text-secondary text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          7 free tools to explore roulette math, test strategies, and understand
          the odds. No real money. No risk. Just data.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/roulette/free-play"
            className="inline-flex items-center gap-2 bg-pb-accent text-pb-bg-primary font-heading font-semibold text-sm px-7 py-3.5 rounded-lg hover:bg-pb-accent/90 transition-colors shadow-lg shadow-pb-accent/20"
          >
            Start Playing Free
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
          <Link
            href="/roulette/strategy-tester"
            className="inline-flex items-center gap-2 bg-pb-bg-tertiary text-pb-text-primary font-heading font-semibold text-sm px-7 py-3.5 rounded-lg border border-pb-border hover:border-pb-accent/50 hover:text-pb-accent transition-colors"
          >
            Test a Strategy
          </Link>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-8 mt-14 text-center"
        >
          {[
            { value: "2.7%", label: "European house edge" },
            { value: "5.26%", label: "American house edge" },
            { value: "37", label: "Numbers (European)" },
            { value: "97.3%", label: "Max RTP" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="font-mono-stats font-bold text-2xl text-pb-accent">
                {stat.value}
              </p>
              <p className="text-pb-text-muted text-xs mt-0.5">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function RouletteWheelBg() {
  const segments = 37;
  const radius = 220;
  const cx = 300;
  const cy = 300;

  const segmentAngle = (2 * Math.PI) / segments;

  const paths = Array.from({ length: segments }, (_, i) => {
    const startAngle = i * segmentAngle - Math.PI / 2;
    const endAngle = startAngle + segmentAngle;
    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);
    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;
    const color = i === 0 ? "#00E5A0" : i % 2 === 0 ? "#2d1b1b" : "#1a1a2e";
    return { d, color };
  });

  return (
    <svg
      width="600"
      height="600"
      viewBox="0 0 600 600"
      className="opacity-20"
      style={{ animation: "spin 40s linear infinite" }}
    >
      <style>{`@keyframes spin { from { transform: rotate(0deg); transform-origin: 50% 50%; } to { transform: rotate(360deg); transform-origin: 50% 50%; } }`}</style>
      {paths.map((p, i) => (
        <path key={i} d={p.d} fill={p.color} stroke="#374151" strokeWidth="0.5" />
      ))}
      {/* Inner circle */}
      <circle cx={cx} cy={cy} r={radius * 0.25} fill="#0B0F1A" stroke="#374151" strokeWidth="1" />
      <circle cx={cx} cy={cy} r={radius * 0.28} fill="none" stroke="#00E5A0" strokeWidth="1" opacity="0.4" />
      <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#374151" strokeWidth="2" />
    </svg>
  );
}
