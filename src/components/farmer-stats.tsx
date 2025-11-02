"use client"

import { Card } from "@/components/ui/card"
import { Trophy, Zap, Leaf, Award } from "lucide-react"

interface FarmerStatsProps {
  totalPlantsPlanted: number
  totalHarvestsCompleted: number
  currentStreak: number
  totalRewardPoints: number
  level: number
}

export function FarmerStats({
  totalPlantsPlanted,
  totalHarvestsCompleted,
  currentStreak,
//   totalRewardPoints,
  level,
}: FarmerStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Level & Points */}
      <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Level Petani</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{level}</p>
          </div>
          <Award className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
      </Card>

      {/* Current Streak */}
      <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Streak Aktif</p>
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{currentStreak}</p>
            <p className="text-xs text-muted-foreground">hari</p>
          </div>
          <Zap className="w-8 h-8 text-orange-600 dark:text-orange-400" />
        </div>
      </Card>

      {/* Plants Planted */}
      <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Tanam</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{totalPlantsPlanted}</p>
          </div>
          <Leaf className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
      </Card>

      {/* Harvests Completed */}
      <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Panen</p>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{totalHarvestsCompleted}</p>
          </div>
          <Trophy className="w-8 h-8 text-purple-600 dark:text-purple-400" />
        </div>
      </Card>
    </div>
  )
}
