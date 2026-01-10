"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/page-header"
import { EmptyState } from "@/components/ui/empty-state"
import { LoadingSkeleton } from "@/components/ui/loading-skeleton"
import { Plus, Key, Share2, Eye } from "lucide-react"
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
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <LoadingSkeleton className="h-8 w-48" />
          <LoadingSkeleton className="h-4 w-64" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <LoadingSkeleton className="h-48" />
          <LoadingSkeleton className="h-48" />
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Family Access"
        description="Share your tree with family members"
        actions={
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Access Code
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-l-4 border-l-green-600">
          <CardContent className="flex items-start gap-3 p-4">
            <div className="rounded-lg bg-green-50 p-2">
              <Key className="h-5 w-5 text-green-700" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Create Code</h3>
              <p className="mt-1 text-xs text-gray-600">Generate unique access</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="flex items-start gap-3 p-4">
            <div className="rounded-lg bg-green-50 p-2">
              <Share2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Share</h3>
              <p className="mt-1 text-xs text-gray-600">Send code to family</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="flex items-start gap-3 p-4">
            <div className="rounded-lg bg-purple-50 p-2">
              <Eye className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">View Only</h3>
              <p className="mt-1 text-xs text-gray-600">Read-only access</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">
          Access Codes{" "}
          <span className="text-sm font-normal text-gray-500">({viewerAccesses.length})</span>
        </h2>
        {viewerAccesses.length === 0 ? (
          <EmptyState
            icon={Key}
            title="No access codes yet"
            description="Create your first family access code to share your tree"
            action={{
              label: "Create Access Code",
              onClick: () => setShowCreateDialog(true),
            }}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
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
