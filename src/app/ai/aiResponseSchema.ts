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

/**
 * Interview preparation job-specific response schema
 */

const questionValidation = z.object({
  question_id: z.string(),
  question: z.string(),
  category: z.enum([
    "Role-Specific",
    "Behavioral",
    "Situational",
    "Cultural-Fit",
  ]),
  interviewer_intent: z
    .string()
    .describe("The hidden reason why an interviewer asks this."),
  personal_anchor_hint: z
    .string()
    .describe("A specific reference to the user's past work or skills."),
  ideal_talking_points: z
    .array(z.string())
    .describe("3-4 bullet points to cover in a great answer."),
});

/*
 * interview dashboard response for 1st time user click on interview preparation
 */
const interviewPrepDashboard = z.object({
  // 1st: coach summary the role and how to win
  coaching_summary: z
    .string()
    .describe("High-level advice on how to win this specific interview."),
  professional_vibe: z
    .string()
    .describe(
      "The tone the candidate should set (e.g., Empathetic, Authoritative).",
    ),

  // 2nd: question bank should generate by 1st click
  question_bank: z.array(questionValidation).length(10),

  // 3rd: gaps discussion
  gap_strategies: z.array(
    z.object({
      missing_qualification: z.string(),
      pivot_strategy: z
        .string()
        .describe("A confident script to bridge this specific gap."),
    }),
  ),

  // 4th: candidate may ask question to the interviewr
  smart_reverse_questions: z
    .array(z.string())
    .describe("2-3 smart questions the candidate should ask."),
});

/**
 * ---------- evaluate interview question in practice mode -------------
 */
const interviewQuestionEvaluation = z.object({
  readiness_score: z
    .number()
    .min(0)
    .max(100)
    .describe(
      "0-100 score based on clarity, STAR method usage, and keyword relevance.",
    ),
  ai_feedback: z
    .string()
    .describe(
      "Constructive criticism highlighting what was good and what was missing.",
    ),
  suggested_refinement: z
    .string()
    .describe("A professional, 'ready-to-use' version of the user's answer."),
  missed_keywords: z
    .array(z.string())
    .describe("Important industry terms or skills the user forgot to mention."),
});

/**
 * ---------- ai job post assistant --------------
 */
const aiJobPostAssistant = z.object({
  title: z.string().describe("The professional job title."),
  description: z
    .string()
    .describe(
      "A compelling 1-2 paragraph overview of the role and company impact.",
    ),
  responsibilities: z.array(z.string()).describe("A list of 3-5 key duties."),
  requiredSkills: z
    .array(z.string())
    .describe("Technical and soft skills required."),

  experienceLevel: z.enum(["junior", "mid", "senior", "lead"]),
  employmentType: z.enum(["full-time", "part-time", "contract", "internship"]),
  qualifications: z.object({
    educationLevel: z.enum([
      "ssc",
      "hsc",
      "diploma",
      "bachelor",
      "master",
      "phd",
      "not_required",
    ]),
    fieldsOfStudy: z.array(z.string()).optional(),
    text: z.string().describe("Summary of educational requirements."),
  }),
  salary: z.object({
    type: z.enum(["fixed", "range", "negotiable", "not_disclosed"]),
    min: z.number().nullable(),
    max: z.number().nullable(),
    currency: z.string().default("USD"),
    rawText: z
      .string()
      .describe("Human readable salary (e.g. $50k - $70k)")
      .default("Negotiable"),
  }),
  location: z.object({
    city: z.string().optional(),
    country: z.string().optional(),
    remote: z.boolean().default(false),
    officeAddress: z.string().nullable(),
  }),
});

/**
 * ----------- standard interview question schema --------------
 */
const standardInterviewQuestion = z.object({
  strategy: z
    .string()
    .describe(
      "Overall interview strategy for this specific role based on industry standards.",
    ),
  questions: z.array(
    z.object({
      id: z.string(),
      question: z.string(),
      category: z.enum([
        "Core_Competency",
        "Situational_Judgment",
        "Behavioral_Traits",
        "Operational_Knowledge",
        "Leadership_Potential",
        "Culture_Values",
      ]),
      intent: z
        .string()
        .describe("What specific skill or trait is being tested?"),
      good_answer_signals: z
        .array(z.string())
        .describe("Positive indicators in the candidate's response."),
      red_flags: z.array(z.string()).describe("Warning signs in the response."),
      score_rubric: z.object({
        score_1: z
          .string()
          .describe("Lacks basic understanding or shows negative traits"),
        score_3: z
          .string()
          .describe("Meets basic requirements but lacks depth"),
        score_5: z
          .string()
          .describe("Demonstrates mastery and proactive thinking"),
      }),
    }),
  ),
});

export const AiResponseSchema = {
  applicationAiNotes,
  resumeDoctor,
  coverLetter,
  skillMarketAnalysis,
  interviewPrepDashboard,
  interviewQuestionEvaluation,
  aiJobPostAssistant,
  standardInterviewQuestion,
};
