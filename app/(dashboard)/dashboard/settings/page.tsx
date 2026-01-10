"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useSessionRole } from "@/hooks/use-session-role"
import { useRouter } from "next/navigation"
import { ViewerAccessCard } from "@/components/viewer-access-card"
import { CreateViewerAccessDialog } from "@/components/create-viewer-access-dialog"

interface ViewerAccess {
  id: string
  familyCode: string
  enabled: boolean
  createdAt: string
  updatedAt: string
}

export default function SettingsPage() {
  const router = useRouter()
  const { isAdmin, isLoading } = useSessionRole()
  const [viewerAccesses, setViewerAccesses] = useState<ViewerAccess[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  // Redirect viewers to dashboard
  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push("/dashboard")
    }
  }, [isAdmin, isLoading, router])

  useEffect(() => {
    if (isAdmin) {
      fetchViewerAccesses()
    }
  }, [isAdmin])

  const fetchViewerAccesses = async () => {
    try {
      const response = await fetch("/api/viewer-access")
      if (!response.ok) throw new Error("Failed to fetch viewer accesses")
      const data = await response.json()
      setViewerAccesses(data.viewerAccesses || [])
    } catch (error) {
      console.error("Failed to load viewer accesses:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSuccess = () => {
    setShowCreateDialog(false)
    fetchViewerAccesses()
  }

  const handleUpdate = () => {
    fetchViewerAccesses()
  }

  const handleDelete = () => {
    fetchViewerAccesses()
  }

  if (isLoading || loading) {
    return <div className="flex h-64 items-center justify-center">Loading...</div>
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Family Access</h1>
          <p className="text-gray-600">Manage viewer access to your family tree</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Access Code
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How Family Access Works</CardTitle>
          <CardDescription>
            Create unique family codes that allow read-only access to your tree
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-4">
            <div className="rounded-full bg-blue-100 p-2">
              <span className="font-bold text-blue-600">1</span>
            </div>
            <div>
              <h3 className="font-semibold">Create a Family Code</h3>
              <p className="text-sm text-gray-600">
                Generate a unique code (e.g., &quot;sharma2026&quot;) with a password
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="rounded-full bg-blue-100 p-2">
              <span className="font-bold text-blue-600">2</span>
            </div>
            <div>
              <h3 className="font-semibold">Share with Family</h3>
              <p className="text-sm text-gray-600">
                Give the code and password to family members you want to grant access
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="rounded-full bg-blue-100 p-2">
              <span className="font-bold text-blue-600">3</span>
            </div>
            <div>
              <h3 className="font-semibold">They Login as Viewers</h3>
              <p className="text-sm text-gray-600">
                Family members use &quot;Family Access&quot; login to view the tree (read-only)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Active Access Codes</h2>
        {viewerAccesses.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="mb-4 text-gray-500">No family access codes created yet</p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Access Code
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {viewerAccesses.map((access) => (
              <ViewerAccessCard
                key={access.id}
                access={access}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      <CreateViewerAccessDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={handleCreateSuccess}
      />
    </div>
  )
}
