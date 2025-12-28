# VanshVriksh MVP - Complete Implementation Guide

## How to Use This Guide

**When you return to this project:**
1. Tell me: "Let's continue building VanshVriksh MVP from the implementation guide"
2. I'll read this file and know exactly where we are
3. Check PROGRESS.md to see what's completed
4. I'll provide the next code snippet
5. You copy-paste, test, and update progress

---

## Project Status Tracker

Update this section as you complete each step:

```
[ ] Step 1: Project Setup (30 min)
[ ] Step 2: Database Setup (30 min)
[ ] Step 3: Authentication - Backend (1 hour)
[ ] Step 4: Authentication - Frontend (1 hour)
[ ] Step 5: Dashboard Layout (1 hour)
[ ] Step 6: Tree Data Model (1 hour)
[ ] Step 7: Add Member Form (2 hours)
[ ] Step 8: Edit Member Form (1 hour)
[ ] Step 9: Delete Member (30 min)
[ ] Step 10: List Members (1 hour)
[ ] Step 11: Tree Visualization Setup (2 hours)
[ ] Step 12: Tree Layout & Styling (2 hours)
[ ] Step 13: Image Upload (2 hours)
[ ] Step 14: Image Display in Tree (1 hour)
[ ] Step 15: Polish & Bug Fixes (3 hours)
[ ] Step 16: Deploy to Vercel (30 min)
[ ] Step 17: Production Testing (1 hour)
[ ] Step 18: Launch! (1 hour)

Total Estimated Time: 22-25 hours
```

---

## Complete Step-by-Step Implementation

### STEP 1: Project Setup (30 minutes)

#### 1.1 Create Next.js Project

```bash
# Run this command
npx create-next-app@latest vanshvriksh-mvp

# Answer prompts:
# ✓ TypeScript? → Yes
# ✓ ESLint? → Yes
# ✓ Tailwind CSS? → Yes
# ✓ src/ directory? → No
# ✓ App Router? → Yes
# ✓ Import alias? → Yes (@/*)

# Navigate to project
cd vanshvriksh-mvp

# Open in VS Code
code .
```

#### 1.2 Install Dependencies

```bash
# Install all dependencies at once
pnpm install

# Install additional packages
pnpm add @prisma/client next-auth@beta bcryptjs zod react-hook-form @hookform/resolvers
pnpm add @radix-ui/react-avatar @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-label @radix-ui/react-slot @radix-ui/react-toast
pnpm add class-variance-authority clsx tailwind-merge lucide-react
pnpm add reactflow
pnpm add uploadthing @uploadthing/react

# Install dev dependencies
pnpm add -D prisma @types/bcryptjs
```

#### 1.3 Initialize Shadcn/ui

```bash
npx shadcn-ui@latest init

# Answer prompts:
# Style? → Default
# Base color? → Slate
# CSS variables? → Yes

# Install required components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add card
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add form
```

#### 1.4 Initialize Git

```bash
git init
git add .
git commit -m "Initial commit: Next.js setup"
```

**✓ Step 1 Complete** - Mark in Progress Tracker

---

### STEP 2: Database Setup (30 minutes)

#### 2.1 Sign Up for Neon.tech

```
1. Go to: https://neon.tech
2. Sign up (free, no credit card)
3. Create new project: "vanshvriksh"
4. Region: Choose closest to you
5. Copy the connection string (PostgreSQL)
```

#### 2.2 Initialize Prisma

```bash
npx prisma init
```

#### 2.3 Update .env

```bash
# Create .env.local (or edit .env)
DATABASE_URL="postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/vanshvriksh?sslmode=require"
NEXTAUTH_SECRET="run this command to generate: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
```

#### 2.4 Create Database Schema

**File: `prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// User model (for authentication)
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String
  name          String?
  emailVerified DateTime?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  tree Tree?

  @@map("users")
}

// Tree model (one per user for MVP)
model Tree {
  id        String   @id @default(cuid())
  name      String
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  nodes     Node[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("trees")
}

// Node model (family members)
model Node {
  id             String    @id @default(cuid())
  treeId         String
  tree           Tree      @relation(fields: [treeId], references: [id], onDelete: Cascade)

  // Tree structure
  parentId       String?
  parent         Node?     @relation("NodeToNode", fields: [parentId], references: [id], onDelete: SetNull)
  children       Node[]    @relation("NodeToNode")

  // Personal information
  name           String
  nickname       String?
  email          String?
  phone          String?
  birthDate      DateTime? @db.Date
  deathDate      DateTime? @db.Date
  gender         String?   // "male", "female", "other"
  profilePicture String?
  address        String?
  bio            String?   @db.Text

  // Metadata
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  @@map("nodes")
}
```

#### 2.5 Push Schema to Database

```bash
# Create database tables
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Open Prisma Studio to view database
npx prisma studio
# This opens http://localhost:5555
```

#### 2.6 Create Prisma Client Singleton

