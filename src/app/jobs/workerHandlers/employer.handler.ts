import httpStatus from "http-status";
import { Job } from "../../modules/jobs/jobs.model";
import AppError from "../../utils/AppError";
import employerStandardQuestionPrompt from "../../ai/prompts/employerStandardQuestion.prompt";
import aiServices from "../../ai/aiService";
import { AiResponseSchema } from "../../ai/aiResponseSchema";

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
    const aiResponse = await aiServices.generateContent(
      systemPrompt,
      userPrompt,
      AiResponseSchema.standardInterviewQuestion,
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
