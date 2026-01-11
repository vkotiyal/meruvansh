import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { isAdmin } from "@/lib/authorization"

// GET tree details
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const tree = await prisma.tree.findUnique({
      where: { id: session.user.treeId },
    })

    if (!tree) {
      return NextResponse.json({ error: "Tree not found" }, { status: 404 })
    }

    return NextResponse.json({ tree })
  } catch (error) {
    console.error("GET tree error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT update tree (name)
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only admins can update tree
    if (!isAdmin(session)) {
      return NextResponse.json(
        { error: "Only administrators can update tree settings" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name } = body

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Tree name is required" }, { status: 400 })
    }

    const tree = await prisma.tree.update({
      where: { id: session.user.treeId },
      data: { name: name.trim() },
    })

    return NextResponse.json({ tree })
  } catch (error) {
    console.error("PUT tree error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
