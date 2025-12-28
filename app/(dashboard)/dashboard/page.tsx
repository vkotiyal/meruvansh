import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { TreePine, Users, UserPlus } from "lucide-react"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  // Get user's tree and member count
  const tree = await prisma.tree.findUnique({
    where: { userId: session!.user.id },
    include: {
      _count: {
        select: { nodes: true },
      },
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {session!.user.name || "User"}!
        </h1>
        <p className="text-gray-600">Manage your family tree and members</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Family Tree</CardTitle>
            <TreePine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tree?.name}</div>
            <p className="text-xs text-muted-foreground">
              Created on {tree?.createdAt.toLocaleDateString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tree?._count.nodes || 0}</div>
            <p className="text-xs text-muted-foreground">Family members added</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/members/add">
              <Button className="w-full">
                <UserPlus className="mr-2 h-4 w-4" />
                Add Member
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-4">
            <div className="rounded-full bg-blue-100 p-2">
              <span className="font-bold text-blue-600">1</span>
            </div>
            <div>
              <h3 className="font-semibold">Add yourself as the root node</h3>
              <p className="text-sm text-gray-600">Start by creating a node for yourself</p>
              <Link href="/dashboard/members/add">
                <Button variant="link" className="px-0">
                  Add yourself →
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="rounded-full bg-gray-100 p-2">
              <span className="font-bold text-gray-400">2</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-400">Add family members</h3>
              <p className="text-sm text-gray-400">Add parents, siblings, and children</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="rounded-full bg-gray-100 p-2">
              <span className="font-bold text-gray-400">3</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-400">View your tree</h3>
              <p className="text-sm text-gray-400">Visualize your family tree</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
