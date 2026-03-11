"use client";

import { usePathname } from "next/navigation";
import RouletteLabBreadcrumb from "@/components/roulette/RouletteLabBreadcrumb";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

const PAGE_LABELS: Record<string, string> = {
  "/roulette": "Roulette Lab",
  "/roulette/free-play": "Free Play",
  "/roulette/strategy-tester": "Strategy Tester",
  "/roulette/odds-calculator": "Odds Calculator",
  "/roulette/risk-of-ruin": "Risk of Ruin",
  "/roulette/simulators/martingale": "Martingale Simulator",
  "/roulette/simulators/fibonacci": "Fibonacci Simulator",
  "/roulette/learn": "Learn Roulette",
  "/roulette/disclaimer": "Disclaimer",
};

function buildBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);
  const items: BreadcrumbItem[] = [];

  let accumulated = "";
  for (const segment of segments) {
    accumulated += `/${segment}`;
    const label = PAGE_LABELS[accumulated];
    if (label) {
      const isLast = accumulated === pathname;
      items.push({
        label,
        href: isLast ? undefined : accumulated,
      });
    }
  }

  return items;
}

export default function RouletteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const breadcrumbItems = buildBreadcrumbs(pathname);

  return (
    <>
      {breadcrumbItems.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 border-b border-pb-border/50">
          <RouletteLabBreadcrumb items={breadcrumbItems} />
        </div>
      )}
      {children}
    </>
  );
}
