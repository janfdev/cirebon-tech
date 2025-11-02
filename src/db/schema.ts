import { pgTable, text, timestamp, boolean, numeric, integer } from "drizzle-orm/pg-core"

/* ======================
   AUTH -> better-auth generated
   ====================== */

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
})

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
})

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
})

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(() => /* @__PURE__ */ new Date()),
  updatedAt: timestamp("updated_at").$defaultFn(() => /* @__PURE__ */ new Date()),
})

// Farmer Profile dengan statistik
export const farmerProfile = pgTable("farmer_profile", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  farmName: text("farm_name"),
  location: text("location"),
  farmSize: numeric("farm_size"), // dalam hektar
  bio: text("bio"),
  profileImage: text("profile_image"),
  totalPlantsPlanted: integer("total_plants_planted").default(0),
  totalHarvestsCompleted: integer("total_harvests_completed").default(0),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  totalRewardPoints: integer("total_reward_points").default(0),
  level: integer("level").default(1),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
})

// Riwayat penanaman
export const plantingHistory = pgTable("planting_history", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  cropName: text("crop_name").notNull(),
  cropImage: text("crop_image"),
  plantedDate: timestamp("planted_date").notNull(),
  expectedHarvestDate: timestamp("expected_harvest_date"),
  harvestDate: timestamp("harvest_date"),
  quantity: numeric("quantity"), // kg
  notes: text("notes"),
  isCompleted: boolean("is_completed").default(false),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
})

// Reward & Achievement System
export const achievements = pgTable("achievements", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  achievementType: text("achievement_type").notNull(), // 'first_plant', 'first_harvest', 'streak_7', 'streak_30', etc
  title: text("title").notNull(),
  description: text("description"),
  rewardPoints: integer("reward_points").default(0),
  unlockedAt: timestamp("unlocked_at")
    .$defaultFn(() => new Date())
    .notNull(),
})

// Daily Streaks & Activity Log
export const dailyActivity = pgTable("daily_activity", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  activityType: text("activity_type").notNull(), // 'logged_in', 'added_plant', 'detected_disease', 'completed_harvest'
  activityDate: timestamp("activity_date")
    .$defaultFn(() => new Date())
    .notNull(),
  description: text("description"),
})

// Notifications & Reminders
export const reminders = pgTable("reminders", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  plantingHistoryId: text("planting_history_id").references(() => plantingHistory.id, { onDelete: "cascade" }),
  reminderType: text("reminder_type").notNull(), // 'watering', 'fertilizing', 'disease_check', 'harvest'
  scheduledDate: timestamp("scheduled_date").notNull(),
  message: text("message").notNull(),
  isCompleted: boolean("is_completed").default(false),
  notificationSent: boolean("notification_sent").default(false),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
})

// Community Tips & Shared Knowledge
export const communityTips = pgTable("community_tips", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  cropName: text("crop_name").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  location: text("location"), // untuk tips lokal
  upvotes: integer("upvotes").default(0),
  isPublished: boolean("is_published").default(true),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
})

// Harvest Analytics
export const harvestAnalytics = pgTable("harvest_analytics", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  plantingHistoryId: text("planting_history_id")
    .notNull()
    .references(() => plantingHistory.id, { onDelete: "cascade" }),
  totalDaysToMaturity: integer("total_days_to_maturity"),
  yieldPerPlant: numeric("yield_per_plant"),
  totalYield: numeric("total_yield"),
  qualityRating: integer("quality_rating"), // 1-5
  profitability: numeric("profitability"),
  notes: text("notes"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
})

export const tipUpvotes = pgTable("tip_upvotes", {
  id: text("id").primaryKey(),
  tipId: text("tip_id")
    .notNull()
    .references(() => communityTips.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
})
