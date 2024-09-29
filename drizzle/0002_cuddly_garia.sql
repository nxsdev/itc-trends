CREATE TABLE IF NOT EXISTS "job_listings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_number" text NOT NULL,
	"corporate_number" text NOT NULL,
	"reception_date" date NOT NULL,
	"expiration_date" date NOT NULL,
	"public_employment_security_office" text NOT NULL,
	"job_category" text NOT NULL,
	"online_application_accepted" boolean NOT NULL,
	"industry_classification" text NOT NULL,
	"trial_employment_desired" boolean NOT NULL,
	"company_name" text NOT NULL,
	"company_name_kana" text,
	"company_postal_code" text,
	"company_address" text NOT NULL,
	"company_website" text,
	"employee_count_total" integer,
	"employee_count_workplace" integer,
	"female_employee_count" integer,
	"part_time_employee_count" integer,
	"establishment_year" integer,
	"capital" text,
	"has_labor_union" boolean,
	"business_description" text,
	"company_features" text,
	"job_title" text NOT NULL,
	"job_description" text NOT NULL,
	"employment_type" text NOT NULL,
	"is_dispatch" boolean NOT NULL,
	"dispatch_license_number" text,
	"employment_period" text,
	"work_location_postal_code" text,
	"work_location_address" text NOT NULL,
	"nearest_station" text,
	"commute_time" integer,
	"commute_method" text,
	"smoking_policy" text,
	"car_commute_allowed" boolean,
	"base_salary_min" text,
	"base_salary_max" text,
	"fixed_overtime_pay" text,
	"fixed_overtime_hours" integer,
	"salary_type" text,
	"payment_date" text,
	"bonus_system" boolean,
	"salary_raise_system" boolean,
	"work_hours_start" time,
	"work_hours_end" time,
	"break_time" integer,
	"overtime_hours_average" integer,
	"special_overtime_conditions" text,
	"annual_holidays" integer,
	"holidays" text,
	"paid_leave_days" integer,
	"insurance_coverage" text,
	"retirement_system" boolean,
	"retirement_age" integer,
	"rehiring_system" boolean,
	"trial_period" boolean,
	"trial_period_duration" text,
	"housing_provided" boolean,
	"childcare_facility_available" boolean,
	"age_limit_min" integer,
	"age_limit_max" integer,
	"age_limit_reason" text,
	"education_requirement" text,
	"required_experience" text,
	"required_licenses" text,
	"hiring_count" integer,
	"selection_methods" text,
	"result_notification_timing" text,
	"result_notification_method" text,
	"required_documents" text,
	"application_method" text,
	"selection_location" text,
	"contact_department" text,
	"contact_position" text,
	"contact_phone_number" text,
	"contact_email" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "job_listings_job_number_unique" UNIQUE("job_number")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "job_listings_job_number_index" ON "job_listings" USING btree ("job_number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "job_listings_corporate_number_index" ON "job_listings" USING btree ("corporate_number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "job_listings_company_name_index" ON "job_listings" USING btree ("company_name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "job_listings_job_title_index" ON "job_listings" USING btree ("job_title");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "job_listings_reception_date_index" ON "job_listings" USING btree ("reception_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "job_listings_expiration_date_index" ON "job_listings" USING btree ("expiration_date");

-- テーブルコメント
COMMENT ON TABLE job_listings IS 'ハローワークの求人情報を格納するテーブル';

-- カラムコメント
COMMENT ON COLUMN job_listings.id IS '求人情報の一意識別子';
COMMENT ON COLUMN job_listings.job_number IS 'ハローワークの求人番号';
COMMENT ON COLUMN job_listings.corporate_number IS '企業の法人番号';
COMMENT ON COLUMN job_listings.reception_date IS '求人の受付日';
COMMENT ON COLUMN job_listings.expiration_date IS '求人の締切日';
COMMENT ON COLUMN job_listings.public_employment_security_office IS '受理安定所名';
COMMENT ON COLUMN job_listings.job_category IS '求人区分（フルタイム・パートタイムなど）';
COMMENT ON COLUMN job_listings.online_application_accepted IS 'オンライン応募の可否';
COMMENT ON COLUMN job_listings.industry_classification IS '産業分類';
COMMENT ON COLUMN job_listings.trial_employment_desired IS 'トライアル雇用の希望有無';

COMMENT ON COLUMN job_listings.company_name IS '企業名';
COMMENT ON COLUMN job_listings.company_name_kana IS '企業名（カナ）';
COMMENT ON COLUMN job_listings.company_postal_code IS '企業の郵便番号';
COMMENT ON COLUMN job_listings.company_address IS '企業の所在地';
COMMENT ON COLUMN job_listings.company_website IS '企業のウェブサイト';
COMMENT ON COLUMN job_listings.employee_count_total IS '従業員数（全体）';
COMMENT ON COLUMN job_listings.employee_count_workplace IS '従業員数（就業場所）';
COMMENT ON COLUMN job_listings.female_employee_count IS '女性従業員数';
COMMENT ON COLUMN job_listings.part_time_employee_count IS 'パート従業員数';
COMMENT ON COLUMN job_listings.establishment_year IS '設立年';
COMMENT ON COLUMN job_listings.capital IS '資本金';
COMMENT ON COLUMN job_listings.has_labor_union IS '労働組合の有無';
COMMENT ON COLUMN job_listings.business_description IS '事業内容';
COMMENT ON COLUMN job_listings.company_features IS '会社の特徴';

COMMENT ON COLUMN job_listings.job_title IS '職種名';
COMMENT ON COLUMN job_listings.job_description IS '仕事内容';
COMMENT ON COLUMN job_listings.employment_type IS '雇用形態';
COMMENT ON COLUMN job_listings.is_dispatch IS '派遣・請負の有無';
COMMENT ON COLUMN job_listings.dispatch_license_number IS '派遣事業許可番号';
COMMENT ON COLUMN job_listings.employment_period IS '雇用期間';

COMMENT ON COLUMN job_listings.work_location_postal_code IS '就業場所の郵便番号';
COMMENT ON COLUMN job_listings.work_location_address IS '就業場所の住所';
COMMENT ON COLUMN job_listings.nearest_station IS '最寄り駅';
COMMENT ON COLUMN job_listings.commute_time IS '通勤時間';
COMMENT ON COLUMN job_listings.commute_method IS '通勤手段';
COMMENT ON COLUMN job_listings.smoking_policy IS '受動喫煙対策';
COMMENT ON COLUMN job_listings.car_commute_allowed IS 'マイカー通勤の可否';

COMMENT ON COLUMN job_listings.base_salary_min IS '基本給の下限';
COMMENT ON COLUMN job_listings.base_salary_max IS '基本給の上限';
COMMENT ON COLUMN job_listings.fixed_overtime_pay IS '固定残業代';
COMMENT ON COLUMN job_listings.fixed_overtime_hours IS '固定残業時間';
COMMENT ON COLUMN job_listings.salary_type IS '給与形態';
COMMENT ON COLUMN job_listings.payment_date IS '賃金支払日';
COMMENT ON COLUMN job_listings.bonus_system IS '賞与制度の有無';
COMMENT ON COLUMN job_listings.salary_raise_system IS '昇給制度の有無';

COMMENT ON COLUMN job_listings.work_hours_start IS '就業時間（開始）';
COMMENT ON COLUMN job_listings.work_hours_end IS '就業時間（終了）';
COMMENT ON COLUMN job_listings.break_time IS '休憩時間';
COMMENT ON COLUMN job_listings.overtime_hours_average IS '時間外労働時間（月平均）';
COMMENT ON COLUMN job_listings.special_overtime_conditions IS '時間外労働の特記事項';
COMMENT ON COLUMN job_listings.annual_holidays IS '年間休日数';
COMMENT ON COLUMN job_listings.holidays IS '休日';
COMMENT ON COLUMN job_listings.paid_leave_days IS '年次有給休暇日数';

COMMENT ON COLUMN job_listings.insurance_coverage IS '加入保険等';
COMMENT ON COLUMN job_listings.retirement_system IS '退職金制度の有無';
COMMENT ON COLUMN job_listings.retirement_age IS '定年制の年齢';
COMMENT ON COLUMN job_listings.rehiring_system IS '再雇用制度の有無';
COMMENT ON COLUMN job_listings.trial_period IS '試用期間の有無';
COMMENT ON COLUMN job_listings.trial_period_duration IS '試用期間の長さ';
COMMENT ON COLUMN job_listings.housing_provided IS '入居可能住宅の有無';
COMMENT ON COLUMN job_listings.childcare_facility_available IS '利用可能な託児施設の有無';

COMMENT ON COLUMN job_listings.age_limit_min IS '年齢制限（下限）';
COMMENT ON COLUMN job_listings.age_limit_max IS '年齢制限（上限）';
COMMENT ON COLUMN job_listings.age_limit_reason IS '年齢制限の理由';
COMMENT ON COLUMN job_listings.education_requirement IS '学歴要件';
COMMENT ON COLUMN job_listings.required_experience IS '必要な経験';
COMMENT ON COLUMN job_listings.required_licenses IS '必要な免許・資格';

COMMENT ON COLUMN job_listings.hiring_count IS '採用人数';
COMMENT ON COLUMN job_listings.selection_methods IS '選考方法';
COMMENT ON COLUMN job_listings.result_notification_timing IS '選考結果通知時期';
COMMENT ON COLUMN job_listings.result_notification_method IS '選考結果通知方法';
COMMENT ON COLUMN job_listings.required_documents IS '応募書類等';
COMMENT ON COLUMN job_listings.application_method IS '応募方法';
COMMENT ON COLUMN job_listings.selection_location IS '選考場所';

COMMENT ON COLUMN job_listings.contact_department IS '担当者の部署';
COMMENT ON COLUMN job_listings.contact_position IS '担当者の役職';
COMMENT ON COLUMN job_listings.contact_phone_number IS '担当者の電話番号';
COMMENT ON COLUMN job_listings.contact_email IS '担当者のメールアドレス';

COMMENT ON COLUMN job_listings.created_at IS 'レコード作成日時';
COMMENT ON COLUMN job_listings.updated_at IS 'レコード更新日時';