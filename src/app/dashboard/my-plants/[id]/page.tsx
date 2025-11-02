"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useSession } from "@/hooks/use-session"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Leaf, ArrowLeft, Trash2, Edit2, CheckCircle } from "lucide-react"
import Link from "next/link"

interface PlantingRecord {
  id: string
  cropName: string
  cropImage: string
  plantedDate: string
  expectedHarvestDate: string
  harvestDate: string | null
  quantity: number | null
  notes: string
  isCompleted: boolean
}

interface FormData {
  cropName: string
  quantity: number | null
  notes: string
  harvestDate: string | null
  isCompleted: boolean
}

export default function PlantDetailPage() {
  const session = useSession()
  const router = useRouter()
  const params = useParams()
  const plantId = params.id as string

  const [plant, setPlant] = useState<PlantingRecord | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    cropName: "",
    quantity: null,
    notes: "",
    harvestDate: null,
    isCompleted: false,
  })

  useEffect(() => {
    if (!session?.user || !plantId) return

    const fetchPlant = async () => {
      try {
        const response = await fetch(`/api/planting/${plantId}`)
        if (!response.ok) throw new Error("Failed to fetch plant")
        const data = await response.json()
        setPlant(data)
        setFormData({
          cropName: data.cropName,
          quantity: data.quantity ? Number.parseFloat(data.quantity) : null,
          notes: data.notes,
          harvestDate: data.harvestDate ? new Date(data.harvestDate).toISOString().split("T")[0] : null,
          isCompleted: data.isCompleted,
        })
      } catch (error) {
        console.error("Error fetching plant:", error)
        alert("Gagal memuat data tanaman")
        router.push("/dashboard/my-plants")
      } finally {
        setLoading(false)
      }
    }

    fetchPlant()
  }, [session, plantId, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value ? Number.parseFloat(value) : null) : value,
    }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`/api/planting/${plantId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Failed to update plant")
      const updated = await response.json()
      setPlant(updated)
      setIsEditing(false)
      alert("Data tanaman berhasil diperbarui")
    } catch (error) {
      console.error("Error updating plant:", error)
      alert("Gagal memperbarui data tanaman")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Apakah Anda yakin ingin menghapus tanaman ini?")) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/planting/${plantId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete plant")
      router.push("/dashboard/my-plants")
    } catch (error) {
      console.error("Error deleting plant:", error)
      alert("Gagal menghapus tanaman")
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Memuat detail tanaman...</p>
      </div>
    )
  }

  if (!plant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Tanaman tidak ditemukan</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/my-plants">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Leaf className="w-6 h-6 text-green-600" />
              <h1 className="text-2xl font-bold">{plant.cropName}</h1>
            </div>
          </div>
          {!isEditing && (
            <div className="flex gap-2">
              <Button onClick={() => setIsEditing(true)} variant="outline" size="sm" className="gap-2">
                <Edit2 className="w-4 h-4" />
                Edit
              </Button>
              <Button onClick={handleDelete} disabled={deleting} variant="destructive" size="sm" className="gap-2">
                <Trash2 className="w-4 h-4" />
                {deleting ? "Menghapus..." : "Hapus"}
              </Button>
            </div>
          )}
        </div>

        {/* Image */}
        {plant.cropImage && (
          <div className="w-full h-64 rounded-lg overflow-hidden mb-6 bg-muted">
            <img
              src={plant.cropImage || "/placeholder.svg"}
              alt={plant.cropName}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        {isEditing ? (
          <Card className="p-6">
            <form onSubmit={handleSave} className="space-y-6">
              {/* Crop Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Nama Tanaman</label>
                <Input type="text" name="cropName" value={formData.cropName} onChange={handleInputChange} disabled />
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Hasil Panen (kg)</label>
                <Input
                  type="number"
                  name="quantity"
                  placeholder="0"
                  value={formData.quantity ?? ""}
                  onChange={handleInputChange}
                  step="0.1"
                />
              </div>

              {/* Harvest Date */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Tanggal Panen</label>
                <Input type="date" name="harvestDate" value={formData.harvestDate || ""} onChange={handleInputChange} />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Catatan</label>
                <Textarea
                  name="notes"
                  placeholder="Tambahkan catatan tentang tanaman Anda..."
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={4}
                />
              </div>

              {/* Completed Checkbox */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isCompleted"
                  name="isCompleted"
                  checked={formData.isCompleted}
                  onChange={handleCheckboxChange}
                  className="w-4 h-4 rounded border-input"
                />
                <label htmlFor="isCompleted" className="text-sm font-medium cursor-pointer">
                  Tandai sebagai selesai dipanen
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
                  Batal
                </Button>
                <Button type="submit" disabled={saving} className="flex-1">
                  {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </div>
            </form>
          </Card>
        ) : (
          <Card className="p-6 space-y-6">
            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Tanggal Tanam</p>
                <p className="font-medium">{new Date(plant.plantedDate).toLocaleDateString("id-ID")}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Perkiraan Panen</p>
                <p className="font-medium">{new Date(plant.expectedHarvestDate).toLocaleDateString("id-ID")}</p>
              </div>
              {plant.harvestDate && (
                <div>
                  <p className="text-sm text-muted-foreground">Tanggal Panen</p>
                  <p className="font-medium flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    {new Date(plant.harvestDate).toLocaleDateString("id-ID")}
                  </p>
                </div>
              )}
              {plant.quantity && (
                <div>
                  <p className="text-sm text-muted-foreground">Hasil Panen</p>
                  <p className="font-medium">{plant.quantity} kg</p>
                </div>
              )}
            </div>

            {/* Status */}
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-sm font-medium">
                Status:{" "}
                {plant.isCompleted ? (
                  <span className="text-green-600">Selesai Dipanen</span>
                ) : (
                  <span className="text-blue-600">Sedang Ditanam</span>
                )}
              </p>
            </div>

            {/* Notes */}
            {plant.notes && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Catatan</p>
                <p className="text-sm leading-relaxed">{plant.notes}</p>
              </div>
            )}
          </Card>
        )}
      </div>
    </main>
  )
}
