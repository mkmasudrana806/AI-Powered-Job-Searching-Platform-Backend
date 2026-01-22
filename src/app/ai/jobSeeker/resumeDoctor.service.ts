import httpStatus from "http-status";
import { UserProfile } from "../../modules/userProfile/userProfile.model";
import AppError from "../../utils/AppError";
import { validateObjectIDs } from "../../utils/validateObjectIDs";
import { Job } from "../../modules/jobs/jobs.model";
import cosineSimilarity from "../../utils/consineSimilarityMatching";
import { getResumeDoctorPrompt } from "../prompts/resumeDoctor.prompt";
import aiServices from "../aiService";
import { AiResponseSchema } from "../aiResponseSchema";

/**
 * ----------- resume doctor/analysis service -----------
 *
 * @param userId user id (who wants resume analysis)
 * @param jobId job id (to match against)
 * @returns structured json response
 */
const resumeDoctorService = async (userId: string, jobId: string) => {
  // validate ids
  validateObjectIDs(
    { name: "userId", value: userId },
    { name: "jobId", value: jobId },
  );

  // fetch user profile
  const profile = await UserProfile.findOne({ user: userId }).select(
    "+embedding",
  );
  if (!profile) {
    throw new AppError(httpStatus.NOT_FOUND, "User profile not found!");
  }

  // fetch job data from job service
  const job = await Job.findById(jobId).select("+embedding");
  if (!job) {
    throw new AppError(httpStatus.NOT_FOUND, "Job not found!");
  }

  // calculate their match score
  const matchScore = cosineSimilarity(
    job.embedding ?? [],
    profile.embedding ?? [],
  );

  // get prompts
  const { systemPrompt, userPrompt } = getResumeDoctorPrompt(
    profile,
    job,
    matchScore,
  );

  // call ai service to get analysis
  const aiResponse = await aiServices.generateContent(
    systemPrompt,
    userPrompt,
    AiResponseSchema.resumeDoctor,
  );

  const finalResult = { ...JSON.parse(aiResponse), matchScore };
  return finalResult;
  
};

export default resumeDoctorService;
