CREATE TABLE "achievements" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"achievement_type" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"reward_points" integer DEFAULT 0,
	"unlocked_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "community_tips" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"crop_name" text NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"location" text,
	"upvotes" integer DEFAULT 0,
	"is_published" boolean DEFAULT true,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_activity" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"activity_type" text NOT NULL,
	"activity_date" timestamp NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "farmer_profile" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"farm_name" text,
	"location" text,
	"farm_size" numeric,
	"bio" text,
	"profile_image" text,
	"total_plants_planted" integer DEFAULT 0,
	"total_harvests_completed" integer DEFAULT 0,
	"current_streak" integer DEFAULT 0,
	"longest_streak" integer DEFAULT 0,
	"total_reward_points" integer DEFAULT 0,
	"level" integer DEFAULT 1,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "farmer_profile_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "harvest_analytics" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"planting_history_id" text NOT NULL,
	"total_days_to_maturity" integer,
	"yield_per_plant" numeric,
	"total_yield" numeric,
	"quality_rating" integer,
	"profitability" numeric,
	"notes" text,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "planting_history" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"crop_name" text NOT NULL,
	"crop_image" text,
	"planted_date" timestamp NOT NULL,
	"expected_harvest_date" timestamp,
	"harvest_date" timestamp,
	"quantity" numeric,
	"notes" text,
	"is_completed" boolean DEFAULT false,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reminders" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"planting_history_id" text,
	"reminder_type" text NOT NULL,
	"scheduled_date" timestamp NOT NULL,
	"message" text NOT NULL,
	"is_completed" boolean DEFAULT false,
	"notification_sent" boolean DEFAULT false,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_tips" ADD CONSTRAINT "community_tips_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_activity" ADD CONSTRAINT "daily_activity_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farmer_profile" ADD CONSTRAINT "farmer_profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "harvest_analytics" ADD CONSTRAINT "harvest_analytics_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "harvest_analytics" ADD CONSTRAINT "harvest_analytics_planting_history_id_planting_history_id_fk" FOREIGN KEY ("planting_history_id") REFERENCES "public"."planting_history"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "planting_history" ADD CONSTRAINT "planting_history_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_planting_history_id_planting_history_id_fk" FOREIGN KEY ("planting_history_id") REFERENCES "public"."planting_history"("id") ON DELETE cascade ON UPDATE no action;