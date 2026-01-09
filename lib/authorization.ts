import { Session } from "next-auth"

/**
 * Check if the user's session has admin role
 */
export function isAdmin(session: Session): boolean {
  return session.user.role === "admin"
}

/**
 * Check if the user's session has viewer role
 */
export function isViewer(session: Session): boolean {
  return session.user.role === "viewer"
}

/**
 * Check if the user can view a specific tree
 */
export function canViewTree(session: Session, treeId: string): boolean {
  return session.user.treeId === treeId
}

/**
 * Check if the user can mutate (create/update/delete) tree data
 * Only admins can mutate their own tree
 */
export function canMutateTree(session: Session, treeId: string): boolean {
  return isAdmin(session) && session.user.treeId === treeId
}

/**
 * Require admin role or throw error
 * @throws Error if user is not admin
 */
export function requireAdmin(session: Session): void {
  if (!isAdmin(session)) {
    throw new Error("Admin access required")
  }
}

/**
 * Get user's tree ID from session
 */
export function getUserTreeId(session: Session): string {
  return session.user.treeId
}
