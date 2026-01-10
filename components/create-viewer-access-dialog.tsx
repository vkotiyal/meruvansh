"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { LoadingButton } from "@/components/ui/loading-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CreateViewerAccessDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateViewerAccessDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateViewerAccessDialogProps) {
  const { toast } = useToast()
  const [familyCode, setFamilyCode] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [generatingSuggestion, setGeneratingSuggestion] = useState(false)

  useEffect(() => {
    if (open && !familyCode) {
      generateSuggestion()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const generateSuggestion = async () => {
    setGeneratingSuggestion(true)
    try {
      // Use a simple suggestion based on current year
      const year = new Date().getFullYear()
      const suggestion = `family${year}`
      setFamilyCode(suggestion)
    } catch (error) {
      console.error("Failed to generate suggestion:", error)
    } finally {
      setGeneratingSuggestion(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!familyCode || !password) {
      setError("Both family code and password are required")
      return
    }

    if (familyCode.length < 4) {
      setError("Family code must be at least 4 characters")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/viewer-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          familyCode: familyCode.toLowerCase().trim(),
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to create access code")
        return
      }

      // Success
      toast({
        title: "Success",
        description: `Access code "${familyCode}" created successfully`,
      })
      setFamilyCode("")
      setPassword("")
      onSuccess()
    } catch (err) {
      console.error("Failed to create viewer access:", err)
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFamilyCode("")
    setPassword("")
    setError("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Family Access Code</DialogTitle>
          <DialogDescription>
            Create a unique code and password for family members to view your tree
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-500">{error}</div>}

            <div className="space-y-2">
              <Label htmlFor="family-code">Family Code *</Label>
              <div className="flex space-x-2">
                <Input
                  id="family-code"
                  value={familyCode}
                  onChange={(e) => setFamilyCode(e.target.value.toLowerCase())}
                  placeholder="e.g., sharma2026"
                  required
                  className="flex-1"
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={generateSuggestion}
                  disabled={generatingSuggestion || loading}
                  title="Generate suggestion"
                >
                  <RefreshCw className={`h-4 w-4 ${generatingSuggestion ? "animate-spin" : ""}`} />
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Lowercase letters and numbers only, 4-30 characters. This must be unique.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter a secure password"
                required
                minLength={6}
                disabled={loading}
              />
              <p className="text-xs text-gray-500">Minimum 6 characters</p>
            </div>

            <div className="rounded-md bg-blue-50 p-3">
              <p className="text-sm text-blue-700">
                <strong>Important:</strong> Share this code and password securely with family
                members. They&apos;ll use it to login with read-only access.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <LoadingButton type="submit" loading={loading}>
              Create Access Code
            </LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
