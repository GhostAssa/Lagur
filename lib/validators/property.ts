import { z } from "zod";

export const propertyCategory = z.enum(["rent", "sale", "land"]);
export const propertyType = z.enum(["self_contained", "room_and_parlor", "two_bedroom", "two_bedroom_and_parlor", "three_bedroom", "five_bedroom", "duplex", "two_bedroom_duplex", "bungalow", "story_building", "land"]);
export const propertyInput = z.object({
  category: propertyCategory,
  type: propertyType,
  title: z.string().trim().min(8).max(120),
  description: z.string().trim().min(30).max(5000),
  state: z.string().trim().min(2).max(60),
  lga: z.string().trim().min(2).max(80),
  city: z.string().trim().min(2).max(80),
  address: z.string().trim().min(5).max(240),
  latitude: z.coerce.number().min(-90).max(90).optional(), longitude: z.coerce.number().min(-180).max(180).optional(),
  price_naira: z.coerce.number().int().positive().max(10_000_000_000),
  bedrooms: z.coerce.number().int().min(0).max(20).optional(),
  plots: z.coerce.number().positive().max(100_000).optional(),
  land_size_sqm: z.coerce.number().positive().max(10_000_000).optional(),
  survey_plan_number: z.string().trim().min(4).max(100),
  zone_id: z.string().uuid(),
}).superRefine((value, ctx) => {
  const allowedTypes = value.category === "rent"
    ? ["self_contained","room_and_parlor","two_bedroom","two_bedroom_and_parlor","three_bedroom","five_bedroom"]
    : value.category === "sale" ? ["duplex","two_bedroom_duplex","bungalow","story_building"] : ["land"];
  if (!allowedTypes.includes(value.type)) ctx.addIssue({ code: "custom", message: "Choose a property type that matches this category." });
  if (value.category === "land" && (!value.plots || !value.land_size_sqm)) ctx.addIssue({ code: "custom", message: "Land listings need both plot count and land size." });
  if (value.category !== "land" && !value.bedrooms) ctx.addIssue({ code: "custom", message: "Add the number of bedrooms." });
});

export const aiFilters = z.object({
  category: propertyCategory.optional(), type: propertyType.optional(),
  location: z.string().trim().max(100).optional(), min_price: z.number().int().nonnegative().optional(),
  max_price: z.number().int().positive().optional(), bedrooms: z.number().int().min(0).max(20).optional(),
  plots: z.number().positive().optional(), commute_to: z.string().trim().max(120).optional(),
}).strict();
