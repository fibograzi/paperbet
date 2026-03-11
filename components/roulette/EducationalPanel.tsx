"use client";

import { Info, AlertTriangle, Lightbulb } from "lucide-react";
import type { ReactNode } from "react";

type Variant = "info" | "warning" | "tip";

interface EducationalPanelProps {
  variant: Variant;
  title: string;
  children: ReactNode;
}

const VARIANT_CONFIG: Record<
  Variant,
  {
    icon: typeof Info;
    containerClass: string;
    iconClass: string;
    titleClass: string;
    borderClass: string;
  }
> = {
  info: {
    icon: Info,
    containerClass: "bg-pb-accent-secondary/10",
    borderClass: "border-pb-accent-secondary/30",
    iconClass: "text-pb-accent-secondary",
    titleClass: "text-pb-accent-secondary",
  },
  warning: {
    icon: AlertTriangle,
    containerClass: "bg-pb-warning/10",
    borderClass: "border-pb-warning/30",
    iconClass: "text-pb-warning",
    titleClass: "text-pb-warning",
  },
  tip: {
    icon: Lightbulb,
    containerClass: "bg-pb-accent/10",
    borderClass: "border-pb-accent/30",
    iconClass: "text-pb-accent",
    titleClass: "text-pb-accent",
  },
};

export default function EducationalPanel({
  variant,
  title,
  children,
}: EducationalPanelProps) {
  const config = VARIANT_CONFIG[variant];
  const Icon = config.icon;

  return (
    <div
      className={`rounded-xl border p-4 ${config.containerClass} ${config.borderClass}`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">
          <Icon className={`w-5 h-5 ${config.iconClass}`} aria-hidden />
        </div>
        <div className="min-w-0">
          <p className={`font-heading font-semibold text-sm mb-1 ${config.titleClass}`}>
            {title}
          </p>
          <div className="text-sm text-pb-text-secondary leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
