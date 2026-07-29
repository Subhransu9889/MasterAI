DO $$ BEGIN
  CREATE TYPE "conversation_role" AS ENUM('user', 'assistant', 'system');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
ALTER TABLE "conversation_messages" ADD COLUMN IF NOT EXISTS "role" "conversation_role";--> statement-breakpoint
UPDATE "conversation_messages" SET "role" = 'user' WHERE "role" IS NULL;--> statement-breakpoint
ALTER TABLE "conversation_messages" ALTER COLUMN "role" SET NOT NULL;
