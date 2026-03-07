"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Triangle, TrendingUp, Grid3x3, ArrowRight } from "lucide-react";
import type { Game } from "@/lib/types";
import Badge from "@/components/ui/Badge";

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Triangle,
  TrendingUp,
  Grid3x3,
};

interface GameCardProps {
  game: Game;
}

export default function GameCard({ game }: GameCardProps) {
  const Icon = iconMap[game.icon];

  const card = (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="bg-pb-bg-secondary border border-pb-border rounded-xl p-6 group hover:border-pb-accent/50 transition-colors duration-200 h-full flex flex-col"
    >
      {/* Icon */}
      <div
        className="w-12 h-12 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: `${game.color}1A` }}
      >
        {Icon && <Icon className="w-6 h-6" style={{ color: game.color }} />}
      </div>

      {/* Name */}
      <h3 className="font-heading text-xl font-semibold text-pb-text-primary mt-4">
        {game.name}
      </h3>

      {/* Description */}
      <p className="text-pb-text-secondary text-sm mt-2 flex-1">
        {game.description}
      </p>

      {/* Bottom row */}
      <div className="flex items-center justify-between mt-4">
        <Badge variant="info">RTP: {game.rtp}%</Badge>

        {game.available ? (
          <span className="inline-flex items-center gap-1 text-pb-accent text-sm font-medium group-hover:gap-2 transition-all duration-200">
            Play Now
            <ArrowRight className="w-4 h-4" />
          </span>
        ) : (
          <Badge variant="muted">Coming Soon</Badge>
        )}
      </div>
    </motion.div>
  );

  if (game.available) {
    return (
      <Link href={`/${game.slug}`} className="block">
        {card}
      </Link>
    );
  }

  return card;
}
