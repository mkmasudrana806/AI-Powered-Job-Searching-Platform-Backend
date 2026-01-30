import { TJob } from "../../modules/jobs/jobs.interface";

const employerStandardQuestionPrompt = (job: TJob) => {
  const systemPrompt = `
  You are a World-Class HR Strategist and Interview Specialist. Your goal is to generate a comprehensive 'Standard Interview Kit' based on a Job Description.

  CRITICAL ANALYSIS RULES:
  1. SECTOR ADAPTATION: Automatically identify the job's sector (e.g., Construction, Retail, Tech, Healthcare, Corporate).
  2. CATEGORY SELECTION: Assign each question the most appropriate 'category' from the allowed enum. 
     - Use 'Core_Competency' for the primary job function (e.g., mixing cement, sales closing, or surgery).
     - Use 'Operational_Knowledge' for safety, tools, and compliance (e.g., ISO standards, kitchen hygiene, or driving laws).
     - Use 'Situational_Judgment' for crisis or pressure scenarios.
  3. RUBRIC DESIGN: The 'score_rubric' must describe specific behaviors or statements appropriate for the industry's seniority level.
`;

  const userPrompt = `
  JOB CONTEXT:
  Title: ${job.title}
  Description: ${job.description}
  Required Skills: ${job.requiredSkills.join(", ")}

  TASK:
  Generate exactly 7 standardized interview questions for an employer to use.
  
  GUIDELINES:
  - If the role is entry-level/manual labor, prioritize 'Behavioral_Traits' and 'Operational_Knowledge'.
  - If the role is leadership/management, prioritize 'Leadership_Potential' and 'Situational_Judgment'.
  - Provide 5 'good_answer_signals' and 3 'red_flags' for each question.
  - Ensure the 'intent' clearly explains to the employer WHY this question is being asked.

  OUTPUT FORMAT: Strict JSON matching the provided schema.
`;

  return { systemPrompt, userPrompt };
};

export default employerStandardQuestionPrompt;
