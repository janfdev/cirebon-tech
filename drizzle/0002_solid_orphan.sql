CREATE TABLE "tip_upvotes" (
	"id" text PRIMARY KEY NOT NULL,
	"tip_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tip_upvotes" ADD CONSTRAINT "tip_upvotes_tip_id_community_tips_id_fk" FOREIGN KEY ("tip_id") REFERENCES "public"."community_tips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tip_upvotes" ADD CONSTRAINT "tip_upvotes_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;