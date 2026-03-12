interface GameSEOContentProps {
  h1?: string;
  title: string;
  children: React.ReactNode;
}

export default function GameSEOContent({ h1, title, children }: GameSEOContentProps) {
  return (
    <section className="py-12 md:py-16 px-4 border-t border-pb-border">
      <div className="max-w-3xl mx-auto">
        {h1 && (
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-pb-text-primary mb-8">
            {h1}
          </h1>
        )}
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-pb-text-primary mb-6">
          {title}
        </h2>
        <div className="space-y-4 text-pb-text-secondary leading-relaxed">
          {children}
        </div>
      </div>
    </section>
  );
}
