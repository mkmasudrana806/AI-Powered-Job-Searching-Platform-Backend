import { InterviewPrep } from "../../modules/interviewPreparation/interviewPreparation.model";
import { Job } from "../../modules/jobs/jobs.model";
import { UserProfile } from "../../modules/userProfile/userProfile.model";
import cosineSimilarity from "../../utils/consineSimilarityMatching";
import { AiResponseSchema } from "../aiResponseSchema";
import aiServices from "../aiService";
import gentInterviewPrepPrompt from "../prompts/interviewPrep.prompt";

/**
 * ----------- interview preparation dashboard ----------------
 * when user 1st time click on it, dynamically generate dashboard data
 *
 * @param userId user id (who want to prepare himself)
 * @param jobId job id, user want to prepare for this job
 * @returns new dynamic dashboard data
 */
const interviewPrepDashboardService = async (userId: string, jobId: string) => {
  // before go into dashboard, we check if exist preparation
  const existingPrep = await InterviewPrep.findOne({ userId, jobId });
  if (existingPrep) return existingPrep;

  // fetch job and profile concurrently
  const [job, profile] = await Promise.all([
    Job.findById(jobId).lean(),
    UserProfile.findOne({ user: userId }).lean(),
  ]);

  if (!job || !profile) {
    throw new Error("Job or Profile data missing for preparation.");
  }

  // get prompt
  const { systemPrompt, userPrompt } = gentInterviewPrepPrompt(profile, job);

  // calculate matching score
  const matchScore = cosineSimilarity(
    profile.embedding ?? [],
    job.embedding ?? [],
  );

  // generate dashboard content with exact schema
  const aiResponse = await aiServices.generateContent(
    systemPrompt,
    userPrompt,
    AiResponseSchema.interviewPrepDashboard,
  );

  // save and return the newly dashboard to the user
  const newPrep = await InterviewPrep.create({
    userId,
    jobId,
    matchScore,
    ...JSON.parse(aiResponse),
  });

  return newPrep;
};

export default interviewPrepDashboardService;
