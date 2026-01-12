import { z } from "zod";

// --------------------------
// Common Reusable Schemas
// --------------------------
const NonEmptyString = z.string().min(1, "Required field cannot be empty").trim();

const UrlString = z
  .string()
  .url("Must be a valid URL")
  .or(z.literal("").transform(() => null))
  .nullable()
  .optional();

// Max lengths to protect token usage and prevent abuse
const MaxBioLength = 5000;
const MaxTextLength = 10000; 

// --------------------------
// Parse Resume Schema
// --------------------------
export const parseResumeSchema = z.object({
  resume_text: NonEmptyString.max(
    MaxTextLength,
    `Resume text too long (max ${MaxTextLength} characters)`
  ),
});

// --------------------------
// Match Score Schema
// --------------------------
export const matchScoreSchema = z.object({
  resume_text: z.string().trim().min(10, "Resume text too short (minimum 10 characters)").max(
    MaxTextLength,
    `Resume text too long (max ${MaxTextLength} characters)`
  ),
  job_description: z.string().trim().min(10, "Job description too short (minimum 10 characters)").max(
    MaxTextLength,
    `Job description too long (max ${MaxTextLength} characters)`
  ),
  
  weights: z
    .object({
      skills: z.number().min(0).max(1).optional(),
      experience: z.number().min(0).max(1).optional(),
      education: z.number().min(0).max(1).optional(),
    })
    .optional(),
});

// --------------------------
// Moderate Content Schema
// --------------------------
export const moderateSchema = z.object({
  content: NonEmptyString.max(
    MaxTextLength,
    `Content too long (max ${MaxTextLength} characters)`
  ),
  context: z.enum(["resume", "job_description", "profile_bio", "message"]).optional(),
});

// --------------------------
// Verify Profile Schema
// --------------------------
export const verifyProfileSchema = z.object({
  first_name: NonEmptyString.max(50),
  last_name: NonEmptyString.max(50),
  phone: z
    .string()
    .regex(/^[\d\s\-\+\(\)]+$/, "Invalid phone format")
    .optional()
    .or(z.literal("")),
  location: z.string().max(100).optional().or(z.literal("")),
  bio: z.string().max(MaxBioLength).optional().or(z.literal("")),
  linkedin: UrlString,
  github: UrlString,
  portfolio: UrlString,
});

export default {
  parseResumeSchema,
  matchScoreSchema,
  moderateSchema,
  verifyProfileSchema,
};