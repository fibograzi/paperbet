"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Triangle, TrendingUp, Grid3x3 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { GAMES } from "@/lib/constants";
import { Game } from "@/lib/types";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Triangle,
  TrendingUp,
  Grid3x3,
};

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileNav({ isOpen, onClose }: MobileNavProps) {
  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-pb-bg-primary backdrop-blur-lg"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "tween", duration: 0.3 }}
        >
          {/* Top bar */}
          <div className="flex justify-between items-center p-4">
            <Link href="/" onClick={onClose} className="flex items-center">
              <Image
                src="/logos/header-logo.png"
                alt="PaperBet.io"
                width={180}
                height={40}
                className="h-8 w-auto"
              />
            </Link>
            <button
              onClick={onClose}
              className="text-pb-text-secondary hover:text-pb-text-primary transition-colors cursor-pointer"
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="px-4 mt-8">
            {/* Main links */}
            <Link
              href="/blog"
              onClick={onClose}
              className="block text-2xl font-heading font-semibold text-pb-text-primary py-3 border-b border-pb-border hover:text-pb-accent transition-colors"
            >
              Strategy Hub
            </Link>
            <Link
              href="/deals"
              onClick={onClose}
              className="block text-2xl font-heading font-semibold text-pb-text-primary py-3 border-b border-pb-border hover:text-pb-accent transition-colors"
            >
              Deals
            </Link>

            {/* Games section */}
            <div className="mt-8">
              <h3 className="text-pb-text-muted text-sm uppercase tracking-wider font-heading font-semibold mb-4">
                Games
              </h3>
              <div className="flex flex-col gap-2">
                {GAMES.map((game: Game) => {
                  const Icon = iconMap[game.icon];
                  const content = (
                    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-pb-bg-secondary transition-colors">
                      {Icon && (
                        <Icon className="h-5 w-5 shrink-0 text-pb-text-secondary" />
                      )}
                      <span className="text-pb-text-primary text-lg font-medium flex-1">
                        {game.name}
                      </span>
                      <Badge variant={game.available ? "success" : "muted"}>
                        {game.available ? "Live" : "Coming Soon"}
                      </Badge>
                    </div>
                  );

                  return game.available ? (
                    <Link
                      key={game.id}
                      href={`/${game.slug}`}
                      onClick={onClose}
                    >
                      {content}
                    </Link>
                  ) : (
                    <div key={game.id} className="opacity-60 cursor-default">
                      {content}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="mt-12">
              <Button
                variant="primary"
                size="lg"
                href="/deals"
                className="w-full"
                onClick={onClose}
              >
                Spin the Wheel &rarr;
              </Button>
            </div>
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
