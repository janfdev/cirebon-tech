"use client"

import type React from "react"

import { Card } from "@/components/ui/card"
import { Trophy, Flame, Sprout, Target } from "lucide-react"

interface Achievement {
  id: string
  title: string
  description: string
  rewardPoints: number
  unlockedAt: string
}

interface AchievementsShowcaseProps {
  achievements: Achievement[]
}

const achievementIcons: Record<string, React.ReactNode> = {
  first_plant: <Sprout className="w-6 h-6" />,
  first_harvest: <Trophy className="w-6 h-6" />,
  streak_7: <Flame className="w-6 h-6" />,
  streak_30: <Target className="w-6 h-6" />,
}

export function AchievementsShowcase({ achievements }: AchievementsShowcaseProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Pencapaian</h3>

      {achievements.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">Mulai tanam untuk membuka pencapaian pertama Anda!</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className="text-center p-4 rounded-lg bg-gradient-to-b from-amber-50 to-amber-100 dark:from-amber-900 dark:to-amber-800 border border-amber-200 dark:border-amber-700"
            >
              <div className="flex justify-center mb-2 text-amber-600 dark:text-amber-400">
                {achievementIcons[achievement.id] || <Trophy className="w-6 h-6" />}
              </div>
              <p className="font-semibold text-sm">{achievement.title}</p>
              <p className="text-xs text-muted-foreground mt-1">+{achievement.rewardPoints} poin</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
