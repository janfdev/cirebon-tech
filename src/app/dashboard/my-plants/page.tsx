"use client"

import { useEffect, useState } from "react"
import { useSession } from "@/hooks/use-session"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Calendar, Leaf, Plus, CheckCircle, AlertCircle } from "lucide-react"

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

export default function MyPlantsPage() {
  const session = useSession()
  const [plants, setPlants] = useState<PlantingRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active")

  useEffect(() => {
    if (!session?.user) return

    const fetchPlants = async () => {
      try {
        const response = await fetch("/api/planting/list")
        const data = await response.json()
        setPlants(data)
      } catch (error) {
        console.error("Error fetching plants:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPlants()
  }, [session])

  const activePlants = plants.filter((p) => !p.isCompleted)
  const completedPlants = plants.filter((p) => p.isCompleted)
  const displayedPlants = activeTab === "active" ? activePlants : completedPlants

  const calculateDaysRemaining = (expectedDate: string) => {
    if (!expectedDate) return null
    const days = Math.ceil((new Date(expectedDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return days > 0 ? days : 0
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Leaf className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold">Riwayat Tanaman Saya</h1>
          </div>
          <Link href="/dashboard/my-plants/new">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Tanam Baru
            </Button>
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          <button
            onClick={() => setActiveTab("active")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "active" ? "border-b-2 border-green-600 text-green-600" : "text-muted-foreground"
            }`}
          >
            Tanaman Aktif ({activePlants.length})
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "completed" ? "border-b-2 border-green-600 text-green-600" : "text-muted-foreground"
            }`}
          >
            Selesai Panen ({completedPlants.length})
          </button>
        </div>

        {/* Plants List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Memuat data tanaman...</p>
          </div>
        ) : displayedPlants.length === 0 ? (
          <Card className="p-12 text-center">
            <Leaf className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              {activeTab === "active"
                ? "Belum ada tanaman aktif. Mulai catat tanaman Anda sekarang!"
                : "Belum ada panen yang selesai."}
            </p>
            {activeTab === "active" && (
              <Link href="/dashboard/my-plants/new">
                <Button>Tanam Sekarang</Button>
              </Link>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedPlants.map((plant) => {
              const daysRemaining = calculateDaysRemaining(plant.expectedHarvestDate)
              return (
                <Card key={plant.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Image */}

                  <div className="p-4">
                    {/* Title & Status */}
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-bold">{plant.cropName}</h3>
                      <Badge
                        className={
                          plant.isCompleted
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        }
                      >
                        {plant.isCompleted ? "Selesai" : "Aktif"}
                      </Badge>
                    </div>

                    {/* Dates */}
                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>Tanam: {new Date(plant.plantedDate).toLocaleDateString("id-ID")}</span>
                      </div>
                      {plant.expectedHarvestDate && !plant.isCompleted && (
                        <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                          <AlertCircle className="w-4 h-4" />
                          <span>{daysRemaining} hari tersisa</span>
                        </div>
                      )}
                      {plant.harvestDate && (
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                          <CheckCircle className="w-4 h-4" />
                          <span>Panen: {new Date(plant.harvestDate).toLocaleDateString("id-ID")}</span>
                        </div>
                      )}
                    </div>

                    {/* Quantity & Notes */}
                    {plant.quantity && (
                      <div className="mb-3 p-2 bg-muted rounded-lg text-sm">
                        <p className="font-medium">Hasil: {plant.quantity} kg</p>
                      </div>
                    )}

                    {plant.notes && <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{plant.notes}</p>}

                    {/* Action */}
                    <Link href={`/dashboard/my-plants/${plant.id}`} className="w-full">
                      <Button variant="outline" className="w-full bg-transparent">
                        Lihat Detail
                      </Button>
                    </Link>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
