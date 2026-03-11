import Link from "next/link";
import { GAMES } from "@/lib/constants";

const CROSS_GAME_META: Record<string, { displayName: string; tagline: string }> = {
  plinko: { displayName: "Plinko", tagline: "Drop balls for multipliers up to 1,000x" },
  crash: { displayName: "Crash", tagline: "Cash out before the multiplier crashes" },
  mines: { displayName: "Mines", tagline: "Reveal gems, avoid mines on a 5x5 grid" },
  dice: { displayName: "Dice", tagline: "Roll over or under your target number" },
  hilo: { displayName: "HiLo", tagline: "Predict if the next card is higher or lower" },
  keno: { displayName: "Keno", tagline: "Pick numbers and match the draw" },
  limbo: { displayName: "Limbo", tagline: "Set a target multiplier and hope to beat it" },
  flip: { displayName: "Coin Flip", tagline: "Heads or tails with chain multipliers" },
  roulette: { displayName: "Roulette", tagline: "Spin the wheel — 7 free tools" },
};

interface CrossGameLinksProps {
  currentGame: string;
}

export default function CrossGameLinks({ currentGame }: CrossGameLinksProps) {
  const otherGames = GAMES.filter((g) => g.slug !== currentGame);

  return (
    <section className="py-12 md:py-16 px-4 border-t border-pb-border">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-pb-text-primary text-center mb-8">
          Try More Free Casino Simulators
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {otherGames.map((game) => {
            const meta = CROSS_GAME_META[game.slug];
            const name = meta?.displayName ?? game.name;
            const tagline = meta?.tagline ?? game.shortDesc;

            return (
              <Link
                key={game.slug}
                href={game.slug === "roulette" ? "/roulette" : `/${game.slug}`}
                className="group block bg-pb-bg-secondary border border-pb-border rounded-xl p-5 hover:border-pb-accent/50 transition-colors"
              >
                <h3 className="font-heading font-semibold text-pb-text-primary group-hover:text-pb-accent transition-colors">
                  {name}
                </h3>
                <p className="text-sm text-pb-text-secondary mt-1 leading-relaxed">
                  {tagline}
                </p>
                <span className="inline-flex items-center gap-1 text-xs text-pb-accent mt-3 font-medium">
                  Play Free {name} &rarr;
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
