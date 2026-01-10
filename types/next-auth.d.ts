import { DefaultSession, DefaultUser } from "next-auth"
import { DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string
      email: string
      name?: string | null
      role: "admin" | "viewer"
      treeId: string
    }
  }

  interface User extends DefaultUser {
    id: string
    email: string
    name?: string | null
    role: "admin" | "viewer"
    treeId: string
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string
    role: "admin" | "viewer"
    treeId: string
  }
}
