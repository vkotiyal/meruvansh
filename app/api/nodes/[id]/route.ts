import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { isAdmin, canViewTree } from "@/lib/authorization"

// GET single node
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const node = await prisma.node.findUnique({
      where: { id: params.id },
      include: {
        parent: true,
        children: true,
      },
    })

    if (!node) {
      return NextResponse.json({ error: "Node not found" }, { status: 404 })
    }

    // Verify user can view this tree (works for both admin and viewer)
    if (!canViewTree(session, node.treeId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json({ node })
  } catch (error) {
    console.error("GET node error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT update node
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin (only admins can update nodes)
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
      deathDate,
      gender,
      address,
      bio,
      profilePicture,
      parentId,
    } = body

    // Get node
    const existingNode = await prisma.node.findUnique({
      where: { id: params.id },
    })

    if (!existingNode) {
      return NextResponse.json({ error: "Node not found" }, { status: 404 })
    }

    // Verify user can access this tree
    if (!canViewTree(session, existingNode.treeId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Update node
    const node = await prisma.node.update({
      where: { id: params.id },
      data: {
        name,
        nickname,
        email,
        phone,
        birthDate: birthDate ? new Date(birthDate) : null,
        deathDate: deathDate ? new Date(deathDate) : null,
        gender,
        address,
        bio,
        profilePicture,
        parentId: parentId || null,
      },
    })

    return NextResponse.json({ node })
  } catch (error) {
    console.error("PUT node error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE node
export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin (only admins can delete nodes)
    if (!isAdmin(session)) {
      return NextResponse.json(
        { error: "Only administrators can modify the tree" },
        { status: 403 }
      )
    }

    // Get node
    const node = await prisma.node.findUnique({
      where: { id: params.id },
      include: { children: true },
    })

    if (!node) {
      return NextResponse.json({ error: "Node not found" }, { status: 404 })
    }

    // Verify user can access this tree
    if (!canViewTree(session, node.treeId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Check if node has children
    if (node.children.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete node with children. Delete children first." },
        { status: 400 }
      )
    }

    // Delete node
    await prisma.node.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Node deleted successfully" })
  } catch (error) {
    console.error("DELETE node error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
