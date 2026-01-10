import { TreePine } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-green-50 to-background">
      <div className="space-y-8 px-4 text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="rounded-full bg-green-100 p-4">
            <TreePine className="h-12 w-12 text-green-700" />
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            VanshVriksh
          </h1>
          <p className="mx-auto max-w-lg text-lg text-gray-600 sm:text-xl">
            Preserve your roots. Connect generations. Create and manage your family tree with ease.
          </p>
        </div>
        <div className="flex flex-col justify-center gap-4 pt-4 sm:flex-row">
          <a
            href="/signup"
            className="rounded-lg bg-primary px-8 py-3 font-medium text-white shadow-md transition-all hover:bg-green-800 hover:shadow-lg"
          >
            Get Started
          </a>
          <a
            href="/login"
            className="rounded-lg border-2 border-gray-200 bg-white px-8 py-3 font-medium text-gray-700 shadow-sm transition-all hover:border-gray-300 hover:bg-gray-50"
          >
            Sign In
          </a>
        </div>
      </div>
    </div>
  )
}
