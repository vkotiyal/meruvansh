declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      role: "admin" | "viewer"
      treeId: string
    }
  }

  interface User {
    id: string
    email: string
    name?: string | null
    role: "admin" | "viewer"
    treeId: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: "admin" | "viewer"
    treeId: string
  }
}
