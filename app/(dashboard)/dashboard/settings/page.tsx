"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PageHeader } from "@/components/ui/page-header"
import { EmptyState } from "@/components/ui/empty-state"
import { LoadingSkeleton } from "@/components/ui/loading-skeleton"
import { LoadingButton } from "@/components/ui/loading-button"
import { Plus, Key, Share2, Eye, TreePine, Check } from "lucide-react"
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

interface Tree {
  id: string
  name: string
  createdAt: string
}

export default function SettingsPage() {
  const router = useRouter()
  const { isAdmin, isLoading } = useSessionRole()
  const [viewerAccesses, setViewerAccesses] = useState<ViewerAccess[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  // Tree name state
  const [tree, setTree] = useState<Tree | null>(null)
  const [treeName, setTreeName] = useState("")
  const [savingTreeName, setSavingTreeName] = useState(false)
  const [treeNameSaved, setTreeNameSaved] = useState(false)

  // Redirect viewers to dashboard
  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push("/dashboard")
    }
  }, [isAdmin, isLoading, router])

  useEffect(() => {
    if (isAdmin) {
      fetchTree()
      fetchViewerAccesses()
    }
  }, [isAdmin])

  const fetchTree = async () => {
    try {
      const response = await fetch("/api/tree")
      if (!response.ok) throw new Error("Failed to fetch tree")
      const data = await response.json()
      setTree(data.tree)
      setTreeName(data.tree?.name || "")
    } catch (error) {
      console.error("Failed to load tree:", error)
    }
  }

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

  const handleSaveTreeName = async () => {
    if (!treeName.trim() || treeName === tree?.name) return

    setSavingTreeName(true)
    setTreeNameSaved(false)

    try {
      const response = await fetch("/api/tree", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: treeName.trim() }),
      })

      if (!response.ok) throw new Error("Failed to update tree name")

      const data = await response.json()
      setTree(data.tree)
      setTreeNameSaved(true)

      // Reset saved indicator after 2 seconds
      setTimeout(() => setTreeNameSaved(false), 2000)

      // Refresh the page to update header
      router.refresh()
    } catch (error) {
      console.error("Failed to save tree name:", error)
    } finally {
      setSavingTreeName(false)
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
        <LoadingSkeleton className="h-32" />
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

  const hasTreeNameChanged = treeName !== tree?.name

  return (
    <div className="space-y-8">
      <PageHeader title="Settings" description="Manage your family tree settings and access" />

      {/* Tree Settings Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TreePine className="h-5 w-5 text-green-600" />
            <CardTitle>Tree Settings</CardTitle>
          </div>
          <CardDescription>
            Customize your family tree name. This name is shown to all viewers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <div className="flex-1">
              <Label htmlFor="treeName" className="sr-only">
                Tree Name
              </Label>
              <Input
                id="treeName"
                value={treeName}
                onChange={(e) => setTreeName(e.target.value)}
                placeholder="Enter tree name (e.g., Kotiyal Family Tree)"
                disabled={savingTreeName}
              />
            </div>
            <LoadingButton
              onClick={handleSaveTreeName}
              loading={savingTreeName}
              disabled={!hasTreeNameChanged || !treeName.trim()}
            >
              {treeNameSaved ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Saved
                </>
              ) : (
                "Save"
              )}
            </LoadingButton>
          </div>
        </CardContent>
      </Card>

      {/* Family Access Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Family Access</h2>
            <p className="text-sm text-muted-foreground">Share your tree with family members</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Access Code
          </Button>
        </div>

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
          <h3 className="text-md font-medium">
            Access Codes{" "}
            <span className="text-sm font-normal text-gray-500">({viewerAccesses.length})</span>
          </h3>
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
      </div>

      <CreateViewerAccessDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={handleCreateSuccess}
      />
    </div>
  )
}
