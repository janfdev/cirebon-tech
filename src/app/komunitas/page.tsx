"use client"

import { useEffect, useState } from "react"
import { useSession } from "@/hooks/use-session"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CommunityTipsCard } from "@/components/community-tips-card"
import Link from "next/link"
import { Plus, Users, Lightbulb } from "lucide-react"

interface CommunityTip {
  id: string
  title: string
  content: string
  cropName: string
  location: string
  upvotes: number
  userId: string
  hasUpvoted: boolean
  user: {
    name: string
    farmName?: string
  }
  createdAt: string
}

export default function KomunitasPage() {
  const session = useSession()
  const [tips, setTips] = useState<CommunityTip[]>([])
  const [filteredTips, setFilteredTips] = useState<CommunityTip[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTips()
  }, [])

  const fetchTips = async () => {
    try {
      const response = await fetch("/api/community/tips")
      const data = await response.json()
      setTips(data)
      setFilteredTips(data)
    } catch (error) {
      console.error("Error fetching tips:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    const filtered = tips.filter(
      (tip) =>
        tip.title.toLowerCase().includes(term.toLowerCase()) ||
        tip.cropName.toLowerCase().includes(term.toLowerCase()) ||
        tip.content.toLowerCase().includes(term.toLowerCase()),
    )
    setFilteredTips(filtered)
  }

  const handleUpvote = async (tipId: string) => {
    try {
      const response = await fetch(`/api/community/tips/${tipId}/upvote`, {
        method: "POST",
      })

      if (!response.ok) {
        const error = await response.json()
        console.error("Error:", error.error)
        return
      }

      setFilteredTips(
        filteredTips.map((tip) => (tip.id === tipId ? { ...tip, upvotes: tip.upvotes + 1, hasUpvoted: true } : tip)),
      )
      setTips(tips.map((tip) => (tip.id === tipId ? { ...tip, upvotes: tip.upvotes + 1, hasUpvoted: true } : tip)))
    } catch (error) {
      console.error("Error upvoting tip:", error)
    }
  }

  const handleDelete = async (tipId: string) => {
    if (!confirm("Are you sure you want to delete this tip?")) {
      return
    }

    try {
      const response = await fetch(`/api/community/tips/${tipId}/delete`, {
        method: "DELETE",
      })

      if (!response.ok) {
        console.error("Error deleting tip")
        return
      }

      setTips(tips.filter((tip) => tip.id !== tipId))
      setFilteredTips(filteredTips.filter((tip) => tip.id !== tipId))
    } catch (error) {
      console.error("Error deleting tip:", error)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-2 mb-2">
                <Users className="w-10 h-10 text-green-600" />
                Komunitas Petani
              </h1>
              <p className="text-muted-foreground">Berbagi tips dan pengalaman berkebun dengan petani lain</p>
            </div>
            <Link href="/komunitas/new-tip">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Bagikan Tips
              </Button>
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <Input
            placeholder="Cari tips tentang tanaman, lokasi, atau tips..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Stats */}
        {/* <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{tips.length}</p>
            <p className="text-sm text-muted-foreground">Tips Dibagikan</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {tips.reduce((sum, t) => sum + t.upvotes, 0)}
            </p>
            <p className="text-sm text-muted-foreground">Total Reaksi</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {new Set(tips.map((t) => t.cropName)).size}
            </p>
            <p className="text-sm text-muted-foreground">Jenis Tanaman</p>
          </Card>
        </div> */}

        {/* Tips List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Memuat tips komunitas...</p>
          </div>
        ) : filteredTips.length === 0 ? (
          <Card className="p-12 text-center">
            <Lightbulb className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchTerm ? "Tips tidak ditemukan" : "Belum ada tips komunitas. Jadilah yang pertama berbagi!"}
            </p>
          </Card>
        ) : (
          <CommunityTipsCard
            tips={filteredTips.sort((a, b) => b.upvotes - a.upvotes)}
            onUpvote={handleUpvote}
            onDelete={handleDelete}
            currentUserId={session?.user?.id}
          />
        )}
      </div>
    </main>
  )
}
