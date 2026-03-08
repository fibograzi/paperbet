export default function CrashLoading() {
  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 py-6" role="status" aria-label="Loading Crash">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Controls skeleton */}
        <div className="hidden lg:block w-[300px] shrink-0 space-y-4">
          <div className="h-10 bg-pb-bg-secondary rounded-lg animate-pulse" />
          <div className="h-24 bg-pb-bg-secondary rounded-lg animate-pulse" />
          <div className="h-12 bg-pb-bg-secondary rounded-lg animate-pulse" />
        </div>

        {/* Center: Chart skeleton */}
        <div className="flex-1 min-w-0">
          <div className="h-8 w-full bg-pb-bg-secondary rounded-lg animate-pulse mb-3" />
          <div className="aspect-[16/10] max-h-[50vh] bg-pb-bg-secondary rounded-xl animate-pulse" />
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
