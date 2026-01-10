"use client"

import { useState, useEffect, useTransition } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  icon?: React.ReactNode
  role?: string
}

export function NavLink({ href, children, className, icon, role }: NavLinkProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [isNavigating, setIsNavigating] = useState(false)

  // Reset navigation state when pathname changes
  useEffect(() => {
    setIsNavigating(false)
  }, [pathname])

  const isLoading = isPending || isNavigating

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    // Don't navigate if already on this page
    if (pathname === href) return

    setIsNavigating(true)
    startTransition(() => {
      router.push(href)
    })
  }

  return (
    <a
      href={href}
      onClick={handleClick}
      className={cn(className, isLoading && "pointer-events-none opacity-70")}
      role={role}
      aria-busy={isLoading}
    >
      {isLoading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden="true" /> : icon}
      {children}
    </a>
  )
}
