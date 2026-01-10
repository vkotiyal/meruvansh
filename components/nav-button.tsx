"use client"

import { useState, useEffect, useTransition } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Button, type ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface NavButtonProps extends Omit<ButtonProps, "onClick"> {
  href: string
  icon?: React.ReactNode
}

export function NavButton({ href, children, icon, className, disabled, ...props }: NavButtonProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [isNavigating, setIsNavigating] = useState(false)

  // Reset navigation state when pathname changes
  useEffect(() => {
    setIsNavigating(false)
  }, [pathname])

  const isLoading = isPending || isNavigating

  const handleClick = () => {
    if (pathname === href) return

    setIsNavigating(true)
    startTransition(() => {
      router.push(href)
    })
  }

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={cn(className)}
      {...props}
    >
      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : icon}
      {children}
    </Button>
  )
}
