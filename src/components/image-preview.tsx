"use client"

interface ImagePreviewProps {
  file: File | null
  onRemove: () => void
}

export function ImagePreview({ file, onRemove }: ImagePreviewProps) {
  if (!file) return null

  const imageUrl = URL.createObjectURL(file)

  return (
    <div className="space-y-2">
      <img src={imageUrl || "/placeholder.svg"} alt="Preview" className="w-full h-auto rounded-md object-cover" />
      <div className="text-sm text-muted-foreground">File: {file.name}</div>
      <button onClick={onRemove} className="text-sm text-accent hover:underline">
        Ganti Gambar
      </button>
    </div>
  )
}
