import React from "react";

type BadgeVariant = "success" | "warning" | "info" | "muted";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: "bg-pb-accent/10 text-pb-accent border-pb-accent/20",
  warning: "bg-pb-warning/10 text-pb-warning border-pb-warning/20",
  info: "bg-pb-accent-secondary/10 text-pb-accent-secondary border-pb-accent-secondary/20",
  muted: "bg-pb-bg-tertiary text-pb-text-muted border-pb-border",
};

export default function Badge({
  variant = "success",
  children,
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={[
        "rounded-full text-xs font-medium px-3 py-1 border inline-flex items-center gap-1",
        variantClasses[variant],
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </span>
  );
}
