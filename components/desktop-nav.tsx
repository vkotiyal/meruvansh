"use client"

import { TreePine, Users, Settings } from "lucide-react"
import { NavLink } from "./nav-link"

interface DesktopNavProps {
  isAdmin: boolean
}

export function DesktopNav({ isAdmin }: DesktopNavProps) {
  const linkClassName =
    "inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 hover:text-gray-900"

  return (
    <div className="hidden space-x-6 sm:ml-8 sm:flex lg:space-x-8" role="menubar">
      <NavLink href="/dashboard" className={linkClassName} role="menuitem">
        Dashboard
      </NavLink>
      <NavLink
        href="/dashboard/tree"
        className={linkClassName}
        role="menuitem"
        icon={<TreePine className="mr-1.5 h-4 w-4" aria-hidden="true" />}
      >
        Tree
      </NavLink>
      <NavLink
        href="/dashboard/members"
        className={linkClassName}
        role="menuitem"
        icon={<Users className="mr-1.5 h-4 w-4" aria-hidden="true" />}
      >
        Members
      </NavLink>
      {isAdmin && (
        <NavLink
          href="/dashboard/settings"
          className={linkClassName}
          role="menuitem"
          icon={<Settings className="mr-1.5 h-4 w-4" aria-hidden="true" />}
        >
          Settings
        </NavLink>
      )}
    </div>
  )
}
