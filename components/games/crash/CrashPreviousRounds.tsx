"use client";

import { motion, AnimatePresence } from "framer-motion";
import { formatCrashMultiplier, getCrashPointBadgeStyle } from "./crashEngine";

interface CrashPreviousRoundsProps {
  crashPoints: number[];
}

export default function CrashPreviousRounds({ crashPoints }: CrashPreviousRoundsProps) {
  const visible = crashPoints.slice(0, 20);

  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
      <AnimatePresence initial={false}>
        {visible.map((point, index) => {
          const style = getCrashPointBadgeStyle(point);
          return (
            <motion.span
              key={`${point}-${crashPoints.length - index}`}
              initial={{ opacity: 0, x: 30, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="inline-flex items-center justify-center rounded-full h-7 px-2.5 font-mono-stats text-xs font-bold whitespace-nowrap shrink-0"
              style={{
                backgroundColor: style.bg,
                color: style.text,
              }}
            >
              {formatCrashMultiplier(point)}
            </motion.span>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
