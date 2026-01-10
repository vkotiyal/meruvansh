import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { isAdmin } from "@/lib/authorization"
import bcrypt from "bcryptjs"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!isAdmin(session)) {
      return NextResponse.json(
        { error: "Only administrators can modify viewer access" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { enabled, password } = body

    // Verify the viewer access belongs to the admin's tree
    const viewerAccess = await prisma.viewerAccess.findUnique({
      where: { id: params.id },
    })

    if (!viewerAccess) {
      return NextResponse.json({ error: "Viewer access not found" }, { status: 404 })
    }

    if (viewerAccess.treeId !== session.user.treeId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Prepare update data
    const updateData: { enabled?: boolean; password?: string } = {}

    if (typeof enabled === "boolean") {
      updateData.enabled = enabled
    }

    if (password) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
    }

    // Update viewer access
    const updated = await prisma.viewerAccess.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        familyCode: true,
        enabled: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ viewerAccess: updated })
  } catch (error) {
    console.error("Failed to update viewer access:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!isAdmin(session)) {
      return NextResponse.json(
        { error: "Only administrators can delete viewer access" },
        { status: 403 }
      )
    }

    // Verify the viewer access belongs to the admin's tree
    const viewerAccess = await prisma.viewerAccess.findUnique({
      where: { id: params.id },
    })

    if (!viewerAccess) {
      return NextResponse.json({ error: "Viewer access not found" }, { status: 404 })
    }

    if (viewerAccess.treeId !== session.user.treeId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Delete viewer access
    await prisma.viewerAccess.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete viewer access:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
