export default function CrashLoading() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center" role="status">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-2 border-pb-accent-secondary border-t-transparent animate-spin mx-auto" />
        <p className="text-pb-text-muted text-sm mt-4 font-heading">
          Loading Crash...
        </p>
      </div>
    </div>
  );
}
