import { relations } from "drizzle-orm"
import { sql } from "drizzle-orm"
import {
  boolean,
  date,
  index,
  integer,
  numeric,
  pgTable,
  serial,
  text,
  time,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"
import { pgEnum, pgSchema } from "drizzle-orm/pg-core"
import { createInsertSchema, createSelectSchema } from "drizzle-valibot"
import * as v from "valibot"
// Auth schema definition
const authSchema = pgSchema("auth")

// Users table in auth schema
export const users = authSchema.table("users", {
  id: uuid("id").primaryKey(),
  // Other fields from Supabase auth.users table can be added here if needed
})

export type User = typeof users.$inferSelect

export const planType = pgEnum("plan_type", ["free", "pro", "lifetime", "vip"])

export type PlanType = (typeof planType.enumValues)[number]

/** ユーザーのプロフィール */
export const profile = pgTable("profile", {
  id: uuid("id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  email: text("email"),
  username: text("username"),
  fullName: text("full_name"),
  avatarUrl: text("avatar_url"),
  provider: text("provider"),
  plan: planType("plan").default("free"),
  isAdmin: boolean("is_admin").default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
})
export type Profile = typeof profile.$inferSelect

export const profileRelations = relations(profile, ({ one }) => ({
  user: one(users, {
    fields: [profile.id],
    references: [users.id],
  }),
}))

export const companies = pgTable("companies", {
  id: uuid("id").defaultRandom().primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
  corporateNumber: varchar("corporate_number").unique().notNull(),
  name: varchar("name").notNull(),
  nameKana: varchar("name_kana"),
  address: text("address"),
  isExpandedCoverage: boolean("is_expanded_coverage"),
  isActive: boolean("is_active").default(true),
  pensionOffice: varchar("pension_office"),
  coverageStartDate: date("coverage_start_date"),
  url: varchar("url"),
  favoriteCount: integer("favorite_count").default(0).notNull(),
})

export type Company = typeof companies.$inferSelect

export const companiesRelations = relations(companies, ({ many }) => ({
  insuredCounts: many(insuredCounts),
}))

export const insertCompanySchema = createInsertSchema(companies, {
  corporateNumber: v.string([v.length(12)]),
  name: v.string([v.minLength(1), v.maxLength(255)]),
  address: v.string([v.maxLength(255)]),
  isExpandedCoverage: v.boolean(),
  isActive: v.boolean(),
  pensionOffice: v.string([v.maxLength(255)]),
  coverageStartDate: v.date(),
  url: v.string([v.url()]),
})

export const selectCompanySchema = createSelectSchema(companies)

export const insuredCounts = pgTable(
  "insured_counts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    companyId: uuid("company_id")
      .references(() => companies.id)
      .notNull(),
    insuredCount: integer("insured_count").notNull(),
    countDate: date("count_date").notNull(),
  },
  (t) => ({
    unq: unique().on(t.companyId, t.countDate),
  })
)

export const insuredCountsRelations = relations(insuredCounts, ({ one }) => ({
  company: one(companies, {
    fields: [insuredCounts.companyId],
    references: [companies.id],
  }),
}))

export const insertInsuredCountSchema = createInsertSchema(insuredCounts, {
  companyId: v.string([v.uuid()]),
  insuredCount: v.number([v.minValue(0)]),
  countDate: v.date(),
})

export const selectInsuredCountSchema = createSelectSchema(insuredCounts)

export type InsuredCount = typeof insuredCounts.$inferSelect

export const favorites = pgTable("favorites", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  companyId: uuid("company_id")
    .references(() => companies.id)
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
})

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
  company: one(companies, {
    fields: [favorites.companyId],
    references: [companies.id],
  }),
}))

export const insertFavoriteSchema = createInsertSchema(favorites, {
  userId: v.string([v.uuid()]),
  companyId: v.string([v.uuid()]),
})

export const selectFavoriteSchema = createSelectSchema(favorites)

export type Favorite = typeof favorites.$inferSelect

