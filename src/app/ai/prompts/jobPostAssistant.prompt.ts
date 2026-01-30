/**
 * ------------- ai assistant in job descript generation ----------------
 *
 * @param userInput Sample user instruction about job role
 * @param location company location
 * @param currency currency of company' country
 * @returns system and user prompt
 */
const getJobPostAssistantPrompt = (
  userInput: string,
  location: { city: string; country: string; officeAddress: string },
  currency: string,
) => {
  const systemPrompt = `
  You are an expert Local Recruitment Consultant. 
  Your goal is to generate a job post that is market-competitive for the specific LOCATION and CURRENCY provided.
  
  Market Rules:
  - If Currency is 'BDT', suggest salaries typical for the Bangladesh market.
  - If Currency is 'USD', suggest salaries typical for the global/US market and so on.
  - Ensure the 'rawText' for salary uses the correct currency symbol (e.g., ৳, $, £).
`;

  const userPrompt = `
  JOB ROLE BRIEF: "${userInput}"
  COMPANY LOCATION: cite:- ${location.city}, country:- ${location.country}, officeAddres:- ${location.officeAddress}
  REQUIRED CURRENCY: ${currency}
  
  Generate a professional job post. Ensure the salary range (min/max) is appropriate for a ${location.city} based role in ${currency}. also maintained business rule properly.
`;

  return { systemPrompt, userPrompt };
};

export default getJobPostAssistantPrompt;
