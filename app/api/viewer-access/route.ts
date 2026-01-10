import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { isAdmin } from "@/lib/authorization"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!isAdmin(session)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const viewerAccesses = await prisma.viewerAccess.findMany({
      where: { treeId: session.user.treeId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        familyCode: true,
        enabled: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ viewerAccesses })
  } catch (error) {
    console.error("Failed to fetch viewer accesses:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!isAdmin(session)) {
      return NextResponse.json(
        { error: "Only administrators can create viewer access" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { familyCode, password } = body

    if (!familyCode || !password) {
      return NextResponse.json({ error: "Family code and password are required" }, { status: 400 })
    }

    // Validate family code format (lowercase alphanumeric)
    const cleanFamilyCode = familyCode.toLowerCase().trim()
    if (!/^[a-z0-9]+$/.test(cleanFamilyCode)) {
      return NextResponse.json(
        { error: "Family code must contain only lowercase letters and numbers" },
        { status: 400 }
      )
    }

    if (cleanFamilyCode.length < 4 || cleanFamilyCode.length > 30) {
      return NextResponse.json(
        { error: "Family code must be between 4 and 30 characters" },
        { status: 400 }
      )
    }

    // Check if family code already exists
    const existing = await prisma.viewerAccess.findUnique({
      where: { familyCode: cleanFamilyCode },
    })

    if (existing) {
      return NextResponse.json(
        { error: "This family code is already taken. Please choose another." },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create viewer access
    const viewerAccess = await prisma.viewerAccess.create({
      data: {
        treeId: session.user.treeId,
        familyCode: cleanFamilyCode,
        password: hashedPassword,
      },
      select: {
        id: true,
        familyCode: true,
        enabled: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ viewerAccess }, { status: 201 })
  } catch (error) {
    console.error("Failed to create viewer access:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