export const jobListings = pgTable(
  "job_listings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    jobNumber: text("job_number").notNull().unique(),
    corporateNumber: text("corporate_number").notNull(),
    receptionDate: date("reception_date").notNull(),
    expirationDate: date("expiration_date").notNull(),
    publicEmploymentSecurityOffice: text("public_employment_security_office").notNull(),
    jobCategory: text("job_category").notNull(),
    onlineApplicationAccepted: boolean("online_application_accepted").notNull(),
    industryClassification: text("industry_classification").notNull(),
    trialEmploymentDesired: boolean("trial_employment_desired").notNull(),

    // 求人事業所情報
    companyName: text("company_name").notNull(),
    companyNameKana: text("company_name_kana"),
    companyPostalCode: text("company_postal_code"),
    companyAddress: text("company_address").notNull(),
    companyWebsite: text("company_website"),
    employeeCountTotal: integer("employee_count_total"),
    employeeCountWorkplace: integer("employee_count_workplace"),
    femaleEmployeeCount: integer("female_employee_count"),
    partTimeEmployeeCount: integer("part_time_employee_count"),
    establishmentYear: integer("establishment_year"),
    capital: text("capital"),
    hasLaborUnion: boolean("has_labor_union"),
    businessDescription: text("business_description"),
    companyFeatures: text("company_features"),

    // 職種情報
    jobTitle: text("job_title").notNull(),
    jobDescription: text("job_description").notNull(),
    employmentType: text("employment_type").notNull(),
    isDispatch: boolean("is_dispatch").notNull(),
    dispatchLicenseNumber: text("dispatch_license_number"),
    employmentPeriod: text("employment_period"),

    // 勤務地情報
    workLocationPostalCode: text("work_location_postal_code"),
    workLocationAddress: text("work_location_address").notNull(),
    nearestStation: text("nearest_station"),
    commuteTime: integer("commute_time"),
    commuteMethod: text("commute_method"),
    smokingPolicy: text("smoking_policy"),
    carCommuteAllowed: boolean("car_commute_allowed"),

    // 給与情報
    baseSalaryMin: text("base_salary_min"),
    baseSalaryMax: text("base_salary_max"),
    fixedOvertimePay: text("fixed_overtime_pay"),
    fixedOvertimeHours: integer("fixed_overtime_hours"),
    salaryType: text("salary_type"),
    paymentDate: text("payment_date"),
    bonusSystem: boolean("bonus_system"),
    salaryRaiseSystem: boolean("salary_raise_system"),

    // 労働時間・休日情報
    workHoursStart: time("work_hours_start"),
    workHoursEnd: time("work_hours_end"),
    breakTime: integer("break_time"),
    overtimeHoursAverage: integer("overtime_hours_average"),
    specialOvertimeConditions: text("special_overtime_conditions"),
    annualHolidays: integer("annual_holidays"),
    holidays: text("holidays"),
    paidLeaveDays: integer("paid_leave_days"),

    // 福利厚生・その他情報
    insuranceCoverage: text("insurance_coverage"),
    retirementSystem: boolean("retirement_system"),
    retirementAge: integer("retirement_age"),
    rehiringSystem: boolean("rehiring_system"),
    trialPeriod: boolean("trial_period"),
    trialPeriodDuration: text("trial_period_duration"),
    housingProvided: boolean("housing_provided"),
    childcareFacilityAvailable: boolean("childcare_facility_available"),

    // 応募要件
    ageLimitMin: integer("age_limit_min"),
    ageLimitMax: integer("age_limit_max"),
    ageLimitReason: text("age_limit_reason"),
    educationRequirement: text("education_requirement"),
    requiredExperience: text("required_experience"),
    requiredLicenses: text("required_licenses"),

    // 選考プロセス
    hiringCount: integer("hiring_count"),
    selectionMethods: text("selection_methods"),
    resultNotificationTiming: text("result_notification_timing"),
    resultNotificationMethod: text("result_notification_method"),
    requiredDocuments: text("required_documents"),
    applicationMethod: text("application_method"),
    selectionLocation: text("selection_location"),

    // 担当者情報
    contactDepartment: text("contact_department"),
    contactPosition: text("contact_position"),
    contactPhoneNumber: text("contact_phone_number"),
    contactEmail: text("contact_email"),

    // メタデータ
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => {
    return {
      jobNumberIdx: index().on(table.jobNumber),
      corporateNumberIdx: index().on(table.corporateNumber),
      companyNameIdx: index().on(table.companyName),
      jobTitleIdx: index().on(table.jobTitle),
      receptionDateIdx: index().on(table.receptionDate),
      expirationDateIdx: index().on(table.expirationDate),
    }
  }
)

/**
 * Greenに掲載されている企業情報
 */
export const green = pgTable("green", {
  // https://www.green-japan.com/company/4727 等の後ろの連番がpkey
  id: integer("id").primaryKey(),
  companyName: text("company_name").notNull(),
  industry: text("industry"),
  companyFeatures: text("company_features"),
  capital: text("capital"),
  sales: text("sales"),
  establishedDate: text("established_date"),
  ceo: text("ceo"),
  businessDescription: text("business_description"),
  stockListing: text("stock_listing"),
  majorShareholders: text("major_shareholders"),
  mainClients: text("main_clients"),
  employeeCount: integer("employee_count"),
  averageAge: numeric("average_age"),
  headquartersAddress: text("headquarters_address"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
  companyId: uuid("company_id"),
})

export type Green = typeof green.$inferSelect

/**
 * 転職ドラフトに掲載されている企業情報
 */

/**
 * Findyに掲載されている企業情報
 */
export const findy = pgTable("findy", {
  id: integer("id").primaryKey(),
  companyName: text("company_name"),
  location: text("location"),
  description: text("description"),
  establishedAt: text("established_at"),
  president: text("president"),
  url: varchar("url", { length: 255 }),
  companyId: uuid("company_id"),
})

export const companyRegistrationRequests = pgTable(
  "company_registration_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    corporateNumber: text("corporate_number").notNull(),
    registeredAt: timestamp("registered_at").defaultNow().notNull(),
    companyId: integer("company_id").references(() => companies.id),
  },
  (table) => {
    return {
      corporateNumberIdx: unique().on(table.corporateNumber),
      userIdIdx: index("user_id_idx").on(table.userId),
    }
  }
)
