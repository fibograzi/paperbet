interface StatItem {
  value: string;
  label: string;
}

interface GameHeroProps {
  h1: string;
  subtitle: string;
  stats: StatItem[];
}

export default function GameHero({ h1, subtitle, stats }: GameHeroProps) {
  return (
    <section className="pt-8 pb-4 md:pt-12 md:pb-6 px-4">
      <div className="max-w-5xl mx-auto text-center">
        <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-pb-text-primary">
          {h1}
        </h1>
        <p className="text-pb-text-secondary text-base md:text-lg mt-3 max-w-2xl mx-auto leading-relaxed">
          {subtitle}
        </p>
        {stats.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 mt-5">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-mono-stats font-bold text-xl md:text-2xl text-pb-accent">
                  {stat.value}
                </p>
                <p className="text-pb-text-muted text-xs mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
