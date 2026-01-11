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
        spouse: {
          select: { id: true, name: true },
        },
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
      spouseId,
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

    // Validate new spouse if provided
    if (spouseId) {
      // Cannot be own spouse
      if (spouseId === params.id) {
        return NextResponse.json({ error: "Cannot set self as spouse" }, { status: 400 })
      }

      const potentialSpouse = await prisma.node.findUnique({
        where: { id: spouseId },
      })

      if (!potentialSpouse) {
        return NextResponse.json({ error: "Spouse not found" }, { status: 400 })
      }

      if (potentialSpouse.treeId !== existingNode.treeId) {
        return NextResponse.json({ error: "Spouse must belong to the same tree" }, { status: 400 })
      }

      // Check if potential spouse already has a different spouse
      if (potentialSpouse.spouseId && potentialSpouse.spouseId !== params.id) {
        return NextResponse.json({ error: "Selected person already has a spouse" }, { status: 400 })
      }
    }

    // Update node with spouse (use transaction for bidirectional sync)
    const node = await prisma.$transaction(async (tx) => {
      const oldSpouseId = existingNode.spouseId
      const newSpouseId = spouseId || null

      // If spouse is changing
      if (oldSpouseId !== newSpouseId) {
        // Clear old spouse's reference
        if (oldSpouseId) {
          await tx.node.update({
            where: { id: oldSpouseId },
            data: { spouseId: null },
          })
        }

        // Set new spouse's reference (bidirectional sync)
        if (newSpouseId) {
          await tx.node.update({
            where: { id: newSpouseId },
            data: { spouseId: params.id },
          })
        }
      }

      // Update the node
      return tx.node.update({
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
          spouseId: newSpouseId,
        },
      })
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

    // Delete node (use transaction to clear spouse reference first)
    await prisma.$transaction(async (tx) => {
      // Clear spouse's reference before deleting
      if (node.spouseId) {
        await tx.node.update({
          where: { id: node.spouseId },
          data: { spouseId: null },
        })
      }

      // Delete the node
      await tx.node.delete({
        where: { id: params.id },
      })
    })

    return NextResponse.json({ message: "Node deleted successfully" })
  } catch (error) {
    console.error("DELETE node error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
