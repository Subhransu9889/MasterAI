CREATE TYPE "conversation_role" AS ENUM('user', 'assistant', 'system');--> statement-breakpoint
CREATE TYPE "memory_source" AS ENUM('profile', 'conversation', 'recommendation', 'manual');--> statement-breakpoint
CREATE TYPE "notification_status" AS ENUM('unread', 'read', 'archived');--> statement-breakpoint
CREATE TYPE "notification_type" AS ENUM('recommendation', 'chat', 'profile', 'system');--> statement-breakpoint
CREATE TYPE "recommendation_category" AS ENUM('course', 'skill', 'project', 'book', 'career_tip');--> statement-breakpoint
CREATE TYPE "recommendation_status" AS ENUM('new', 'saved', 'dismissed', 'completed');--> statement-breakpoint
CREATE TYPE "task_status" AS ENUM('todo', 'in_progress', 'done', 'archived');--> statement-breakpoint
CREATE TYPE "user_role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "conversation_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"conversation_id" uuid NOT NULL,
	"role" "conversation_role" NOT NULL,
	"content" text NOT NULL,
	"token_count" integer,
	"metadata" jsonb DEFAULT '{}' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"title" text DEFAULT 'New conversation' NOT NULL,
	"summary" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "memories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"source" "memory_source" DEFAULT 'manual'::"memory_source" NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL,
	"confidence" integer DEFAULT 100 NOT NULL,
	"metadata" jsonb DEFAULT '{}' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"type" "notification_type" DEFAULT 'system'::"notification_type" NOT NULL,
	"status" "notification_status" DEFAULT 'unread'::"notification_status" NOT NULL,
	"title" text NOT NULL,
	"body" text,
	"action_url" text,
	"payload" jsonb DEFAULT '{}' NOT NULL,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"profession" text NOT NULL,
	"interests" jsonb DEFAULT '[]' NOT NULL,
	"goals" jsonb DEFAULT '[]' NOT NULL,
	"preferred_language" text DEFAULT 'English' NOT NULL,
	"learning_level" text DEFAULT 'beginner',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recommendations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"category" "recommendation_category" NOT NULL,
	"status" "recommendation_status" DEFAULT 'new'::"recommendation_status" NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"reason" text,
	"resource_url" text,
	"tags" jsonb DEFAULT '[]' NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"generated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"recommendation_id" uuid,
	"title" text NOT NULL,
	"description" text,
	"status" "task_status" DEFAULT 'todo'::"task_status" NOT NULL,
	"due_date" date,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"auth_provider_id" text NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"image_url" text,
	"role" "user_role" DEFAULT 'user'::"user_role" NOT NULL,
	"onboarding_completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "conversation_messages_conversation_id_idx" ON "conversation_messages" ("conversation_id");--> statement-breakpoint
CREATE INDEX "conversation_messages_created_at_idx" ON "conversation_messages" ("created_at");--> statement-breakpoint
CREATE INDEX "conversations_user_id_idx" ON "conversations" ("user_id");--> statement-breakpoint
CREATE INDEX "conversations_updated_at_idx" ON "conversations" ("updated_at");--> statement-breakpoint
CREATE INDEX "memories_user_id_idx" ON "memories" ("user_id");--> statement-breakpoint
CREATE INDEX "memories_source_idx" ON "memories" ("source");--> statement-breakpoint
CREATE INDEX "memories_key_idx" ON "memories" ("key");--> statement-breakpoint
CREATE INDEX "notifications_user_id_idx" ON "notifications" ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_status_idx" ON "notifications" ("status");--> statement-breakpoint
CREATE INDEX "notifications_created_at_idx" ON "notifications" ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "preferences_user_id_idx" ON "preferences" ("user_id");--> statement-breakpoint
CREATE INDEX "preferences_profession_idx" ON "preferences" ("profession");--> statement-breakpoint
CREATE INDEX "recommendations_user_id_idx" ON "recommendations" ("user_id");--> statement-breakpoint
CREATE INDEX "recommendations_category_idx" ON "recommendations" ("category");--> statement-breakpoint
CREATE INDEX "recommendations_status_idx" ON "recommendations" ("status");--> statement-breakpoint
CREATE INDEX "recommendations_generated_at_idx" ON "recommendations" ("generated_at");--> statement-breakpoint
CREATE INDEX "tasks_user_id_idx" ON "tasks" ("user_id");--> statement-breakpoint
CREATE INDEX "tasks_recommendation_id_idx" ON "tasks" ("recommendation_id");--> statement-breakpoint
CREATE INDEX "tasks_status_idx" ON "tasks" ("status");--> statement-breakpoint
CREATE INDEX "tasks_due_date_idx" ON "tasks" ("due_date");--> statement-breakpoint
CREATE UNIQUE INDEX "users_auth_provider_id_idx" ON "users" ("auth_provider_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" ("email");--> statement-breakpoint
CREATE INDEX "users_created_at_idx" ON "users" ("created_at");--> statement-breakpoint
ALTER TABLE "conversation_messages" ADD CONSTRAINT "conversation_messages_conversation_id_conversations_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "memories" ADD CONSTRAINT "memories_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "preferences" ADD CONSTRAINT "preferences_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_recommendation_id_recommendations_id_fkey" FOREIGN KEY ("recommendation_id") REFERENCES "recommendations"("id") ON DELETE SET NULL;