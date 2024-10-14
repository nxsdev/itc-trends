DROP INDEX IF EXISTS "user_id_idx";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "company_registration_requests_user_id_index" ON "company_registration_requests" USING btree ("user_id");