**File: `lib/prisma.ts`**

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

**✓ Step 2 Complete** - Database is ready!

---

### STEP 3: Authentication - Backend (1 hour)

#### 3.1 Create NextAuth Configuration

**File: `lib/auth.ts`**

```typescript
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials")
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!user || !user.password) {
          throw new Error("Invalid credentials")
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      }
    })
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
}
```

#### 3.2 Create NextAuth API Route

**File: `app/api/auth/[...nextauth]/route.ts`**

```typescript
import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
```

#### 3.3 Create Signup API Route

**File: `app/api/auth/signup/route.ts`**

```typescript
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, name } = body

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      }
    })

    // Create default tree for user
    await prisma.tree.create({
      data: {
        name: `${name || email}'s Family Tree`,
        userId: user.id,
      }
    })

    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
```

**✓ Step 3 Complete** - Auth backend ready!

---

### STEP 4: Authentication - Frontend (1 hour)

#### 4.1 Update NextAuth Types

**File: `types/next-auth.d.ts`**

```typescript
import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
    }
  }
}
```

#### 4.2 Create Auth Provider

**File: `components/providers/auth-provider.tsx`**

```typescript
"use client"

import { SessionProvider } from "next-auth/react"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}
```

#### 4.3 Update Root Layout

**File: `app/layout.tsx`**

```typescript
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/components/providers/auth-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "VanshVriksh - Family Tree",
  description: "Create and manage your family tree",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

#### 4.4 Create Login Page

**File: `app/(auth)/login/page.tsx`**

```typescript
"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
      } else {
        router.push("/dashboard")
        router.refresh()
      }
    } catch (error) {
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>
            Enter your credentials to access your family tree
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
            <p className="text-sm text-center text-gray-600">
              Don't have an account?{" "}
              <Link href="/signup" className="text-blue-600 hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
```

#### 4.5 Create Signup Page

**File: `app/(auth)/signup/page.tsx`**

```typescript
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Something went wrong")
        return
      }

      // Redirect to login
      router.push("/login?signup=success")
    } catch (error) {
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>
            Enter your details to create your family tree
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
              <p className="text-xs text-gray-500">
                Must be at least 8 characters
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create account"}
            </Button>
            <p className="text-sm text-center text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
```

#### 4.6 Create Landing Page

**File: `app/page.tsx`**

```typescript
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <div className="text-center space-y-6 px-4">
        <h1 className="text-6xl font-bold text-gray-900">
          VanshVriksh
        </h1>
        <p className="text-xl text-gray-600 max-w-md mx-auto">
          Create and manage your family tree with ease
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Link href="/signup">
            <Button size="lg">
              Get Started
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
```

**✓ Step 4 Complete** - Authentication UI ready!

#### 4.7 Test Authentication

```bash
# Run development server
pnpm dev

# Open browser: http://localhost:3000
# 1. Click "Get Started"
# 2. Create account
# 3. Sign in
# Should redirect to /dashboard (404 for now - we'll create it next)
```

---

### STEP 5: Dashboard Layout (1 hour)

**File: `app/(dashboard)/layout.tsx`**

```typescript
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { LogOut, TreePine, Users, User } from "lucide-react"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <TreePine className="h-8 w-8 text-green-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">
                  VanshVriksh
                </span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/tree"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
                >
                  <TreePine className="h-4 w-4 mr-1" />
                  Tree View
                </Link>
                <Link
                  href="/dashboard/members"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
                >
                  <Users className="h-4 w-4 mr-1" />
                  Members
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {session.user.name || session.user.email}
              </span>
              <form action="/api/auth/signout" method="POST">
                <Button variant="ghost" size="sm" type="submit">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
```

**File: `app/(dashboard)/dashboard/page.tsx`**

