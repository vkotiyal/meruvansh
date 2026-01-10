"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { TreePine } from "lucide-react"
import { LoadingButton } from "@/components/ui/loading-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type LoginMode = "admin" | "viewer"

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<LoginMode>("admin")
  const [email, setEmail] = useState("")
  const [familyCode, setFamilyCode] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Build credentials object based on mode
      const credentials: Record<string, string> = { password }

      if (mode === "admin") {
        credentials.email = email
      } else {
        credentials.familyCode = familyCode
      }

      const result = await signIn("credentials", {
        ...credentials,
        redirect: false,
      })

      if (result?.error) {
        if (mode === "admin") {
          setError("Invalid email or password")
        } else {
          setError("Invalid family code or password")
        }
        setLoading(false)
      } else {
        // Keep loading true - redirect will unmount component
        router.push("/dashboard")
        router.refresh()
      }
    } catch {
      setError("Something went wrong")
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-green-50 to-background px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <TreePine className="h-6 w-6 text-green-700" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>
            {mode === "admin"
              ? "Sign in to manage your family tree"
              : "Enter family access code to view the tree"}
          </CardDescription>
        </CardHeader>

        {/* Login Mode Toggle */}
        <div className="mx-6 mb-4 flex rounded-lg border bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => {
              setMode("admin")
              setError("")
            }}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              mode === "admin"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Admin Login
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("viewer")
              setError("")
            }}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              mode === "viewer"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Family Access
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-500">{error}</div>}

            {mode === "admin" ? (
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="familyCode">Family Code</Label>
                <Input
                  id="familyCode"
                  type="text"
                  placeholder="e.g., sharma2024"
                  value={familyCode}
                  onChange={(e) => setFamilyCode(e.target.value.toLowerCase())}
                  required
                  disabled={loading}
                />
                <p className="text-xs text-gray-500">
                  Ask your family admin for the family access code
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <LoadingButton type="submit" className="w-full" loading={loading}>
              Sign in
            </LoadingButton>

            {mode === "admin" && (
              <p className="text-center text-sm text-gray-600">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="text-primary hover:underline">
                  Sign up
                </Link>
              </p>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
