interface GameSEOContentProps {
  title: string;
  children: React.ReactNode;
}

export default function GameSEOContent({ title, children }: GameSEOContentProps) {
  return (
    <section className="py-12 md:py-16 px-4 border-t border-pb-border">
      <div className="max-w-3xl mx-auto">
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
