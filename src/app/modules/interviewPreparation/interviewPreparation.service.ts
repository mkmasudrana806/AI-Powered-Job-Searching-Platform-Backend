import interviewPrepQueue from "../../jobs/queues/interviewPrep.queue";
import { InterviewPrep } from "./interviewPreparation.model";

/**
 * ----------- interview preparation dashboard ----------------
 * it handle poll request, as well as normal api call
 *
 * @param userId user id (who want to prepare himself)
 * @param jobId job id, user want to prepare for this job
 * @returns return 'generating' for new job, 'generated' when complete or old job, 'failed' when gemini failed to generate
 */
const interviewPrepStart = async (userId: string, jobId: string) => {
  // for old preparation
  const existingPrep = await InterviewPrep.findOne({
    user: userId,
    job: jobId,
  });

  // if existingPrep not exist means
  // create a new data to db with status='generating'
  // submit a job to the backgorund worker
  if (!existingPrep) {
    // create a new interview preparation data
    const result = await InterviewPrep.create({
      status: "generating",
      user: userId,
      job: jobId,
    });

    // submit a background job for creating prepration dashboard
    interviewPrepQueue.add(
      "interview-prep-start",
      { userId, jobId },
      {
        attempts: 2,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
      },
    );

    return result;
  }

  // if status 'generated'/'generating' return full data
  // cover old user + poll request
  // for 'generating' by default others value will be null

  return existingPrep;
};

export const interviewPrepService = {
  interviewPrepStart,
};
