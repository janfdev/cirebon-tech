"use client"

import { Card } from "@/components/ui/card"

interface ActivityDay {
  date: string
  hasActivity: boolean
}

interface StreakCalendarProps {
  activities: ActivityDay[]
  longestStreak: number
  currentStreak: number
}

export function StreakCalendar({ activities, longestStreak, currentStreak }: StreakCalendarProps) {
  const getDaysArray = () => {
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()

    return Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      hasActivity: activities.some(
        (a) => new Date(a.date).getDate() === i + 1 && new Date(a.date).getMonth() === new Date().getMonth(),
      ),
    }))
  }

  const days = getDaysArray()
  const weeks = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Aktivitas Bulanan</h3>
        <div className="flex gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Streak Terpanjang</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{longestStreak} hari</p>
          </div>
          <div>
            <p className="text-muted-foreground">Streak Sekarang</p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{currentStreak} hari</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((day) => (
          <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-2">
            {day}
          </div>
        ))}
        {weeks.map((week, weekIdx) =>
          week.map((day, dayIdx) => (
            <div
              key={`${weekIdx}-${dayIdx}`}
              className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                day.hasActivity ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
              }`}
            >
              {day.day}
            </div>
          )),
        )}
      </div>
    </Card>
  )
}
