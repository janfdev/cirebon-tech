"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
// import { useSession } from "@/hooks/use-session"

export default function NewTipPage() {
  const router = useRouter()
//   const session = useSession()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    cropName: "",
    location: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/community/tips/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push("/komunitas")
      }
    } catch (error) {
      console.error("Error creating tip:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <main className="min-h-screen bg-background py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="p-8">
          <h1 className="text-3xl font-bold mb-2">Bagikan Tips Berkebun</h1>
          <p className="text-muted-foreground mb-8">
            Bagikan pengalaman dan tips berkebun Anda untuk membantu petani lain
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Judul Tips</label>
              <Input
                name="title"
                placeholder="Contoh: Cara Efektif Mengatasi Hama Tomat"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nama Tanaman</label>
                <Input name="cropName" placeholder="Tomat" value={formData.cropName} onChange={handleChange} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Lokasi (Opsional)</label>
                <Input name="location" placeholder="Jawa Barat" value={formData.location} onChange={handleChange} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Isi Tips</label>
              <textarea
                name="content"
                placeholder="Tuliskan tips dan pengalaman Anda secara detail..."
                value={formData.content}
                onChange={handleChange}
                rows={8}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground resize-none"
                required
              />
              <p className="text-xs text-muted-foreground mt-2">{formData.content.length}/500 karakter</p>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Memposting..." : "Bagikan Tips"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
                Batal
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </main>
  )
}
