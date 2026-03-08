"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { ChevronDown, ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";

// ---------------------------------------------------------------------------
// AnimatedSection — scroll-triggered fade-in
// ---------------------------------------------------------------------------

export function AnimatedSection({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

// ---------------------------------------------------------------------------
// ScrollIndicator — bouncing chevron
// ---------------------------------------------------------------------------

export function ScrollIndicator() {
  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <ChevronDown className="w-6 h-6 text-pb-text-muted" />
      </motion.div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// EmailCapture — final CTA form
// ---------------------------------------------------------------------------

export function EmailCapture() {
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  if (emailSubmitted) {
    return (
      <p className="text-pb-accent font-medium mt-8 text-lg">
        Thanks! You&apos;re on the list.
      </p>
    );
  }

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setEmailSubmitted(true);
        }}
        className="flex flex-col sm:flex-row gap-3 mt-8 max-w-md mx-auto"
      >
        <input
          type="email"
          name="email"
          required
          aria-label="Email address"
          placeholder="Enter your email"
          className="flex-1 bg-pb-bg-tertiary border border-pb-border rounded-lg px-4 py-3 text-pb-text-primary placeholder:text-pb-text-muted focus:outline-none focus:ring-2 focus:ring-pb-accent/50 focus:border-pb-accent transition-all"
        />
        <Button variant="primary" size="md" type="submit">
          Get Access
        </Button>
      </form>

      <Link
        href="/plinko"
        className="inline-flex items-center gap-1 text-pb-text-secondary hover:text-pb-accent text-sm mt-6 transition-colors"
      >
        Or start playing now <ArrowRight className="w-4 h-4" />
      </Link>
    </>
  );
}
