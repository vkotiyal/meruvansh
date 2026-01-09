import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { isAdmin } from "@/lib/authorization"

// GET all nodes for user's tree
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get tree using treeId from session (works for both admin and viewer)
    const tree = await prisma.tree.findUnique({
      where: { id: session.user.treeId },
      include: {
        nodes: {
          orderBy: { createdAt: "asc" },
        },
      },
    })

    if (!tree) {
      return NextResponse.json({ error: "Tree not found" }, { status: 404 })
    }

    return NextResponse.json({ nodes: tree.nodes })
  } catch (error) {
    console.error("GET nodes error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST create new node
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin (only admins can create nodes)
    if (!isAdmin(session)) {
      return NextResponse.json(
        { error: "Only administrators can modify the tree" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      name,
      nickname,
      email,
      phone,
      birthDate,
      gender,
      address,
      bio,
      parentId,
      profilePicture,
    } = body

    // Validation
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    // Get tree using treeId from session
    const tree = await prisma.tree.findUnique({
      where: { id: session.user.treeId },
    })

    if (!tree) {
      return NextResponse.json({ error: "Tree not found" }, { status: 404 })
    }

    // Create node
    const node = await prisma.node.create({
      data: {
        treeId: tree.id,
        name,
        nickname,
        email,
        phone,
        birthDate: birthDate ? new Date(birthDate) : null,
        gender,
        address,
        bio,
        parentId: parentId || null,
        profilePicture: profilePicture || null,
      },
    })

    return NextResponse.json({ node }, { status: 201 })
  } catch (error) {
    console.error("POST node error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
