import { TJob } from "../../modules/jobs/jobs.interface";
import { TUserProfile } from "../../modules/userProfile/userProfile.interface";

/**
 *
 * @param profile
 * @param job
 */
const getInterviewPrepPrompt = (profile: TUserProfile, job: TJob) => {
  // create profile and job context
  const jobContext = `
          Title: ${job.title}
          Description: ${job.description}
          Requirements: ${job.requiredSkills.join(", ")}
          Responsibilities: ${job.responsibilities.join(" | ")}
        `;

  const userContext = `
          Current Role: ${profile.headline}
          Skills: ${profile.skills?.join(", ")}
          Experience Summary: ${profile.experience?.map((e) => `${e.role} at ${e.companyName}`).join("; ")}
          Notable Work: ${profile.projects?.map((p) => `${p.title}: ${p.description}`).join(" | ")}
        `;

  // ststem prompt
  const systemPrompt = `
          You are a World-Class Career Coach. Your goal is to prepare a candidate for an interview.
          You must be UNIVERSAL: adjust your tone for any industry (Blue-collar, Corporate, Creative, Tech).
          Anchoring Rule: Every 'personal_anchor_hint' must refer to the candidate's actual experience or projects.
          Gap Rule: If the job requires something the candidate lacks, create a 'pivot_strategy'.
        `;

  // user promtp
  const userPrompt = `
          ANALYZE THE MATCH:
          JOB CONTEXT: ${jobContext}
          CANDIDATE CONTEXT: ${userContext}
          Generate a complete 10-question interview dashboard in exact JSON format.
        `;

  return { systemPrompt, userPrompt };
};

export default getInterviewPrepPrompt;
