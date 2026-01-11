"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LoadingButton } from "@/components/ui/loading-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ImageUpload } from "@/components/image-upload"
import { useSessionRole } from "@/hooks/use-session-role"

interface Node {
  id: string
  name: string
  nickname?: string | null
  spouseId?: string | null
}

export default function AddMemberPage() {
  const router = useRouter()
  const { isAdmin, isLoading } = useSessionRole()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [nodes, setNodes] = useState<Node[]>([])
  const [fetchingNodes, setFetchingNodes] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    nickname: "",
    email: "",
    phone: "",
    birthDate: "",
    gender: "",
    address: "",
    bio: "",
    parentId: "none",
    spouseId: "none",
    profilePicture: "",
  })

  // Redirect viewers to dashboard
  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push("/dashboard")
    }
  }, [isAdmin, isLoading, router])

  useEffect(() => {
    if (isAdmin) {
      fetchNodes()
    }
  }, [isAdmin])

  const fetchNodes = async () => {
    try {
      const response = await fetch("/api/nodes")
      if (!response.ok) throw new Error("Failed to fetch nodes")
      const data = await response.json()
      setNodes(data.nodes || [])
    } catch (_error) {
      console.error("Failed to load family members:", _error)
    } finally {
      setFetchingNodes(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Prepare data - convert "none" or empty values to null
      const submitData = {
        ...formData,
        parentId: formData.parentId && formData.parentId !== "none" ? formData.parentId : null,
        spouseId: formData.spouseId && formData.spouseId !== "none" ? formData.spouseId : null,
      }

      const response = await fetch("/api/nodes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Something went wrong")
        setLoading(false)
        return
      }

      // Keep loading true - redirect will unmount component
      router.push("/dashboard/members")
      router.refresh()
    } catch {
      setError("Something went wrong")
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/members">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
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
          <CardDescription>All fields are optional except name</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-500">{error}</div>}

            <div className="space-y-2">
              <Label>Profile Picture</Label>
              <ImageUpload
                value={formData.profilePicture}
                onChange={(url) => setFormData((prev) => ({ ...prev, profilePicture: url }))}
                onRemove={() => setFormData((prev) => ({ ...prev, profilePicture: "" }))}
              />
            </div>

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
                  disabled={loading}
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
                  disabled={loading}
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
                  disabled={loading}
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
                  disabled={loading}
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
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, gender: value }))}
                  disabled={loading}
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

              <div className="space-y-2">
                <Label htmlFor="parent">Parent</Label>
                <Select
                  value={formData.parentId}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, parentId: value }))}
                  disabled={fetchingNodes || loading}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={fetchingNodes ? "Loading..." : "None (Root member)"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Root member)</SelectItem>
                    {nodes.map((node) => (
                      <SelectItem key={node.id} value={node.id}>
                        {node.name}
                        {node.nickname && ` "${node.nickname}"`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="spouse">Spouse (Optional)</Label>
                <Select
                  value={formData.spouseId}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, spouseId: value }))}
                  disabled={fetchingNodes || loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={fetchingNodes ? "Loading..." : "None"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {nodes
                      .filter((node) => !node.spouseId) // Only show nodes without a spouse
                      .map((node) => (
                        <SelectItem key={node.id} value={node.id}>
                          {node.name}
                          {node.nickname && ` "${node.nickname}"`}
                        </SelectItem>
                      ))}
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
                disabled={loading}
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
                disabled={loading}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Link href="/dashboard/members">
                <Button type="button" variant="outline" disabled={loading}>
                  Cancel
                </Button>
              </Link>
              <LoadingButton type="submit" loading={loading}>
                Add Member
              </LoadingButton>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
