"use client"

import { Handle, Position } from "reactflow"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User } from "lucide-react"

interface FamilyNodeData {
  id: string
  name: string
  nickname?: string | null
  email?: string | null
  profilePicture?: string | null
  birthDate?: Date | null
  gender?: string | null
}

export function FamilyNode({ data }: { data: FamilyNodeData }) {
  return (
    <div className="relative">
      <Handle type="target" position={Position.Top} className="!bg-gray-400" />

      <div className="min-w-[200px] rounded-lg border-2 border-gray-300 bg-white p-4 shadow-md transition-shadow hover:shadow-lg">
        <div className="flex items-center space-x-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={data.profilePicture || undefined} />
            <AvatarFallback className="bg-gray-100">
              <User className="h-5 w-5 text-gray-600" />
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{data.name}</p>
            {data.nickname && (
              <p className="truncate text-sm text-gray-500">&quot;{data.nickname}&quot;</p>
            )}
            {data.birthDate && (
              <p className="text-xs text-gray-400">{new Date(data.birthDate).getFullYear()}</p>
            )}
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-gray-400" />
    </div>
  )
}
