"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Key, Power, Trash2, Copy, Check } from "lucide-react"
import { Switch } from "@/components/ui/switch"

interface ViewerAccess {
  id: string
  familyCode: string
  enabled: boolean
  createdAt: string
  updatedAt: string
}

interface ViewerAccessCardProps {
  access: ViewerAccess
  onUpdate: () => void
  onDelete: () => void
}

export function ViewerAccessCard({ access, onUpdate, onDelete }: ViewerAccessCardProps) {
  const [loading, setLoading] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [copied, setCopied] = useState(false)

  const handleToggleEnabled = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/viewer-access/${access.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !access.enabled }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update")
      }

      onUpdate()
    } catch (error) {
      console.error("Failed to toggle access:", error)
      alert(error instanceof Error ? error.message : "Failed to update access")
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    setPasswordError("")

    if (!newPassword || newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters")
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/viewer-access/${access.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update password")
      }

      setShowPasswordDialog(false)
      setNewPassword("")
      onUpdate()
    } catch (error) {
      console.error("Failed to change password:", error)
      setPasswordError(error instanceof Error ? error.message : "Failed to update password")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/viewer-access/${access.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete")
      }

      setShowDeleteDialog(false)
      onDelete()
    } catch (error) {
      console.error("Failed to delete access:", error)
      alert(error instanceof Error ? error.message : "Failed to delete access")
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(access.familyCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  return (
    <>
      <Card className={access.enabled ? "" : "opacity-60"}>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold">{access.familyCode}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="h-6 w-6 p-0"
                    title="Copy family code"
                  >
                    {copied ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  Created {new Date(access.createdAt).toLocaleDateString()}
                </p>
                <div className="mt-2 flex items-center space-x-2">
                  <div
                    className={`h-2 w-2 rounded-full ${access.enabled ? "bg-green-500" : "bg-gray-400"}`}
                  />
                  <span className="text-xs text-gray-600">
                    {access.enabled ? "Active" : "Disabled"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={access.enabled}
                  onCheckedChange={handleToggleEnabled}
                  disabled={loading}
                />
                <Label className="text-sm">
                  <Power className="mr-1 inline h-3 w-3" />
                  {access.enabled ? "Enabled" : "Disabled"}
                </Label>
              </div>
            </div>

            <div className="flex space-x-2 border-t pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPasswordDialog(true)}
                className="flex-1"
              >
                <Key className="mr-1 h-3 w-3" />
                Change Password
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Set a new password for family code: <strong>{access.familyCode}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
              {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangePassword} disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Family Access Code?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the family code <strong>{access.familyCode}</strong>.
              Anyone using this code will no longer be able to access the family tree. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
