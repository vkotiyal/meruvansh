import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { env } from "@/lib/env"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        familyCode: { label: "Family Code", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.password) {
          throw new Error("Invalid credentials")
        }

        // ADMIN LOGIN (email + password)
        if (credentials?.email) {
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
          })

          if (!user || !user.password) {
            throw new Error("Invalid credentials")
          }

          const isCorrectPassword = await bcrypt.compare(credentials.password, user.password)

          if (!isCorrectPassword) {
            throw new Error("Invalid credentials")
          }

          // Get user's tree
          const tree = await prisma.tree.findUnique({
            where: { userId: user.id },
          })

          if (!tree) {
            throw new Error("No tree found for user")
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: "admin" as const,
            treeId: tree.id,
          }
        }

        // VIEWER LOGIN (familyCode + password)
        if (credentials?.familyCode) {
          const viewerAccess = await prisma.viewerAccess.findUnique({
            where: {
              familyCode: credentials.familyCode,
            },
            include: {
              tree: true,
            },
          })

          if (!viewerAccess) {
            throw new Error("Invalid family code")
          }

          if (!viewerAccess.enabled) {
            throw new Error("Access has been disabled")
          }

          const isCorrectPassword = await bcrypt.compare(
            credentials.password,
            viewerAccess.password
          )

          if (!isCorrectPassword) {
            throw new Error("Invalid password")
          }

          return {
            id: viewerAccess.id,
            email: viewerAccess.familyCode, // Use family code as identifier
            name: `${viewerAccess.tree.name} Viewer`,
            role: "viewer" as const,
            treeId: viewerAccess.treeId,
          }
        }

        throw new Error("Invalid credentials")
      },
    }),
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
        token.role = user.role
        token.treeId = user.treeId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as "admin" | "viewer"
        session.user.treeId = token.treeId as string
      }
      return session
    },
  },
  secret: env.NEXTAUTH_SECRET,
}
