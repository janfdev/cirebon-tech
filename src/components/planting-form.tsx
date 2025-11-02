"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"

export function PlantingForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    cropName: "",
    plantedDate: new Date().toISOString().split("T")[0],
    expectedHarvestDate: "",
    cropImage: "",
    notes: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/planting/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push("/dashboard/my-plants")
      }
    } catch (error) {
      console.error("Error creating planting record:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Catat Tanaman Baru</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Nama Tanaman</label>
          <Input
            name="cropName"
            placeholder="Contoh: Tomat, Cabai, Bayam"
            value={formData.cropName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Tanggal Tanam</label>
            <Input type="date" name="plantedDate" value={formData.plantedDate} onChange={handleChange} required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Target Panen</label>
            <Input
              type="date"
              name="expectedHarvestDate"
              value={formData.expectedHarvestDate}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Foto Tanaman (URL)</label>
          <Input name="cropImage" placeholder="https://..." value={formData.cropImage} onChange={handleChange} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Catatan</label>
          <textarea
            name="notes"
            placeholder="Kondisi tanah, lokasi, varietas, dll..."
            value={formData.notes}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? "Menyimpan..." : "Simpan Tanaman"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
            Batal
          </Button>
        </div>
      </form>
    </Card>
  )
}