```typescript
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
        select: { nodes: true }
      }
    }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {session!.user.name}!
        </h1>
        <p className="text-gray-600">
          Manage your family tree and members
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Family Tree
            </CardTitle>
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
            <CardTitle className="text-sm font-medium">
              Total Members
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tree?._count.nodes || 0}</div>
            <p className="text-xs text-muted-foreground">
              Family members added
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Quick Actions
            </CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/members/add">
              <Button className="w-full">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            Follow these steps to build your family tree
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-4">
            <div className="rounded-full bg-blue-100 p-2">
              <span className="font-bold text-blue-600">1</span>
            </div>
            <div>
              <h3 className="font-semibold">Add yourself as the root node</h3>
              <p className="text-sm text-gray-600">
                Start by creating a node for yourself
              </p>
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
              <p className="text-sm text-gray-400">
                Add parents, siblings, and children
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="rounded-full bg-gray-100 p-2">
              <span className="font-bold text-gray-400">3</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-400">View your tree</h3>
              <p className="text-sm text-gray-400">
                Visualize your family tree
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

**✓ Step 5 Complete** - Dashboard ready!

---

### STEP 6: Node API Routes (1 hour)

#### 6.1 Create Nodes API - GET & POST

**File: `app/api/nodes/route.ts`**

```typescript
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET all nodes for user's tree
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's tree
    const tree = await prisma.tree.findUnique({
      where: { userId: session.user.id },
      include: {
        nodes: {
          orderBy: { createdAt: "asc" }
        }
      }
    })

    if (!tree) {
      return NextResponse.json({ error: "Tree not found" }, { status: 404 })
    }

    return NextResponse.json({ nodes: tree.nodes })
  } catch (error) {
    console.error("GET nodes error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST create new node
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, nickname, email, phone, birthDate, gender, address, bio, parentId } = body

    // Validation
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    // Get user's tree
    const tree = await prisma.tree.findUnique({
      where: { userId: session.user.id }
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
        parentId: parentId || null
      }
    })

    return NextResponse.json({ node }, { status: 201 })
  } catch (error) {
    console.error("POST node error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
```

#### 6.2 Create Nodes API - Individual Node Operations

**File: `app/api/nodes/[id]/route.ts`**

```typescript
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET single node
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const node = await prisma.node.findUnique({
      where: { id: params.id },
      include: {
        parent: true,
        children: true
      }
    })

    if (!node) {
      return NextResponse.json({ error: "Node not found" }, { status: 404 })
    }

    // Verify user owns this tree
    const tree = await prisma.tree.findUnique({
      where: { id: node.treeId }
    })

    if (tree?.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json({ node })
  } catch (error) {
    console.error("GET node error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT update node
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, nickname, email, phone, birthDate, deathDate, gender, address, bio, profilePicture } = body

    // Get node
    const existingNode = await prisma.node.findUnique({
      where: { id: params.id },
      include: { tree: true }
    })

    if (!existingNode) {
      return NextResponse.json({ error: "Node not found" }, { status: 404 })
    }

    // Verify user owns this tree
    if (existingNode.tree.userId !== session.user.id) {
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
        profilePicture
      }
    })

    return NextResponse.json({ node })
  } catch (error) {
    console.error("PUT node error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE node
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get node
    const node = await prisma.node.findUnique({
      where: { id: params.id },
      include: { tree: true, children: true }
    })

    if (!node) {
      return NextResponse.json({ error: "Node not found" }, { status: 404 })
    }

    // Verify user owns this tree
    if (node.tree.userId !== session.user.id) {
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
      where: { id: params.id }
    })

    return NextResponse.json({ message: "Node deleted successfully" })
  } catch (error) {
    console.error("DELETE node error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
```

**✓ Step 6 Complete** - API routes ready!

---

### STEP 7: Add Member Form (2 hours)

**File: `app/(dashboard)/dashboard/members/add/page.tsx`**

```typescript
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function AddMemberPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    nickname: "",
    email: "",
    phone: "",
    birthDate: "",
    gender: "",
    address: "",
    bio: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/nodes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Something went wrong")
        return
      }

      router.push("/dashboard/members")
      router.refresh()
    } catch (error) {
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/members">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add Family Member</h1>
          <p className="text-gray-600">Fill in the details of the family member</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Member Information</CardTitle>
          <CardDescription>
            All fields are optional except name
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                {error}
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nickname">Nickname</Label>
                <Input
                  id="nickname"
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleChange}
                  placeholder="Johnny"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1234567890"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthDate">Birth Date</Label>
                <Input
                  id="birthDate"
                  name="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="123 Main St, City, State, ZIP"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us about this person..."
                rows={4}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Link href="/dashboard/members">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? "Adding..." : "Add Member"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

**Install Select component:**

```bash
npx shadcn-ui@latest add select
npx shadcn-ui@latest add textarea
```

**✓ Step 7 Complete** - Add member form ready!

---

## Quick Commands Reference

```bash
# Start development
pnpm dev

# View database
npx prisma studio

# Reset database
npx prisma db push --force-reset

# Build for production
pnpm build

# Deploy to Vercel
vercel --prod
```

---

## Common Issues & Solutions

### Issue: "Module not found: @prisma/client"
```bash
Solution: npx prisma generate
```

### Issue: "Database connection failed"
```bash
Solution: Check DATABASE_URL in .env.local
```

### Issue: "NextAuth session not working"
```bash
Solution: Check NEXTAUTH_SECRET is set
```

### Issue: "Can't import components"
```bash
Solution: Run npx shadcn-ui@latest add [component-name]
```

---

**Last Updated**: December 2025
**Status**: Steps 1-7 Complete ✓

**For Steps 8-18**: See **MVP_IMPLEMENTATION_GUIDE_PART2.md** ⭐

Steps 8-18 in Part 2 include:
- Step 8: Edit & List Members (with Delete confirmation)
- Step 9: Tree Visualization with React Flow
- Step 10: Image Upload with Cloudinary
- Step 11-14: Final Polish & Deployment to Vercel
- Step 15-18: Testing & Launch

**All code is ready and waiting for you in Part 2!**
