CREATE TABLE IF NOT EXISTS "company_registration_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"corporate_number" text NOT NULL,
	"registered_at" timestamp DEFAULT now() NOT NULL,
	"company_id" uuid,
	CONSTRAINT "company_registration_requests_corporate_number_unique" UNIQUE("corporate_number")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "company_registration_requests" ADD CONSTRAINT "company_registration_requests_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_id_idx" ON "company_registration_requests" USING btree ("user_id");