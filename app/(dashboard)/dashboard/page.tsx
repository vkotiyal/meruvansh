import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/page-header"
import Link from "next/link"
import { TreePine, Users, UserPlus, Eye } from "lucide-react"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const isAdmin = session?.user.role === "admin"

  // Get tree and member count using treeId (works for both admin and viewer)
  const tree = await prisma.tree.findUnique({
    where: { id: session!.user.treeId },
    include: {
      _count: {
        select: { nodes: true },
      },
    },
  })

  const memberCount = tree?._count.nodes || 0
  const hasMembers = memberCount > 0

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome back, ${session!.user.name || "User"}!`}
        description={isAdmin ? "Manage your family tree" : "Explore your family tree"}
        actions={
          isAdmin && (
            <Link href="/dashboard/members/add">
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Member
              </Button>
            </Link>
          )
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Family Tree</CardTitle>
            <TreePine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tree?.name}</div>
            <p className="text-xs text-muted-foreground">
              Created {tree?.createdAt.toLocaleDateString()}
            </p>
          </CardContent>
        </Card>

        <Card className="transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{memberCount}</div>
            <p className="text-xs text-muted-foreground">
              {memberCount === 1 ? "family member" : "family members"}
            </p>
          </CardContent>
        </Card>

        {!isAdmin && (
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Access</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Viewer</div>
              <p className="text-xs text-muted-foreground">Read-only access</p>
            </CardContent>
          </Card>
        )}
      </div>

      {isAdmin && !hasMembers && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-4 rounded-full bg-blue-50 p-3">
              <UserPlus className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="mb-1 text-lg font-semibold">Start Building Your Tree</h3>
            <p className="mb-4 text-sm text-gray-500">
              Add your first family member to get started
            </p>
            <Link href="/dashboard/members/add">
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Add First Member
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {hasMembers && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/dashboard/tree" className="group">
            <Card className="transition-all hover:border-blue-200 hover:shadow-md">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="rounded-lg bg-blue-50 p-3 transition-colors group-hover:bg-blue-100">
                  <TreePine className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">View Tree</h3>
                  <p className="text-sm text-gray-500">Visualize family connections</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/members" className="group">
            <Card className="transition-all hover:border-blue-200 hover:shadow-md">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="rounded-lg bg-blue-50 p-3 transition-colors group-hover:bg-blue-100">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">View Members</h3>
                  <p className="text-sm text-gray-500">Browse all family members</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      )}
    </div>
  )
}
