"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, Triangle, TrendingUp, Grid3x3 } from "lucide-react";
import { GAMES } from "@/lib/constants";
import { Game } from "@/lib/types";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import MobileNav from "./MobileNav";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Triangle,
  TrendingUp,
  Grid3x3,
};

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [gamesOpen, setGamesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close menus on route change
  useEffect(() => {
    setGamesOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setGamesOpen(false);
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href));
  const isGameActive = GAMES.some((g) => pathname.startsWith(`/${g.slug}`));

  return (
    <header className="fixed top-0 w-full bg-pb-bg-secondary/80 backdrop-blur-xl z-50 border-b border-pb-border">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16 lg:h-[72px]">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/logos/header-logo.png"
            alt="PaperBet.io"
            width={180}
            height={40}
            className="h-10 w-auto"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          {/* Games Dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setGamesOpen(!gamesOpen)}
              aria-expanded={gamesOpen}
              aria-label="Games menu"
              className={`flex items-center gap-1 transition-colors text-sm font-medium cursor-pointer ${
                isGameActive
                  ? "text-pb-accent"
                  : "text-pb-text-secondary hover:text-pb-text-primary"
              }`}
            >
              Games
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${gamesOpen ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence>
              {gamesOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-pb-bg-tertiary border border-pb-border rounded-xl p-4 shadow-xl min-w-[280px]"
                >
                  <div className="flex flex-col gap-2">
                    {GAMES.map((game: Game) => {
                      const Icon = iconMap[game.icon];
                      const content = (
                        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-pb-bg-secondary transition-colors">
                          {Icon && (
                            <Icon className="h-5 w-5 shrink-0" />
                          )}
                          <div className="flex-1">
                            <span className="text-pb-text-primary text-sm font-medium">
                              {game.name}
                            </span>
                          </div>
                          <Badge variant={game.available ? "success" : "muted"}>
                            {game.available ? "Live" : "Coming Soon"}
                          </Badge>
                        </div>
                      );

                      return game.available ? (
                        <Link
                          key={game.id}
                          href={`/${game.slug}`}
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link
            href="/blog"
            className={`transition-colors text-sm font-medium ${
              isActive("/blog")
                ? "text-pb-accent"
                : "text-pb-text-secondary hover:text-pb-text-primary"
            }`}
          >
            Strategy Hub
          </Link>

          <Link
            href="/deals"
            className={`transition-colors text-sm font-medium ${
              isActive("/deals")
                ? "text-pb-accent"
                : "text-pb-text-secondary hover:text-pb-text-primary"
            }`}
          >
            Deals
          </Link>
        </nav>

        {/* Desktop CTA */}
        <div className="hidden lg:block">
          <Button variant="primary" size="sm" href="/deals">
            Spin the Wheel &rarr;
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden text-pb-text-secondary hover:text-pb-text-primary transition-colors cursor-pointer"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile Navigation */}
      <MobileNav isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}
