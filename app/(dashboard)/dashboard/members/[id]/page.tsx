"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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

interface Node {
  id: string
  name: string
  nickname?: string | null
}

export default function EditMemberPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
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
    parentId: "",
    profilePicture: "",
  })

  useEffect(() => {
    fetchNode()
    fetchNodes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  const fetchNode = async () => {
    try {
      const response = await fetch(`/api/nodes/${params.id}`)
      if (!response.ok) throw new Error("Failed to fetch node")

      const data = await response.json()
      setFormData({
        name: data.node.name || "",
        nickname: data.node.nickname || "",
        email: data.node.email || "",
        phone: data.node.phone || "",
        birthDate: data.node.birthDate ? data.node.birthDate.split("T")[0] : "",
        gender: data.node.gender || "",
        address: data.node.address || "",
        bio: data.node.bio || "",
        parentId: data.node.parentId || "none",
        profilePicture: data.node.profilePicture || "",
      })
    } catch {
      setError("Failed to load member data")
    } finally {
      setFetchLoading(false)
    }
  }

  const fetchNodes = async () => {
    try {
      const response = await fetch("/api/nodes")
      if (!response.ok) throw new Error("Failed to fetch nodes")
      const data = await response.json()
      // Filter out the current node and its descendants to prevent circular relationships
      const availableNodes = data.nodes.filter((node: Node) => node.id !== params.id)
      setNodes(availableNodes)
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
      // Prepare data - convert "none" or empty parentId to null
      const submitData = {
        ...formData,
        parentId: formData.parentId && formData.parentId !== "none" ? formData.parentId : null,
      }

      const response = await fetch(`/api/nodes/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Something went wrong")
        return
      }

      router.push("/dashboard/members")
      router.refresh()
    } catch {
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return <div className="flex h-64 items-center justify-center">Loading...</div>
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
          <h1 className="text-3xl font-bold text-gray-900">Edit Family Member</h1>
          <p className="text-gray-600">Update the member&apos;s information</p>
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
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nickname">Nickname</Label>
                <Input
                  id="nickname"
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleChange}
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
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, gender: value }))}
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
                  disabled={fetchingNodes}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={fetchingNodes ? "Loading..." : "None (Root member)"} />
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" name="bio" value={formData.bio} onChange={handleChange} rows={4} />
            </div>

            <div className="flex justify-end space-x-4">
              <Link href="/dashboard/members">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
