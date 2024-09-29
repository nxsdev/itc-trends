CREATE TABLE IF NOT EXISTS "companies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"corporate_number" varchar NOT NULL,
	"name" varchar NOT NULL,
	"address" text,
	"is_expanded_coverage" boolean,
	"is_active" boolean DEFAULT true,
	"pension_office" varchar,
	"coverage_start_date" date,
	"url" varchar,
	"favorite_count" integer DEFAULT 0,
	CONSTRAINT "companies_corporate_number_unique" UNIQUE("corporate_number")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "insured_counts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"company_id" uuid NOT NULL,
	"insured_count" integer NOT NULL,
	"count_date" date NOT NULL,
	CONSTRAINT "insured_counts_company_id_count_date_unique" UNIQUE("company_id","count_date")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "insured_counts" ADD CONSTRAINT "insured_counts_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
