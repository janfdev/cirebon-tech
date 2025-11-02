"use client"

import { useEffect, useState } from "react"
import { useSession } from "@/hooks/use-session"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FarmerStats } from "@/components/farmer-stats"
import { StreakCalendar } from "@/components/streak-calendar"
import { AchievementsShowcase } from "@/components/achievements-showcase"
import Link from "next/link"
import { Leaf, Plus, TrendingUp } from "lucide-react"

interface FarmerProfile {
  id: number
  user: {
    id: number
    name: string
    email: string
    avatarUrl?: string
  }
  location?: string
  experience?: number
  totalPlantsPlanted: number
  totalHarvestsCompleted: number
  currentStreak: number
  longestStreak: number
  totalRewardPoints: number
  level: number
}

interface Achievement {
  id: string
  title: string
  description: string
  rewardPoints: number
  unlockedAt: string
}

interface Activity {
  id: string
  activityType: string
  activityDate: string
  description?: string
}


export default function DashboardPage() {
  const session = useSession()
  const [farmerProfile, setFarmerProfile] = useState<FarmerProfile | null>(null)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session?.user) return

    const fetchDashboardData = async () => {
      try {
        // Fetch farmer profile
        const profileRes = await fetch("/api/farmer/profile")
        const profileData = await profileRes.json()
        setFarmerProfile(profileData)

        // Fetch achievements
        const achievementsRes = await fetch("/api/farmer/achievements")
        const achievementsData = await achievementsRes.json()
        setAchievements(achievementsData)

        // Fetch activities
        const activitiesRes = await fetch("/api/farmer/activities")
        const activitiesData = await activitiesRes.json()
        setActivities(activitiesData)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [session])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Memuat dashboard...</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-2">
                <Leaf className="w-10 h-10 text-green-600" />
                Dashboard Petani
              </h1>
              <p className="text-muted-foreground mt-2">Selamat datang, {farmerProfile?.user?.name || "Petani"}!</p>
            </div>
            <Link href="/dashboard/my-plants">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Tanam Baru
              </Button>
            </Link>
          </div>
        </div>

        {/* Statistics Cards */}
        {farmerProfile && (
          <FarmerStats
            totalPlantsPlanted={farmerProfile.totalPlantsPlanted}
            totalHarvestsCompleted={farmerProfile.totalHarvestsCompleted}
            currentStreak={farmerProfile.currentStreak}
            totalRewardPoints={farmerProfile.totalRewardPoints}
            level={farmerProfile.level}
          />
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Calendar & Progress */}
          <div className="lg:col-span-2 space-y-6">
            {activities.length > 0 && (
              <StreakCalendar
                activities={activities.map((a) => ({
                  date: a.activityDate,
                  hasActivity: true,
                }))}
                longestStreak={farmerProfile?.longestStreak || 0}
                currentStreak={farmerProfile?.currentStreak || 0}
              />
            )}

            {/* Quick Stats */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Ringkasan Aktivitas</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                  <span className="text-sm">Tanaman Aktif</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {(farmerProfile?.totalPlantsPlanted ?? 0) - (farmerProfile?.totalHarvestsCompleted ?? 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                  <span className="text-sm">Total Panen Selesai</span>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    {farmerProfile?.totalHarvestsCompleted ?? 0}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Achievements */}
          <div>
            <AchievementsShowcase achievements={achievements} />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/deteksi">
            <Card className="p-6 hover:bg-accent cursor-pointer transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="font-semibold">Deteksi Penyakit</p>
                  <p className="text-sm text-muted-foreground">Gunakan kamera untuk deteksi</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/edukasi">
            <Card className="p-6 hover:bg-accent cursor-pointer transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Leaf className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="font-semibold">Pelajari Tanaman</p>
                  <p className="text-sm text-muted-foreground">Baca artikel edukatif</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </main>
  )
}
