"use client"

import { useSession } from "next-auth/react"

/**
 * Custom hook to check user's role in client components
 * Returns role information and session data
 */
export function useSessionRole() {
  const { data: session, status } = useSession()

  const isAdmin = session?.user?.role === "admin"
  const isViewer = session?.user?.role === "viewer"
  const isLoading = status === "loading"
  const isAuthenticated = status === "authenticated"

  return {
    session,
    isAdmin,
    isViewer,
    isLoading,
    isAuthenticated,
    role: session?.user?.role,
    treeId: session?.user?.treeId,
  }
}
