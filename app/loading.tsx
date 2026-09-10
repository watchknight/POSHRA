export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16">
      {/* Top indeterminate loading indicator bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 animate-pulse z-50" />

      <div className="w-full max-w-4xl mx-auto space-y-8 animate-pulse">
        {/* Header skeleton */}
        <div className="space-y-3 text-center flex flex-col items-center">
          <div className="h-8 w-48 bg-gray-200 rounded-lg" />
          <div className="h-4 w-72 bg-gray-100 rounded" />
        </div>

        {/* Content grid skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pt-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-100 bg-white p-3 space-y-3 shadow-xs">
              <div className="aspect-square w-full bg-gray-100 rounded-xl" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-4 bg-gray-100 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
