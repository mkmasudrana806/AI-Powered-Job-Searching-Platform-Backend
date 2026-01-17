import httpStatus from "http-status";
import { TJob } from "../../modules/jobs/jobs.interface";
import { TUserProfile } from "../../modules/userProfile/userProfile.interface";
import AppError from "../../utils/AppError";

/**
 * ---------- get aiNotes prompt ----------------
 * get user and system prompt with data.
 *
 * @param jobData job data
 * @param profileData user profile data
 */
const getAINotesPrompt = (
  jobData: Partial<TJob>,
  profileData: Partial<TUserProfile> & { experienceSnapshot: string },
) => {
  // jobData: title, requiredskills, responsibilities, experience level, employment type
  // profileData: headline, skills, experience, education, employment type, jobPreffered
  try {
    const systemPrompt = `
You are an ATS assistant that generates concise recruiter notes.
Compare a candidate against a job and produce short, factual insights.
Do not make hiring decisions.
Do not exaggerate.
Be neutral and precise.
`.trim();

    const userPrompt = `
Generate recruiter-facing AI notes for the following job application.

RULES:
- Output 3 to 5 bullet points only
- Each bullet max 15 words
- Focus on strengths, gaps, and job fit
- No generic statements
- No recommendations
- No emojis

JOB CONTEXT:
Title: ${jobData.title}
Experience Level: ${profileData.experience}
Required Skills: ${jobData.requiredSkills?.join(", ")}
Key Responsibilities: ${jobData.responsibilities?.join(", ")}
Employment Type: ${jobData.employmentType}


CANDIDATE CONTEXT:
Headline: ${profileData.headline}
Skills: ${profileData.skills?.join(", ")}
Experience Summary: ${profileData.experienceSnapshot}
Employment Type: ${profileData.employmentType}
JobPreffered: ${profileData.jobPreference}

Return only the bullet points.
`.trim();

    return { userPrompt, systemPrompt };
  } catch (error) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error to generate content",
    );
  }
};

export default getAINotesPrompt;
