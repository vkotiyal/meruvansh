"use client"

import { memo } from "react"
import { Handle, Position } from "reactflow"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User } from "lucide-react"
import { cn } from "@/lib/utils"

interface FamilyNodeData {
  id: string
  name: string
  nickname?: string | null
  email?: string | null
  profilePicture?: string | null
  birthDate?: Date | null
  deathDate?: Date | null
  gender?: string | null
  spouseId?: string | null
  spouseGender?: string | null // Gender of the spouse (for handle coloring)
  isLeftSpouse?: boolean // Is this node positioned on the left in a couple?
}

// Get styling based on gender
function getGenderStyles(gender?: string | null) {
  switch (gender) {
    case "male":
      return {
        border: "border-blue-400",
        background: "bg-gradient-to-br from-blue-50 to-white",
        avatarBg: "bg-blue-100",
        avatarBorder: "ring-2 ring-blue-200",
        textAccent: "text-blue-600",
        handleColor: "#60a5fa", // blue-400
      }
    case "female":
      return {
        border: "border-pink-400",
        background: "bg-gradient-to-br from-pink-50 to-white",
        avatarBg: "bg-pink-100",
        avatarBorder: "ring-2 ring-pink-200",
        textAccent: "text-pink-600",
        handleColor: "#f472b6", // pink-400
      }
    case "other":
      return {
        border: "border-purple-400",
        background: "bg-gradient-to-br from-purple-50 to-white",
        avatarBg: "bg-purple-100",
        avatarBorder: "ring-2 ring-purple-200",
        textAccent: "text-purple-600",
        handleColor: "#a78bfa", // purple-400
      }
    default:
      return {
        border: "border-slate-300",
        background: "bg-gradient-to-br from-slate-50 to-white",
        avatarBg: "bg-slate-100",
        avatarBorder: "ring-2 ring-slate-200",
        textAccent: "text-slate-600",
        handleColor: "#94a3b8", // slate-400
      }
  }
}

// Get handle color based on spouse's gender
function getSpouseHandleColor(spouseGender?: string | null): string {
  switch (spouseGender) {
    case "male":
      return "#60a5fa" // blue-400
    case "female":
      return "#f472b6" // pink-400
    case "other":
      return "#a78bfa" // purple-400
    default:
      return "#94a3b8" // slate-400
  }
}

// Format birth year
function formatYear(date?: Date | null): string | null {
  if (!date) return null
  try {
    return new Date(date).getFullYear().toString()
  } catch {
    return null
  }
}

function FamilyNodeComponent({ data }: { data: FamilyNodeData }) {
  const styles = getGenderStyles(data.gender)
  const birthYear = formatYear(data.birthDate)
  const deathYear = formatYear(data.deathDate)
  const isDeceased = !!data.deathDate
  const hasSpouse = !!data.spouseId
  const spouseHandleColor = getSpouseHandleColor(data.spouseGender)

  // Format life span
  let lifeSpan = ""
  if (birthYear) {
    lifeSpan = birthYear
    if (deathYear) {
      lifeSpan += ` - ${deathYear}`
    }
  } else if (deathYear) {
    lifeSpan = `d. ${deathYear}`
  }

  return (
    <div className="relative">
      {/* Top handle - for incoming connections from parent */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="!h-3 !w-3 !border-2 !border-white"
        style={{ backgroundColor: "#94a3b8" }}
      />

      {/* Left handle - only show if has spouse and is on the right side */}
      {hasSpouse && !data.isLeftSpouse && (
        <Handle
          type="target"
          position={Position.Left}
          id="left"
          className="!h-3 !w-3 !border-2 !border-white"
          style={{ backgroundColor: spouseHandleColor }}
        />
      )}

      {/* Node card */}
      <div
        className={cn(
          "w-[200px] rounded-xl border-2 p-3 shadow-lg transition-all duration-200",
          "hover:scale-[1.02] hover:shadow-xl",
          styles.border,
          styles.background,
          isDeceased && "opacity-75"
        )}
      >
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <Avatar className={cn("h-11 w-11 shrink-0", styles.avatarBorder)}>
            <AvatarImage src={data.profilePicture || undefined} className="object-cover" />
            <AvatarFallback className={cn(styles.avatarBg, "text-slate-600")}>
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                "truncate text-sm font-semibold leading-tight text-slate-800",
                isDeceased && "text-slate-600"
              )}
            >
              {data.name}
            </p>

            {data.nickname && (
              <p className="mt-0.5 truncate text-xs leading-tight text-slate-500">
                &ldquo;{data.nickname}&rdquo;
              </p>
            )}

            {lifeSpan && (
              <p className={cn("mt-1 text-xs font-medium", styles.textAccent)}>{lifeSpan}</p>
            )}
          </div>
        </div>
      </div>

      {/* Right handle - only show if has spouse and is on the left side */}
      {hasSpouse && data.isLeftSpouse && (
        <Handle
          type="source"
          position={Position.Right}
          id="right"
          className="!h-3 !w-3 !border-2 !border-white"
          style={{ backgroundColor: spouseHandleColor }}
        />
      )}

      {/* Bottom handle - for outgoing connections to children */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="!h-3 !w-3 !border-2 !border-white"
        style={{ backgroundColor: "#94a3b8" }}
      />
    </div>
  )
}

// Memoize to prevent unnecessary re-renders
export const FamilyNode = memo(FamilyNodeComponent)
