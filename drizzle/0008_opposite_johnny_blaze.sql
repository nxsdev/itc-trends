CREATE TABLE IF NOT EXISTS "findy" (
	"id" integer PRIMARY KEY NOT NULL,
	"company_name" text,
	"location" text,
	"description" text,
	"established_at" text,
	"president" text,
	"url" varchar(255),
	"company_id" uuid
);
--> statement-breakpoint
ALTER TABLE "companies" ALTER COLUMN "favorite_count" SET NOT NULL;