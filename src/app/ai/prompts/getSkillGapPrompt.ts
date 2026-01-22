import { TUserProfile } from "../../modules/userProfile/userProfile.interface";

/**
 * ------------- get skill gap analysis --------------
 *
 * @param profile user profile data
 * @param skillsFrequencies market analyzed top 50 jobs's skills frequency array
 * @param analyzedJobs total analyzed length
 * @returns system and user prompt
 */
const getSkillGapPrompt = (
  profile: TUserProfile,
  skillsFrequencies: Record<string, number>,
  analyzedJobs: number,
) => {
  // if any experiences or project present
  const experiences =
    profile.experience
      ?.map((exp) => `- ${exp.role} at ${exp.companyName}: ${exp.description}`)
      .join("\n") || "No experience listed";

  const projects =
    profile.projects
      ?.map(
        (proj) =>
          `- ${proj.title} (Tech: ${proj.technologies.join(", ")}): ${proj.description}`,
      )
      .join("\n") || "No projects listed";

  // const experiences = profile.experience
  //   ?.map((exp: any) => exp.description)
  //   .join(" ");
  // const projects = profile.projects?.map((p: any) => p.description).join(" ");

  const systemPrompt = `
    You are a Strict Data Reporter. Your task is to transform raw frequency data into a structured chart.

    STRICT CALCULATION RULES:
    1. SOURCE: 'chart_data' must include EVERY skill found in the 'RAW MARKET FREQUENCY DATA'.
    2. PERCENTAGE MATH: demand_percentage = (Frequency / ${analyzedJobs}) * 100. (Example: If frequency is 1 and analyzedJobs is 3, percentage is 33.33).
    3. SYNONYM MERGING: You MUST merge synonyms (e.g., "Nodejs" and "Node.js" become "Node.js"). Sum their frequencies before calculating the percentage.
    4. MATCHING: Set 'user_has_it' to TRUE only if the market skill (or a synonym) exists in the User's Skills, Experience, or Project text.
    5. NO EXTRA SECTIONS: Do not provide an additional skills list. Everything goes in 'chart_data'.
  `.trim();

  const userPrompt = `
    ### INPUT DATA:
    - Total Analyzed Jobs: ${analyzedJobs}
    - Raw Frequency Map: ${JSON.stringify(skillsFrequencies)}

    ### USER CONTEXT:
    - Skills: ${profile.skills?.join(", ")}
    - Bio/Exp: ${experiences} ${projects}

    Return a JSON array in 'chart_data' representing the market demand.
  `.trim();
  return { systemPrompt, userPrompt };
};

export default getSkillGapPrompt;
