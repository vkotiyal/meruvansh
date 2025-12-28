export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <div className="space-y-6 px-4 text-center">
        <h1 className="text-6xl font-bold text-gray-900">VanshVriksh</h1>
        <p className="mx-auto max-w-md text-xl text-gray-600">
          Create and manage your family tree with ease
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <a
            href="/signup"
            className="rounded-md bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
          >
            Get Started
          </a>
          <a
            href="/login"
            className="rounded-md border border-gray-300 px-6 py-3 text-gray-700 transition-colors hover:bg-gray-50"
          >
            Sign In
          </a>
        </div>
      </div>
    </div>
  )
}
