export default function PlinkoLoading() {
  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 py-6" role="status" aria-label="Loading Plinko">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Controls skeleton */}
        <div className="hidden lg:block w-[300px] shrink-0 space-y-4">
          <div className="h-10 bg-pb-bg-secondary rounded-lg animate-pulse" />
          <div className="h-24 bg-pb-bg-secondary rounded-lg animate-pulse" />
          <div className="h-12 bg-pb-bg-secondary rounded-lg animate-pulse" />
          <div className="h-32 bg-pb-bg-secondary rounded-lg animate-pulse" />
        </div>

        {/* Center: Board skeleton */}
        <div className="flex-1 min-w-0">
          <div className="max-w-[500px] mx-auto">
            <div className="aspect-[3/4] bg-pb-bg-secondary rounded-xl animate-pulse" />
            <div className="flex gap-1 mt-2">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="flex-1 h-8 bg-pb-bg-secondary rounded animate-pulse" />
              ))}
            </div>
          </div>
        </div>

        {/* Right: Sidebar skeleton */}
        <div className="hidden lg:block w-[320px] shrink-0 space-y-4">
          <div className="h-40 bg-pb-bg-secondary rounded-lg animate-pulse" />
          <div className="h-64 bg-pb-bg-secondary rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  );
}
