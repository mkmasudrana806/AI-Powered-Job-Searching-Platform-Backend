import httpStatus from "http-status";
import { Job } from "../../modules/jobs/jobs.model";
import { UserProfile } from "../../modules/userProfile/userProfile.model";
import AppError from "../../utils/AppError";
import getCoverLetterPrompt from "../prompts/coverLetter.promp";
import aiServices from "../aiService";
import { validateObjectIDs } from "../../utils/validateObjectIDs";
import { AiResponseSchema } from "../aiResponseSchema";

const coverLetterAiService = async (userId: string, jobId: string) => {
  // validate ids
  validateObjectIDs(
    { name: "userId", value: userId },
    { name: "jobId", value: jobId },
  );

  // fetch user profile
  const profile = await UserProfile.findOne({ user: userId });
  if (!profile) {
    throw new AppError(httpStatus.NOT_FOUND, "User profile not found!");
  }

  // fetch job data from job service
  const job = await Job.findById(jobId);
  if (!job) {
    throw new AppError(httpStatus.NOT_FOUND, "Job not found!");
  }

  // get prompts
  const { systemPrompt, userPrompt } = getCoverLetterPrompt(profile, job);

  // call ai service to get analysis
  const aiResponse = await aiServices.generateContent(
    systemPrompt,
    userPrompt,
    AiResponseSchema.coverLetter,
  );

  const finalResult = JSON.parse(aiResponse);
  return finalResult;
};

export default coverLetterAiService;
