"use client"

import { useState } from "react"
import { signOut } from "next-auth/react"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LoadingButton } from "@/components/ui/loading-button"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface SignoutDialogProps {
  trigger?: React.ReactNode
  variant?: "default" | "mobile"
}

export function SignoutDialog({ trigger, variant = "default" }: SignoutDialogProps) {
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const handleSignout = async () => {
    setLoading(true)
    await signOut({ callbackUrl: "/login" })
  }

  const defaultTrigger =
    variant === "mobile" ? (
      <Button
        variant="ghost"
        className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
      >
        <LogOut className="mr-3 h-5 w-5" />
        Sign Out
      </Button>
    ) : (
      <Button variant="ghost" size="sm">
        <LogOut className="mr-2 h-4 w-4" />
        Sign Out
      </Button>
    )

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger || defaultTrigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Sign out of MeruVansh?</AlertDialogTitle>
          <AlertDialogDescription>
            You will need to sign in again to access your family tree.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <LoadingButton onClick={handleSignout} loading={loading} variant="destructive">
            Sign Out
          </LoadingButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
