import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { UserPlus, Pencil } from "lucide-react"
import { DeleteButton } from "@/components/delete-button"

export default async function MembersPage() {
  const session = await getServerSession(authOptions)

  // Get all nodes
  const tree = await prisma.tree.findUnique({
    where: { userId: session!.user.id },
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Family Members</h1>
          <p className="text-gray-600">Manage all members in your family tree</p>
        </div>
        <Link href="/dashboard/members/add">
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        </Link>
      </div>

      {nodes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="mb-4 text-gray-500">No family members yet</p>
            <Link href="/dashboard/members/add">
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Your First Member
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {nodes.map((node) => (
            <Card key={node.id} className="transition-shadow hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={node.profilePicture || undefined} />
                    <AvatarFallback className="text-lg">
                      {node.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-lg font-semibold">{node.name}</h3>
                    {node.nickname && (
                      <p className="text-sm text-gray-500">&quot;{node.nickname}&quot;</p>
                    )}
                    {node.email && <p className="truncate text-sm text-gray-600">{node.email}</p>}
                    {node.parent && (
                      <p className="mt-1 text-xs text-gray-500">Child of {node.parent.name}</p>
                    )}
                    {node.children.length > 0 && (
                      <p className="text-xs text-gray-500">
                        {node.children.length} {node.children.length === 1 ? "child" : "children"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex justify-end space-x-2">
                  <Link href={`/dashboard/members/${node.id}`}>
                    <Button variant="outline" size="sm">
                      <Pencil className="mr-1 h-3 w-3" />
                      Edit
                    </Button>
                  </Link>
                  <DeleteButton nodeId={node.id} hasChildren={node.children.length > 0} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
