import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { TreeView } from "@/components/tree/tree-view"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { UserPlus } from "lucide-react"

export default async function TreePage() {
  const session = await getServerSession(authOptions)
  const isAdmin = session?.user.role === "admin"

  // Get all nodes using treeId (works for both admin and viewer)
  const tree = await prisma.tree.findUnique({
    where: { id: session!.user.treeId },
    include: {
      nodes: {
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
          <h1 className="text-3xl font-bold text-gray-900">Family Tree</h1>
          <p className="text-gray-600">
            {isAdmin ? "Visualize your family tree" : "Explore the family tree"}
          </p>
        </div>
        {isAdmin && (
          <Link href="/dashboard/members/add">
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          </Link>
        )}
      </div>

      {nodes.length === 0 ? (
        <div className="rounded-lg bg-white p-12 text-center shadow">
          <p className="mb-4 text-gray-500">
            {isAdmin
              ? "No family members yet. Add some members to see your tree!"
              : "No family members in this tree yet."}
          </p>
          {isAdmin && (
            <Link href="/dashboard/members/add">
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Your First Member
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="rounded-lg bg-white shadow" style={{ height: "600px" }}>
          <TreeView nodes={nodes} />
        </div>
      )}
    </div>
  )
}
