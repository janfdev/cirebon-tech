import { db } from "@/db"
import { achievements, dailyActivity, farmerProfile } from "@/db/schema"
import { eq } from "drizzle-orm"

export const ACHIEVEMENT_CONFIGS = {
  first_plant: {
    title: "Petani Pemula",
    description: "Catat tanaman pertama Anda",
    points: 50,
    icon: "Sprout",
  },
  first_harvest: {
    title: "Panen Pertama",
    description: "Selesaikan panen pertama",
    points: 100,
    icon: "Trophy",
  },
  streak_7: {
    title: "Konsisten 7 Hari",
    description: "Aktif selama 7 hari berturut-turut",
    points: 150,
    icon: "Flame",
  },
  streak_30: {
    title: "Master Petani",
    description: "Aktif selama 30 hari berturut-turut",
    points: 500,
    icon: "Target",
  },
  five_plants: {
    title: "Perekebunan",
    description: "Tanam 5 tanaman berbeda",
    points: 200,
    icon: "Leaf",
  },
  ten_harvests: {
    title: "Veteran Panen",
    description: "Selesaikan 10 kali panen",
    points: 300,
    icon: "Crown",
  },
}

// Function untuk track daily activity dan update streak
export async function trackDailyActivity(userId: string, activityType: string, description?: string) {
  const activityId = `activity-${Date.now()}`

  await db.insert(dailyActivity).values({
    id: activityId,
    userId,
    activityType,
    description,
  })

  // Update streak
  await updateStreak(userId)
}

// Function untuk update streak
export async function updateStreak(userId: string) {
  try {
    const profile = await db.select().from(farmerProfile).where(eq(farmerProfile.userId, userId))

    if (!profile.length) return

    const currentProfile = profile[0]

    // Get last 7 days of activities
    // const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const activities = await db.select().from(dailyActivity).where(eq(dailyActivity.userId, userId))

    // Count consecutive days with activity
    let streak = 0
    const currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(currentDate)
      checkDate.setDate(checkDate.getDate() - i)

      const hasActivity = activities.some((a) => new Date(a.activityDate).toDateString() === checkDate.toDateString())

      if (hasActivity) {
        streak++
      } else {
        break
      }
    }

    // Update profile with new streak
    const newLevel = Math.floor(currentProfile.totalRewardPoints ?? 0 / 200) + 1

    await db
      .update(farmerProfile)
      .set({
        currentStreak: streak,
        longestStreak: Math.max(streak, currentProfile.longestStreak ?? 0),
        level: newLevel,
        updatedAt: new Date(),
      })
      .where(eq(farmerProfile.userId, userId))

    // Check for streak achievements
    await checkStreakAchievements(userId, streak)
  } catch (error) {
    console.error("Error updating streak:", error)
  }
}

// Function untuk check achievements
export async function checkStreakAchievements(userId: string, streak: number) {
  const profile = await db.select().from(farmerProfile).where(eq(farmerProfile.userId, userId))

  if (!profile.length) return

  const userAchievements = await db.select().from(achievements).where(eq(achievements.userId, userId))

  const achievedTypes = userAchievements.map((a) => a.achievementType)

  // Check streak_7
  if (streak === 7 && !achievedTypes.includes("streak_7")) {
    await unlockAchievement(userId, "streak_7")
  }

  // Check streak_30
  if (streak === 30 && !achievedTypes.includes("streak_30")) {
    await unlockAchievement(userId, "streak_30")
  }
}

// Function untuk unlock achievement
export async function unlockAchievement(userId: string, achievementType: string) {
  const config = ACHIEVEMENT_CONFIGS[achievementType as keyof typeof ACHIEVEMENT_CONFIGS]

  if (!config) return

  const achievementId = `achievement-${Date.now()}`

  await db.insert(achievements).values({
    id: achievementId,
    userId,
    achievementType,
    title: config.title,
    description: config.description,
    rewardPoints: config.points,
  })

  // Update profile points
  const profile = await db.select().from(farmerProfile).where(eq(farmerProfile.userId, userId))

  if (profile.length) {
    await db
      .update(farmerProfile)
      .set({
        totalRewardPoints: profile[0]?.totalRewardPoints ?? 0 + config.points,
        level: Math.floor((profile[0]?.totalRewardPoints ?? 0 + config.points) / 200) + 1,
        updatedAt: new Date(),
      })
      .where(eq(farmerProfile.userId, userId))
  }
}

// Function untuk check dan unlock plant-related achievements
export async function checkPlantAchievements(userId: string) {
  const profile = await db.select().from(farmerProfile).where(eq(farmerProfile.userId, userId))

  if (!profile.length) return

  const userProfile = profile[0]
  const userAchievements = await db.select().from(achievements).where(eq(achievements.userId, userId))

  const achievedTypes = userAchievements.map((a) => a.achievementType)

  // First plant
  if (userProfile.totalPlantsPlanted === 1 && !achievedTypes.includes("first_plant")) {
    await unlockAchievement(userId, "first_plant")
  }

  // Five plants
  if (userProfile.totalPlantsPlanted === 5 && !achievedTypes.includes("five_plants")) {
    await unlockAchievement(userId, "five_plants")
  }
}

// Function untuk check dan unlock harvest-related achievements
export async function checkHarvestAchievements(userId: string) {
  const profile = await db.select().from(farmerProfile).where(eq(farmerProfile.userId, userId))

  if (!profile.length) return

  const userProfile = profile[0]
  const userAchievements = await db.select().from(achievements).where(eq(achievements.userId, userId))

  const achievedTypes = userAchievements.map((a) => a.achievementType)

  // First harvest
  if (userProfile.totalHarvestsCompleted === 1 && !achievedTypes.includes("first_harvest")) {
    await unlockAchievement(userId, "first_harvest")
  }

  // Ten harvests
  if (userProfile.totalHarvestsCompleted === 10 && !achievedTypes.includes("ten_harvests")) {
    await unlockAchievement(userId, "ten_harvests")
  }
}
