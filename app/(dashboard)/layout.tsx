import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import Link from "next/link"
import { TreePine, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MobileNav } from "@/components/mobile-nav"
import { DesktopNav } from "@/components/desktop-nav"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const isAdmin = session.user.role === "admin"

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav
        aria-label="Main navigation"
        className="sticky top-0 z-30 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <Link href="/dashboard" className="flex flex-shrink-0 items-center">
                <TreePine className="h-7 w-7 text-green-600 sm:h-8 sm:w-8" aria-hidden="true" />
                <span className="ml-2 text-lg font-bold text-gray-900 sm:text-xl">VanshVriksh</span>
              </Link>
              <DesktopNav isAdmin={isAdmin} />
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="hidden text-sm text-gray-700 sm:inline" aria-label="Current user">
                {session.user.name || session.user.email}
              </span>
              <form action="/api/auth/signout" method="POST" className="hidden sm:block">
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
              <MobileNav isAdmin={isAdmin} userName={session.user.name || session.user.email} />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  )
}
