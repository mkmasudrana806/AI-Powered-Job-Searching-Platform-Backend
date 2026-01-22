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

// -------------- cover letter schema --------------
const coverLetter = z.object({
  cover_letter: z.string().describe("The generated cover letter content"),
});

// ------------ skill gap analysis schema -------------
const skillMarketAnalysis = z.object({
  chart_data: z.array(
    z.object({
      skill: z.string().describe("Normalized name from market data"),
      demand_percentage: z.number().min(0).max(100),
      user_has_it: z
        .boolean()
        .describe("Whether the user matches this market requirement"),
      relevance_score: z
        .number()
        .min(0)
        .max(10)
        .describe("Priority for this specific role"),
    }),
  ),

  market_insights: z.object({
    role_evolution: z.string(),
    top_compensation_drivers: z.array(z.string()),
    competitive_density: z.enum(["Low", "Medium", "High"]),
    emerging_trend: z.string(),
  }),
});

export const AiResponseSchema = {
  applicationAiNotes,
  resumeDoctor,
  coverLetter,
  skillMarketAnalysis,
};
