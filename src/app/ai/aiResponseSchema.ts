import { z } from "zod";

// -------------  application AI notes response schema ------------
const applicationAiNotes = z.array(z.string());

// --------- resume doctor (analysis) response schema -----------
const resumeDoctor = z.object({
  summary: z
    .string()
    .max(200)
    .describe("A brief overview of the analysis (max 200 characters)"),
  missing_skills: z
    .array(z.string())
    .max(5)
    .describe("List of top 5 missing technical or soft skills"),
  resume_fix_suggestions: z
    .array(z.string())
    .max(3)
    .describe("Top 3 actionable formatting or content improvements"),
  impact_rewrites: z
    .array(
      z.object({
        original: z.string(),
        suggested: z.string().max(130),
      }),
    )
    .max(3),
});

export const AiResponseSchema = {
  applicationAiNotes,
  resumeDoctor,
};
