"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "@/hooks/use-session"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Leaf, ArrowLeft } from "lucide-react"
import Link from "next/link"
import crops from "@/lib/crops.json"

interface FormData {
  cropName: string
  plantedDate: string
  expectedHarvestDate: string
  notes: string
}

interface Crop {
  id: string
  name: string
  growthPeriod: number
}

export default function NewPlantPage() {
  const session = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [selectedCrop, setSelectedCrop] = useState<string>("")
  const [showCropList, setShowCropList] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    cropName: "",
    plantedDate: new Date().toISOString().split("T")[0],
    expectedHarvestDate: "",
    notes: "",
  })

  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Silakan login terlebih dahulu</p>
      </div>
    )
  }

  const handleCropSelect = (crop: Crop) => {
    setSelectedCrop(crop.id)
    const today = new Date()
    const harvestDate = new Date(today.getTime() + crop.growthPeriod * 24 * 60 * 60 * 1000)

    setFormData({
      ...formData,
      cropName: crop.name,
      expectedHarvestDate: harvestDate.toISOString().split("T")[0],
    })
    setShowCropList(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/planting/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to create plant record")
      }

      router.push("/dashboard/my-plants")
    } catch (error) {
      console.error("Error creating plant:", error)
      alert("Gagal menyimpan data tanaman. Silakan coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard/my-plants">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Leaf className="w-6 h-6 text-green-600" />
            <h1 className="text-2xl font-bold">Tanam Tanaman Baru</h1>
          </div>
        </div>

        {/* Form Card */}
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Crop Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Pilih Jenis Tanaman</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowCropList(!showCropList)}
                  className="w-full px-4 py-2 text-left border rounded-lg bg-background border-input hover:bg-muted"
                >
                  {selectedCrop ? crops.find((c) => c.id === selectedCrop)?.name : "Pilih tanaman..."}
                </button>

                {showCropList && (
                  <div className="absolute z-10 w-full mt-1 border rounded-lg bg-background border-input shadow-lg max-h-64 overflow-y-auto">
                    {crops.map((crop) => (
                      <button
                        key={crop.id}
                        type="button"
                        onClick={() => handleCropSelect(crop)}
                        className="w-full px-4 py-3 text-left hover:bg-muted transition-colors flex justify-between items-center border-b last:border-b-0"
                      >
                        <div>
                          <p className="font-medium">{crop.name}</p>
                          <p className="text-xs text-muted-foreground">{crop.growthPeriod} hari</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Planted Date */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Tanggal Tanam</label>
              <Input
                type="date"
                name="plantedDate"
                value={formData.plantedDate}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Expected Harvest Date */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Perkiraan Tanggal Panen</label>
              <Input
                type="date"
                name="expectedHarvestDate"
                value={formData.expectedHarvestDate}
                onChange={handleInputChange}
                required
              />
              {selectedCrop && (
                <p className="text-xs text-muted-foreground">
                  Berdasarkan periode tumbuh {crops.find((c) => c.id === selectedCrop)?.growthPeriod} hari
                </p>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Catatan (Opsional)</label>
              <Textarea
                name="notes"
                placeholder="Tambahkan catatan tentang tanaman Anda..."
                value={formData.notes}
                onChange={handleInputChange}
                rows={4}
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Link href="/dashboard/my-plants" className="flex-1">
                <Button type="button" variant="outline" className="w-full bg-transparent">
                  Batal
                </Button>
              </Link>
              <Button type="submit" disabled={loading || !selectedCrop} className="flex-1">
                {loading ? "Menyimpan..." : "Simpan Tanaman"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </main>
  )
}
