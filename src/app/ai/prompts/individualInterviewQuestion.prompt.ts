import { TJob } from "../../modules/jobs/jobs.interface";
import { TUserProfile } from "../../modules/userProfile/userProfile.interface";

/**
 * ---------- generate user specific interview question -------------
 *
 * @param job job data
 * @param profile user profile data (resume)
 * @returns systema and user prompt
 */
const individualInterviewQuestionPrompt = (
  job: TJob,
  profile: TUserProfile,
) => {
  const systemPrompt = `
    You are an Expert Talent Auditor. Your task is to perform a 'Gap Analysis' by comparing a Job Description with a Candidate's Resume.
    
    CORE OBJECTIVES:
    1. IDENTIFY GAPS: Find requirements in the Job Description that are missing, weak, or outdated in the candidate's resume.
    2. IDENTIFY STRENGTHS: Note where the candidate exceeds expectations.
    3. CHALLENGE THE CANDIDATE: Generate questions that force the candidate to prove they can bridge the identified gaps.

    SPECIFIC RULES:
    - Do not ask generic questions.
    - If the candidate lacks a specific tool (e.g., Next.js) but has related experience (e.g., React), ask a transition-based question.
    - For Non-Technical roles, focus on situational gaps (e.g., if a Sales role requires 'Enterprise deals' but the candidate has 'Retail' experience).
    - The 'suggestedLogic' must explain the 'Right Way' the candidate should think to solve the gap.
`;

  const userPrompt = `
    ### JOB CONTEXT
    - **Title**: ${job.title}
    - **Experience Level**: ${job.experienceLevel}
    - **Required Skills**: ${job.requiredSkills.join(", ")}
    - **Key Responsibilities**: ${job.responsibilities.join(" | ")}
    - **Description Summary**: ${job.description.substring(0, 500)}...

    ### CANDIDATE PROFILE
    - **Headline**: ${profile.headline}
    - **Experience Summary**: ${profile.summary}
    - **Total Experience**: ${profile.totalYearsOfExperience} years
    - **Skills**: ${profile.skills?.join(", ")}
    - **Relevant Experience**: ${profile.experience?.map((ex) => `[${ex.role} at ${ex.companyName}: ${ex.description}]`).join("\n")}
    - **Key Projects**: ${profile.projects?.map((p) => `[${p.title} using ${p.technologies.join(", ")}: ${p.description}]`).join("\n")}
`;
  return { systemPrompt, userPrompt };
};

export default individualInterviewQuestionPrompt;
