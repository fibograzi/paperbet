export default function MinesLoading() {
  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 py-6" role="status" aria-label="Loading Mines">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Controls skeleton */}
        <div className="hidden lg:block w-[300px] shrink-0 space-y-4">
          <div className="h-10 bg-pb-bg-secondary rounded-lg animate-pulse" />
          <div className="h-24 bg-pb-bg-secondary rounded-lg animate-pulse" />
          <div className="h-12 bg-pb-bg-secondary rounded-lg animate-pulse" />
          <div className="h-32 bg-pb-bg-secondary rounded-lg animate-pulse" />
        </div>

        {/* Center: Board skeleton (5x5 grid) */}
        <div className="flex-1 min-w-0">
          <div className="max-w-[500px] mx-auto">
            <div className="h-6 w-48 bg-pb-bg-secondary rounded animate-pulse mb-2" />
            <div className="h-2 bg-pb-bg-secondary rounded-full animate-pulse mb-2" />
            <div className="grid grid-cols-5 gap-2 aspect-square">
              {Array.from({ length: 25 }).map((_, i) => (
                <div key={i} className="bg-pb-bg-secondary rounded-lg animate-pulse" />
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
