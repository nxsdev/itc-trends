import { relations } from "drizzle-orm/relations";
import { companies, insuredCounts } from "./schema";

export const insuredCountsRelations = relations(insuredCounts, ({one}) => ({
	company: one(companies, {
		fields: [insuredCounts.companyId],
		references: [companies.id]
	}),
}));

export const companiesRelations = relations(companies, ({many}) => ({
	insuredCounts: many(insuredCounts),
}));