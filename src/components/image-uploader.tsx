"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload } from "lucide-react"
import { Label } from "@/components/ui/label"

interface ImageUploaderProps {
  onImageSelect: (file: File) => void
  disabled?: boolean
}

export function ImageUploader({ onImageSelect, disabled = false }: ImageUploaderProps) {
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onImageSelect(file)
    }
  }

  return (
    <div className="relative">
      <Input
        id="photo"
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={disabled}
        className="opacity-0 absolute inset-0 z-10"
      />
      <Button asChild disabled={disabled} className="w-full flex items-center gap-2">
        <Label htmlFor="photo">
          <Upload className="h-4 w-4" />
          Pilih Foto
        </Label>
      </Button>
    </div>
  )
}
