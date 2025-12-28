"use client"

import { CldUploadWidget } from "next-cloudinary"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Upload, X } from "lucide-react"

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  onRemove: () => void
}

export function ImageUpload({ value, onChange, onRemove }: ImageUploadProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        {value ? (
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src={value} />
              <AvatarFallback>Profile</AvatarFallback>
            </Avatar>
            <Button
              type="button"
              onClick={onRemove}
              size="icon"
              variant="destructive"
              className="absolute -right-2 -top-2 h-8 w-8 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Avatar className="h-24 w-24">
            <AvatarFallback>
              <Upload className="h-8 w-8 text-gray-400" />
            </AvatarFallback>
          </Avatar>
        )}

        <CldUploadWidget
          uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
          onSuccess={(result) => {
            if (typeof result.info === "object" && result.info && "secure_url" in result.info) {
              onChange(result.info.secure_url)
            }
          }}
        >
          {({ open }) => (
            <Button type="button" variant="outline" onClick={() => open()}>
              <Upload className="mr-2 h-4 w-4" />
              {value ? "Change Photo" : "Upload Photo"}
            </Button>
          )}
        </CldUploadWidget>
      </div>

      {value && (
        <p className="text-xs text-gray-500">Click the X button to remove the current photo</p>
      )}
    </div>
  )
}
