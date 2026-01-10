"use client"

import { useState, useEffect, useTransition } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X, TreePine, Users, Settings, Home, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SignoutDialog } from "@/components/signout-dialog"
import { cn } from "@/lib/utils"

interface MobileNavProps {
  isAdmin: boolean
  userName: string
}

export function MobileNav({ isAdmin, userName }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const pathname = usePathname()
  const router = useRouter()

  // Reset navigation state when pathname changes
  useEffect(() => {
    setNavigatingTo(null)
  }, [pathname])

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/dashboard/tree", label: "Tree View", icon: TreePine },
    { href: "/dashboard/members", label: "Members", icon: Users },
    ...(isAdmin ? [{ href: "/dashboard/settings", label: "Settings", icon: Settings }] : []),
  ]

  const isActive = (href: string) => pathname === href
  const isLoading = (href: string) => navigatingTo === href && isPending

  const handleNavClick = (href: string) => {
    if (pathname === href) {
      setIsOpen(false)
      return
    }
    setNavigatingTo(href)
    setIsOpen(false)
    startTransition(() => {
      router.push(href)
    })
  }

  const isNavigating = navigatingTo !== null && isPending

  return (
    <div className="sm:hidden">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
        aria-expanded={isOpen}
        disabled={isNavigating}
      >
        {isNavigating ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </Button>

      {/* Mobile menu overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Menu panel */}
          <div className="fixed inset-y-0 right-0 z-50 w-64 bg-white shadow-xl">
            <div className="flex h-16 items-center justify-between border-b px-4">
              <span className="text-sm font-medium text-gray-900">{userName}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <nav className="flex flex-col space-y-1 p-4" role="menu">
              {navItems.map((item) => {
                const Icon = item.icon
                const loading = isLoading(item.href)
                return (
                  <button
                    key={item.href}
                    type="button"
                    onClick={() => handleNavClick(item.href)}
                    disabled={loading}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
                      isActive(item.href)
                        ? "bg-green-50 text-green-700"
                        : "text-gray-700 hover:bg-gray-100",
                      loading && "opacity-70"
                    )}
                    role="menuitem"
                    aria-busy={loading}
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                    {item.label}
                  </button>
                )
              })}

              <div className="my-4 border-t" />

              <SignoutDialog variant="mobile" />
            </nav>
          </div>
        </>
      )}
    </div>
  )
}
