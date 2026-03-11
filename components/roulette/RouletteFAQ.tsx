"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: "What's the difference between European and American roulette?",
    answer:
      "European roulette has 37 pockets (numbers 1–36 plus a single zero), giving the house an edge of 2.7%. American roulette adds a double-zero pocket, making it 38 numbers and raising the house edge to 5.26%. This nearly doubles the casino's advantage on every spin. Always choose European roulette when you have the option — you'll lose money roughly half as fast.",
  },
  {
    question: "Does the Martingale system actually work?",
    answer:
      "The Martingale system (doubling your bet after every loss) cannot overcome the house edge in the long run. While it can produce short-term wins, it requires unlimited bankroll and unlimited table limits to be guaranteed to work. In practice, a losing streak of 8–10 spins — which happens regularly — can wipe out your entire bankroll. Use our Martingale Simulator to see this happen firsthand with Monte Carlo data.",
  },
  {
    question: "What is house edge in roulette?",
    answer:
      "House edge is the percentage of every bet the casino expects to keep over time. In European roulette, the house edge is 2.7% (1/37). This means for every $100 you wager, you expect to lose $2.70 on average. It applies to every spin, regardless of what happened previously. The house edge exists because there are 37 numbers but the casino only pays 35-to-1 on straight-up bets.",
  },
  {
    question: "Can I predict where the ball will land?",
    answer:
      "No. Each spin of a fair roulette wheel is an independent random event. The outcome of one spin has zero effect on the next. This is called the independence of spins. The 'gambler's fallacy' is the mistaken belief that past outcomes influence future ones — e.g., thinking red is 'due' after 10 black spins. The ball has no memory. Online casino RNG-based roulette is mathematically identical.",
  },
  {
    question: "What are the best bets in roulette?",
    answer:
      "All outside bets (red/black, odd/even, high/low) have almost exactly the same house edge as all inside bets — roughly 2.7% in European roulette. There is no 'best' bet in terms of long-run expectation. Outside bets are lower variance (you win more often but smaller amounts). Inside bets like straight-up (35:1 payout) are higher variance. Choose based on your risk preference, not expected value.",
  },
  {
    question: "What is the Risk of Ruin in roulette?",
    answer:
      "Risk of Ruin (RoR) is the probability that you'll lose your entire bankroll before reaching a profit target. For example, with a $100 bankroll and a $200 target, flat-betting $5 on red/black in European roulette gives you roughly a 35% chance of reaching $200 before going broke. The higher your bet size relative to your bankroll, the higher your risk of ruin. Use our Risk of Ruin Calculator to model any scenario.",
  },
  {
    question: "Is the Fibonacci betting system better than Martingale?",
    answer:
      "The Fibonacci system (bet the sum of the last two bets after a loss: 1, 1, 2, 3, 5, 8…) is slightly less aggressive than Martingale, meaning you won't hit table limits as quickly. However, both systems fail for the same mathematical reason: they cannot change the underlying house edge. They simply rearrange when you lose, not whether you lose. Our Fibonacci Simulator lets you test thousands of sessions to see the distribution of outcomes.",
  },
  {
    question: "How many numbers are in roulette?",
    answer:
      "European roulette has 37 pockets: 0 plus 1 through 36. American roulette has 38 pockets: 0, 00, and 1 through 36. French roulette (rare) also has 37 pockets but includes special rules (La Partage, En Prison) that reduce the house edge to 1.35% on even-money bets — making it the best variant for players.",
  },
  {
    question: "What is the payout for a straight-up roulette bet?",
    answer:
      "A straight-up bet (betting on a single number) pays 35:1. If you bet $1 and win, you receive $35 profit plus your $1 stake back ($36 total). However, the true probability of hitting in European roulette is 1/37, so the fair payout would be 36:1. The gap between 35:1 and 36:1 is exactly where the 2.7% house edge comes from.",
  },
  {
    question: "Can I practice roulette for free here?",
    answer:
      "Yes — the entire Roulette Lab is 100% free. The Free Play tool gives you $1,000 in paper money to spin a full European roulette wheel with real physics. The Strategy Tester runs Monte Carlo simulations of any betting system. The Odds Calculator shows exact probabilities for every bet type. No registration, no real money, no risk. Everything is educational.",
  },
];

export default function RouletteFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <section className="py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-pb-text-primary mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-pb-text-secondary text-sm">
            Honest answers to common roulette questions — no fluff, just math.
          </p>
        </div>

        <div className="space-y-2">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-pb-bg-secondary border border-pb-border rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-pb-bg-tertiary/50 transition-colors cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="font-heading font-medium text-pb-text-primary text-sm md:text-base pr-4">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-pb-text-muted shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                    >
                      <div className="px-5 pb-5 pt-0">
                        <div className="border-t border-pb-border pt-4">
                          <p className="text-pb-text-secondary text-sm leading-relaxed">
                            {item.answer}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
