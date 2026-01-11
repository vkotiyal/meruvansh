import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { TreePine } from "lucide-react"
import { MobileNav } from "@/components/mobile-nav"
import { DesktopNav } from "@/components/desktop-nav"
import { SignoutDialog } from "@/components/signout-dialog"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const isAdmin = session.user.role === "admin"

  // Get tree name for display
  const tree = await prisma.tree.findUnique({
    where: { id: session.user.treeId },
    select: { name: true },
  })

  // Display name: For admin show user name, for viewer show tree name
  const displayName = isAdmin
    ? session.user.name || session.user.email
    : tree?.name || "Family Tree"

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav
        aria-label="Main navigation"
        className="sticky top-0 z-30 border-b border-green-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <Link href="/dashboard" className="flex flex-shrink-0 items-center">
                <TreePine className="h-7 w-7 text-green-700 sm:h-8 sm:w-8" aria-hidden="true" />
                <span className="ml-2 text-lg font-bold text-gray-900 sm:text-xl">MeruVansh</span>
              </Link>
              <DesktopNav isAdmin={isAdmin} />
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="hidden text-sm text-gray-700 sm:inline" aria-label="Current user">
                {displayName}
              </span>
              <div className="hidden sm:block">
                <SignoutDialog />
              </div>
              <MobileNav isAdmin={isAdmin} userName={displayName} />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  )
}
