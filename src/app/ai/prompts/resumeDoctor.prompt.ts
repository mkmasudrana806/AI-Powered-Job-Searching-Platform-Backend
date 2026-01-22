import { TJob } from "../../modules/jobs/jobs.interface";
import { TUserProfile } from "../../modules/userProfile/userProfile.interface";

/**
 * generate resume doctor prompt dynamically.
 * it acts as expert technical recruiter and ATS specialist to analyze candidate profile against job description.
 *
 * @param profile  candidate profile data
 * @param job  target job description data
 * @param matchScore pre-calculated match score between profile and job
 * @returns object containing systemPrompt and userPrompt
 */
export const getResumeDoctorPrompt = (
  profile: TUserProfile,
  job: TJob,
  matchScore: number,
) => {
  // user experience and project summary if any
  const experienceSummary = profile.experience?.map((exp) => ({
    role: exp.role,
    company: exp.companyName,
    tasks: exp.description,
  }));

  const projectSummary = profile.projects?.map((proj) => ({
    title: proj.title,
    tech: proj.technologies.join(", "),
    details: proj.description,
  }));

  const systemPrompt = `
  You are an expert Technical Recruiter. Your task is to perform a detailed "Gap Analysis" between a Candidate and a Job.
  
  CRITICAL RULES:
  1. DO NOT mention or calculate a match percentage/score.
  2. Missing Skills: Identify ONLY the top 5 deal-breaker skills missing from the candidate's profile.
  3. Fix Suggestions: Provide exactly 3 high-level formatting or content tips.
  4. Rewrites: Select exactly 3 experience bullet points and rewrite them using the STAR method (quantifiable results).
  5. Formatting: Output MUST be a clean JSON object. No conversational text.
`.trim();

  const userPrompt = `
  Analyze the following candidate for the role of ${job.title}:

  ### JOB REQUIREMENTS:
  - Required Skills: ${job.requiredSkills.join(", ")}
  - Responsibilities: ${job.responsibilities.join(". ")}

  ### CANDIDATE DATA:
  - Headline: ${profile.headline}
  - Skills: ${profile.skills?.join(", ")}
  - Experience: ${JSON.stringify(experienceSummary)}
  - Projects: ${JSON.stringify(projectSummary)}

  Identify the missing skills, fix suggestions, and provide 3 impact rewrites.
`.trim();

  return { systemPrompt, userPrompt };
};
