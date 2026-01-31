import { AiResponseSchema } from "../../ai/aiResponseSchema";
import aiServices from "../../ai/aiService";
import geminiRateLimiter from "../../ai/geminiRateLimit";
import getInterviewPrepPrompt from "../../ai/prompts/interviewPrep.prompt";
import { InterviewPrep } from "../../modules/interviewPreparation/interviewPreparation.model";
import { Job } from "../../modules/jobs/jobs.model";
import { UserProfile } from "../../modules/userProfile/userProfile.model";
import cosineSimilarity from "../../utils/consineSimilarityMatching";

/**
 * -------- interview preparation handler -----------------
 *
 * @param userId user id who want to prepare interview preparatino
 * @param jobId job id
 * @returns nothing, save the dashboard data to DB
 */
const interviewPrepHandler = async (userId: string, jobId: string) => {
  try {
    // fetch job and profile concurrently
    const [job, profile] = await Promise.all([
      Job.findById(jobId).lean(),
      UserProfile.findOne({ user: userId }).lean(),
    ]);

    if (!job || !profile) {
      throw new Error("Job or Profile data missing for preparation.");
    }

    // get prompt
    const { systemPrompt, userPrompt } = getInterviewPrepPrompt(profile, job);

    // calculate matching score
    const matchScore = cosineSimilarity(
      profile.embedding ?? [],
      job.embedding ?? [],
    );

    // generate dashboard content with exact schema
    const aiResponse = await geminiRateLimiter.schedule(() =>
      aiServices.generateContent(
        systemPrompt,
        userPrompt,
        AiResponseSchema.interviewPrepDashboard,
      ),
    );

    // save and return the newly dashboard to the user
    const newPrep = await InterviewPrep.findOneAndUpdate(
      {
        user: userId,
        job: jobId,
      },
      {
        matchScore,
        status: "generated",
        ...JSON.parse(aiResponse),
      },
    );

    return newPrep;
  } catch (error) {
    // on failed, we update interviewPrep status
    await InterviewPrep.findOneAndUpdate(
      {
        user: userId,
        job: jobId,
      },
      {
        status: "failed",
      },
    );

    throw error;
  }
};

export default interviewPrepHandler;
