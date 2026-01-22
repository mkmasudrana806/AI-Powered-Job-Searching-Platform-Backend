import { TJob } from "../../modules/jobs/jobs.interface";
import { TUserProfile } from "../../modules/userProfile/userProfile.interface";

export const getCoverLetterPrompt = (profile: TUserProfile, job: TJob) => {
  // Logic to separate skills
  const matchedSkills = job.requiredSkills.filter((s: string) =>
    profile.skills?.some((ps) => ps.toLowerCase() === s.toLowerCase()),
  );

  const missingSkills = job.requiredSkills.filter(
    (s: string) =>
      !profile.skills?.some((ps) => ps.toLowerCase() === s.toLowerCase()),
  );

  const systemPrompt = `
    You are an Honest Career Coach. Generate a cover letter based on these integrity rules:
    
    1. NEVER claim the candidate has a skill they do not possess.
    2. KEYWORD INJECTION: Naturally emphasize the "Matched Skills".
    3. ADDRESSING GAPS: For "Missing Skills", do not lie. Instead, mention them as areas of active interest or show how "Matched Skills" (like fast learning or related tech) make the candidate a quick study for them.
    4. NO HALLUCINATION: Stick strictly to the provided Candidate Data.
    5. LENGTH: Keep it under 180 words.
  `.trim();

  const userPrompt = `
    Job Title: ${job.title}
    
    MATCHED SKILLS (Highlight these): ${matchedSkills.join(", ")}
    MISSING SKILLS (Address ethically or omit): ${missingSkills.join(", ")}
    
    CANDIDATE DATA:
    - Summary: ${profile.summary}
    - Total Exp: ${profile.totalYearsOfExperience} years
    - Projects: ${JSON.stringify(profile.projects?.map((p) => ({ title: p.title, tech: p.technologies })))}

    Write a modern, professional cover letter that focuses on strengths without falsifying information.
  `.trim();

  return { systemPrompt, userPrompt };
};
export default getCoverLetterPrompt;
