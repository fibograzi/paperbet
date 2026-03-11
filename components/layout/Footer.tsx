import Link from "next/link";
import Image from "next/image";
import { SITE } from "@/lib/constants";

const footerLinks = {
  games: [
    { label: "Plinko Simulator", href: "/plinko" },
    { label: "Crash Simulator", href: "/crash" },
    { label: "Mines Simulator", href: "/mines" },
    { label: "HiLo Simulator", href: "/hilo" },
    { label: "Dice Simulator", href: "/dice" },
    { label: "Limbo Simulator", href: "/limbo" },
    { label: "Keno Simulator", href: "/keno" },
    { label: "Flip Simulator", href: "/flip" },
  ],
  learn: [
    { label: "Plinko Strategy Guide", href: "/blog/plinko-strategy-guide" },
    { label: "Crash Strategy Guide", href: "/blog/crash-strategy-guide" },
    { label: "Mines Strategy Guide", href: "/blog/mines-strategy-guide" },
    { label: "Plinko Risk Levels", href: "/blog/plinko-high-risk-vs-low-risk" },
    { label: "Best Plinko Casinos", href: "/blog/best-crypto-casinos-for-plinko" },
    { label: "Responsible Gambling", href: "/responsible-gambling" },
  ],
  deals: [
    { label: "Spin the Wheel", href: "/deals" },
    { label: "Stake: 200% Match", href: "/deals" },
    { label: "Wild.io: 350% Bonus", href: "/deals" },
    { label: "Rollbit: 15% Rakeback", href: "/deals" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Responsible Gambling", href: "/responsible-gambling" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-pb-bg-secondary border-t border-pb-border">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Column 1: Brand */}
          <div>
            <Link href="/" className="inline-block">
              <Image
                src="/logos/beeldlogo.png"
                alt="PaperBet.io"
                width={80}
                height={80}
                className="w-20 h-20"
              />
            </Link>
            <p className="text-pb-text-secondary text-sm mt-4 font-medium">
              {SITE.tagline}
            </p>
            <p className="text-pb-text-secondary text-sm mt-2 leading-relaxed">
              Free crypto casino simulators. Practice strategies risk-free before playing for real.
            </p>
          </div>

          {/* Column 2: Games */}
          <div>
            <h3 className="text-pb-text-primary font-heading font-semibold text-sm uppercase tracking-wider mb-4">
              Games
            </h3>
            <nav>
              {footerLinks.games.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-pb-text-secondary hover:text-pb-text-primary text-sm py-1.5 block transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 3: Learn */}
          <div>
            <h3 className="text-pb-text-primary font-heading font-semibold text-sm uppercase tracking-wider mb-4">
              Learn
            </h3>
            <nav>
              {footerLinks.learn.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-pb-text-secondary hover:text-pb-text-primary text-sm py-1.5 block transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 4: Deals */}
          <div>
            <h3 className="text-pb-text-primary font-heading font-semibold text-sm uppercase tracking-wider mb-4">
              Deals
            </h3>
            <nav>
              {footerLinks.deals.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-pb-text-secondary hover:text-pb-text-primary text-sm py-1.5 block transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 5: Legal */}
          <div>
            <h3 className="text-pb-text-primary font-heading font-semibold text-sm uppercase tracking-wider mb-4">
              Legal
            </h3>
            <nav>
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-pb-text-secondary hover:text-pb-text-primary text-sm py-1.5 block transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Responsible Gambling */}
        <div className="mt-12 pt-8 border-t border-pb-border">
          <p className="text-pb-text-muted text-xs mb-3 uppercase tracking-wider font-semibold">
            Responsible Gambling Resources
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <a href="https://www.begambleaware.org/" target="_blank" rel="noopener noreferrer" className="text-xs text-pb-text-muted hover:text-pb-accent transition-colors">GambleAware</a>
            <a href="https://www.gamstop.co.uk/" target="_blank" rel="noopener noreferrer" className="text-xs text-pb-text-muted hover:text-pb-accent transition-colors">GamStop</a>
            <a href="https://www.ncpgambling.org/" target="_blank" rel="noopener noreferrer" className="text-xs text-pb-text-muted hover:text-pb-accent transition-colors">NCPG</a>
            <a href="https://www.gamblersanonymous.org/" target="_blank" rel="noopener noreferrer" className="text-xs text-pb-text-muted hover:text-pb-accent transition-colors">Gamblers Anonymous</a>
            <span className="text-xs text-pb-text-muted">Helpline: 1-800-522-4700</span>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-12 pt-8 border-t border-pb-border">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-pb-text-muted text-sm">
              &copy; 2026 PaperBet.io. All rights reserved.
            </p>
            <div className="flex gap-4 mt-2 sm:mt-0">
              <Link href="/privacy" className="text-xs text-pb-text-muted hover:text-pb-accent transition-colors">Privacy</Link>
              <Link href="/terms" className="text-xs text-pb-text-muted hover:text-pb-accent transition-colors">Terms</Link>
            </div>
          </div>
          <p className="text-pb-text-muted text-xs mt-4">
            {SITE.disclaimer}
          </p>
          <p className="text-pb-text-muted text-xs mt-2">
            Game names may be trademarks of their respective owners.
          </p>
        </div>
      </div>
    </footer>
  );
}
