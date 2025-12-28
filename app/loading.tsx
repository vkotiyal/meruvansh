export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div
          className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"
          role="status"
          aria-label="Loading"
        >
          <span className="sr-only">Loading...</span>
        </div>
        <p className="mt-4 text-sm text-gray-600">Loading VanshVriksh...</p>
      </div>
    </div>
  )
}
