import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import Link from "next/link"
import { TreePine, Users, LogOut, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const isAdmin = session.user.role === "admin"

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav aria-label="Main navigation" className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <TreePine className="h-8 w-8 text-green-600" aria-hidden="true" />
                <span className="ml-2 text-xl font-bold text-gray-900">VanshVriksh</span>
              </div>
              <div className="hidden space-x-8 sm:ml-6 sm:flex" role="menubar">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                  role="menuitem"
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/tree"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                  role="menuitem"
                >
                  <TreePine className="mr-1 h-4 w-4" aria-hidden="true" />
                  Tree View
                </Link>
                <Link
                  href="/dashboard/members"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                  role="menuitem"
                >
                  <Users className="mr-1 h-4 w-4" aria-hidden="true" />
                  Members
                </Link>
                {isAdmin && (
                  <Link
                    href="/dashboard/settings"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                    role="menuitem"
                  >
                    <Settings className="mr-1 h-4 w-4" aria-hidden="true" />
                    Settings
                  </Link>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700" aria-label="Current user">
                {session.user.name || session.user.email}
              </span>
              <form action="/api/auth/signout" method="POST">
                <Button
                  variant="ghost"
                  size="sm"
                  type="submit"
                  aria-label="Sign out of your account"
                >
                  <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
                  Sign Out
                </Button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  )
}
