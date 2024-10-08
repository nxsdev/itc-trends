CREATE TABLE IF NOT EXISTS "green" (
	"id" integer PRIMARY KEY NOT NULL,
	"company_name" text NOT NULL,
	"industry" text,
	"company_features" text,
	"capital" text,
	"sales" text,
	"established_date" date,
	"ceo" text,
	"business_description" text,
	"stock_listing" text,
	"major_shareholders" text,
	"main_clients" text,
	"employee_count" integer,
	"average_age" integer,
	"headquarters_address" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"company_id" uuid
);
