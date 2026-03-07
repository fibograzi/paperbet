"use client";

import React from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type ButtonBaseProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  href?: string;
  children: React.ReactNode;
};

type ButtonAsButton = ButtonBaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonBaseProps> & {
    href?: undefined;
  };

type ButtonAsLink = ButtonBaseProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonBaseProps> & {
    href: string;
  };

type ButtonProps = ButtonAsButton | ButtonAsLink;

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-pb-accent text-pb-bg-primary font-semibold hover:shadow-[0_0_20px_rgba(0,229,160,0.3)] hover:scale-[1.02]",
  secondary:
    "border border-pb-border text-pb-text-primary hover:border-pb-accent",
  ghost: "text-pb-text-secondary hover:text-pb-text-primary",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};

const Button = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>(({ variant = "primary", size = "md", loading = false, href, children, className, ...props }, ref) => {
  const classes = [
    "rounded-lg transition-all duration-200 font-heading inline-flex items-center justify-center gap-2 cursor-pointer",
    variantClasses[variant],
    sizeClasses[size],
    loading ? "opacity-70 pointer-events-none" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const content = loading ? (
    <>
      <Loader2 className="h-4 w-4 animate-spin" />
      <span className="sr-only">Loading...</span>
    </>
  ) : (
    children
  );

  if (href) {
    return (
      <Link
        href={href}
        ref={ref as React.Ref<HTMLAnchorElement>}
        className={classes}
        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      className={classes}
      disabled={loading || (props as React.ButtonHTMLAttributes<HTMLButtonElement>).disabled}
      {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {content}
    </button>
  );
});

Button.displayName = "Button";

export default Button;
