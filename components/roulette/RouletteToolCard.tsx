"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Play,
  BarChart2,
  Calculator,
  TrendingDown,
  RefreshCw,
  GitBranch,
  BookOpen,
} from "lucide-react";
import type { ComponentType } from "react";

const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  Play,
  BarChart2,
  Calculator,
  TrendingDown,
  RefreshCw,
  GitBranch,
  BookOpen,
};

interface RouletteToolCardProps {
  title: string;
  description: string;
  href: string;
  icon: string;
  badge?: string;
}

export default function RouletteToolCard({
  title,
  description,
  href,
  icon,
  badge,
}: RouletteToolCardProps) {
  const Icon = iconMap[icon];
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Link href={href} className="group block h-full">
        <div className="relative h-full bg-pb-bg-secondary border border-pb-border rounded-xl p-6 transition-all duration-200 group-hover:border-pb-accent/50 group-hover:shadow-lg group-hover:shadow-pb-accent/5">
          {/* Badge */}
          {badge && (
            <span className="absolute top-4 right-4 text-xs font-medium font-mono-stats px-2 py-0.5 rounded-full bg-pb-accent/10 text-pb-accent border border-pb-accent/20">
              {badge}
            </span>
          )}

          {/* Icon */}
          <div className="w-11 h-11 rounded-lg bg-pb-bg-tertiary flex items-center justify-center mb-4 group-hover:bg-pb-accent/10 transition-colors duration-200">
            <Icon className="w-5 h-5 text-pb-accent" />
          </div>

          {/* Title */}
          <h3 className="font-heading font-semibold text-pb-text-primary text-lg mb-2 group-hover:text-pb-accent transition-colors duration-200">
            {title}
          </h3>

          {/* Description */}
          <p className="text-pb-text-secondary text-sm leading-relaxed">
            {description}
          </p>

          {/* Arrow indicator */}
          <div className="mt-4 flex items-center gap-1 text-pb-accent text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <span>Open tool</span>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
