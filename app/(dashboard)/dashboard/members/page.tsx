import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PageHeader } from "@/components/ui/page-header"
import { EmptyState } from "@/components/ui/empty-state"
import { NavButton } from "@/components/nav-button"
import Link from "next/link"
import { UserPlus, Pencil, Users, User } from "lucide-react"
import { DeleteButton } from "@/components/delete-button"

export default async function MembersPage() {
  const session = await getServerSession(authOptions)
  const isAdmin = session?.user.role === "admin"

  // Get all nodes using treeId (works for both admin and viewer)
  const tree = await prisma.tree.findUnique({
    where: { id: session!.user.treeId },
    include: {
      nodes: {
        orderBy: { createdAt: "desc" },
        include: {
          parent: true,
          children: true,
        },
      },
    },
  })

  const nodes = tree?.nodes || []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Family Members"
        description={`${nodes.length} ${nodes.length === 1 ? "member" : "members"} in the tree`}
        actions={
          isAdmin && (
            <NavButton href="/dashboard/members/add" icon={<UserPlus className="mr-2 h-4 w-4" />}>
              Add Member
            </NavButton>
          )
        }
      />

      {nodes.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No family members yet"
          description={
            isAdmin ? "Add your first family member to get started" : "No members to display"
          }
          action={
            isAdmin
              ? {
                  label: "Add First Member",
                  onClick: () => (window.location.href = "/dashboard/members/add"),
                }
              : undefined
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {nodes.map((node) => (
            <Card
              key={node.id}
              className="group transition-all hover:border-blue-200 hover:shadow-lg"
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-14 w-14 ring-2 ring-transparent transition-all group-hover:ring-blue-100">
                    <AvatarImage src={node.profilePicture || undefined} />
                    <AvatarFallback className="bg-blue-50">
                      <User className="h-6 w-6 text-blue-600" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold text-gray-900">{node.name}</h3>
                    {node.nickname && (
                      <p className="text-sm text-gray-500">&quot;{node.nickname}&quot;</p>
                    )}
                    <div className="mt-2 space-y-1">
                      {node.email && <p className="truncate text-xs text-gray-600">{node.email}</p>}
                      {node.parent && (
                        <p className="text-xs text-gray-500">Child of {node.parent.name}</p>
                      )}
                      {node.children.length > 0 && (
                        <p className="text-xs text-gray-500">
                          {node.children.length} {node.children.length === 1 ? "child" : "children"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {isAdmin && (
                  <div className="mt-4 flex gap-2">
                    <Link href={`/dashboard/members/${node.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Pencil className="mr-1 h-3 w-3" />
                        Edit
                      </Button>
                    </Link>
                    <DeleteButton nodeId={node.id} hasChildren={node.children.length > 0} />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
