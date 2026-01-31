import { Types } from "mongoose";
import employerQueue from "../../jobs/queues/employer.queue";
import CIQuestion from "./candidateInterviewQuetions.model";

/**
 * ---------- generate candidate specific interview question -------------
 *
 * @param jobId job id
 * @param candidateIds shortlisted all candidates ids
 * @return 'generating' status immediately
 */
const generateCIQuestion = async (jobId: string, candidateIds: [string]) => {
  // check if already question is generated
  const existingQuestions = await CIQuestion.find({ job: jobId })
    .select("status candidate")
    .lean();

  // for faster process, create a map
  const statusMap = new Map(
    existingQuestions.map((eq) => [eq.candidate.toString(), eq.status]),
  );

  // loop all ids, which id is not found or status='failed'
  // we only process those task as background
  const candidatesToProcess = candidateIds.filter((cid) => {
    const status = statusMap.get(cid.toString());
    // only submit as job if not data for that candidate or already failed
    return !status || status === "failed";
  });

  // if candidate to process zero. so no job to process
  if (candidatesToProcess.length === 0) {
    return "No candidate to process";
  }

  // for new, create a new record with status='generating'
  // for failed, update status='generating' for again try
  // bulk update to db to make status='generating'
  // it handle new candidate id as well as it changed 'failed' to 'generating'
  const bulkOps = candidatesToProcess.map((cId) => ({
    updateOne: {
      filter: {
        job: new Types.ObjectId(jobId),
        candidate: new Types.ObjectId(cId),
      },
      update: { status: "generating" },
      upsert: true,
    },
  }));
  await CIQuestion.bulkWrite(bulkOps);

  // each candidate as separate queue
  const jobs = candidateIds.map((cId) => ({
    name: "ci-question-generate",
    data: { jobId, candidateId: cId },
    opts: { attempts: 3, backoff: 5000 },
  }));

  // add bulk jobs
  await employerQueue.addBulk(jobs);

  return {
    message: `${candidatesToProcess.length || 0} candiate to process in queue`,
  };
};

/**
 * ---------- get all individual interview question with all status --------
 *
 * @param jobId job id, which interview question we want
 * @returns full data
 */
const getIndividualInterviewQuestions = async (jobId: string) => {
  const result = await CIQuestion.find({ job: jobId });
  return result;
};

export const CIQuestionService = {
  generateCIQuestion,
  getIndividualInterviewQuestions,
};
