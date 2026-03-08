export default function DealsLoading() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6" role="status" aria-label="Loading Deal Wheel">
      <div className="flex flex-col items-center gap-6">
        {/* Wheel skeleton */}
        <div className="w-full max-w-[500px] aspect-square rounded-full bg-pb-bg-secondary animate-pulse" />

        {/* Controls skeleton */}
        <div className="w-full max-w-md space-y-3">
          <div className="h-12 bg-pb-bg-secondary rounded-lg animate-pulse" />
          <div className="h-10 bg-pb-bg-secondary rounded-lg animate-pulse" />
        </div>

        {/* Prize list skeleton */}
        <div className="w-full max-w-md space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-pb-bg-secondary rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
