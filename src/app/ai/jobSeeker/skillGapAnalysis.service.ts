import httpStatus from "http-status";
import { UserProfile } from "../../modules/userProfile/userProfile.model";
import AppError from "../../utils/AppError";
import { Job } from "../../modules/jobs/jobs.model";
import cosineSimilarity from "../../utils/consineSimilarityMatching";
import aiServices from "../aiService";
import getSkillGapPrompt from "../prompts/getSkillGapPrompt";
import { AiResponseSchema } from "../aiResponseSchema";

const skillGapAnalysisService = async (userId: string) => {
  // fetch user profile
  const profile = await UserProfile.findOne({ user: userId }).select(
    "+embedding",
  );
  if (!profile) {
    throw new AppError(httpStatus.NOT_FOUND, "User profile not found!");
  }

  // we dynamically take top user skills, so that we can use in job finding
  const topAnchors = profile.skills?.slice(0, 3) || [];

  // instead of use partial 'headline' search in 'job.title'
  // we split headline and use words by word regex
  const headlineWords = profile.headline.split(" ").slice(0, 3);

  const titleRegex = new RegExp(headlineWords.join("|"), "i");

  // user's top 3 skills used in job's requiredSkills search
  // it ensure stack matching pefectly and domain related jobs extracted
  const skillRegex = new RegExp(
    topAnchors.map((s) => s.replace(/js$/i, "")).join("|"),
    "i",
  );

  // fetch 150 candidates from DB
  const jobPool = await Job.find({
    $and: [
      { title: { $regex: titleRegex } },
      { requiredSkills: { $regex: skillRegex } },
      { status: "open" },
    ],
  })
    .select("+embedding requiredSkills title")
    .limit(150);

  // now we apply semantic matching to get the best output
  const rankedPool = jobPool.map((job) => {
    const score = cosineSimilarity(
      profile.embedding ?? [],
      job.embedding ?? [],
    );
    return { ...job.toObject(), similarityScore: score };
  });

  // now take only best matching jobs for next analysis
  const relevantJobs = rankedPool
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, 50);

  // count skill frequency among 50 jobs
  const skillFrequency: Record<string, number> = {};
  relevantJobs.forEach((job) => {
    job.requiredSkills.forEach((skill) => {
      const s = skill.toLowerCase();
      skillFrequency[s] = (skillFrequency[s] || 0) + 1;
    });
  });

  console.log(skillFrequency);
  console.log(profile?.skills)
 
  // get prompt for skill gap analysis
  const { systemPrompt, userPrompt } = getSkillGapPrompt(
    profile,
    skillFrequency,
    relevantJobs.length,
  );

  const result = await aiServices.generateContent(
    systemPrompt,
    userPrompt,
    AiResponseSchema.skillMarketAnalysis,
  );
  return JSON.parse(result);
};

export default skillGapAnalysisService;
