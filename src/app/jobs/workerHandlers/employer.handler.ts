import httpStatus from "http-status";
import { Job } from "../../modules/jobs/jobs.model";
import AppError from "../../utils/AppError";
import employerStandardQuestionPrompt from "../../ai/prompts/employerStandardQuestion.prompt";
import aiServices from "../../ai/aiService";
import { AiResponseSchema } from "../../ai/aiResponseSchema";
import { UserProfile } from "../../modules/userProfile/userProfile.model";
import individualInterviewQuestionPrompt from "../../ai/prompts/individualInterviewQuestion.prompt";
import CIQuestion from "../../modules/candidateInterviewQuetions/candidateInterviewQuetions.model";
import geminiRateLimiter from "../../ai/geminiRateLimit";

/**
 * ---------- standard question generate for each job -----------
 * it generate common question for all candidate,
 * so that employer understand candidate's strong/weak
 * no biased to any candidate as same question for all candidate
 *
 * @param jobId job id to generate question set
 */
export const standardInterviewQuestionHandler = async (jobId: string) => {
  // fetch job data, which has interviewKitStatus to 'generating'
  const job = await Job.findOne({
    _id: jobId,
    interviewKitStatus: "generating",
  });
  if (!job) {
    throw new AppError(httpStatus.NOT_FOUND, "Job not found!");
  }

  // get standard question generation prompt
  const { systemPrompt, userPrompt } = employerStandardQuestionPrompt(job);

  try {
    // generate content
    const aiResponse = await geminiRateLimiter.schedule(() =>
      aiServices.generateContent(
        systemPrompt,
        userPrompt,
        AiResponseSchema.standardInterviewQuestion,
      ),
    );

    // embed interviewKit to job data
    await Job.findOneAndUpdate(
      { _id: jobId, interviewKitStatus: "generating" },
      {
        interviewKit: { ...JSON.parse(aiResponse) },
        interviewKitStatus: "generated",
      },
    );
  } catch (error) {
    // on failed, set interviewkitstatus to 'failed'
    await Job.findOneAndUpdate(
      { _id: jobId, interviewKitStatus: "generating" },
      {
        interviewKitStatus: "failed",
      },
    );
  }
};

/**
 * ---------- individual candidate's interview question set -------------
 * based on user resume and job description, geneate user agnostic question set
 *
 * @param jobId job id
 * @param candidateId candidate id
 * @return message
 */
export const individualInterviewQuestionHandler = async (
  jobId: string,
  candidateId: string,
) => {
  // fetch job and user profile
  const [job, profile] = await Promise.all([
    Job.findOne({ _id: jobId, status: "open" }).lean(),
    UserProfile.findOne({ user: candidateId }).lean(),
  ]);

  if (!job) {
    throw new AppError(httpStatus.NOT_FOUND, "Job is not found");
  }
  if (!profile) {
    throw new AppError(httpStatus.NOT_FOUND, "Profile is not found");
  }

  // generate prompt
  const { systemPrompt, userPrompt } = individualInterviewQuestionPrompt(
    job,
    profile,
  );

  try {
    // generate question
    const aiResponse = await geminiRateLimiter.schedule(() =>
      aiServices.generateContent(
        systemPrompt,
        userPrompt,
        AiResponseSchema.individualInterviewQuestion,
      ),
    );

    // save to database
    await CIQuestion.findOneAndUpdate(
      { candidate: candidateId, job: jobId },
      {
        ...JSON.parse(aiResponse),
        status: "generated",
      },
      {
        upsert: true,
      },
    );
  } catch (error) {
    await CIQuestion.findOneAndUpdate(
      { job: jobId, candidate: candidateId },
      { status: "failed" },
      { upsert: true },
    );
    throw error;
  }
};
