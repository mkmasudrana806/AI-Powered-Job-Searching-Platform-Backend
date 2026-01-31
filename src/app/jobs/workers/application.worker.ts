import { Worker } from "bullmq";
import redisConnection from "../../config/redis";
import {
  applicantReRankHandler,
  applicationMatchaiNoteHandler,
} from "../workerHandlers/application.handler";
import AppError from "../../utils/AppError";
import httpStatus from "http-status";

const applicationWorker = new Worker(
  "application-queue",
  async (job) => {
    switch (job.name) {
      // calculate applicant match score, rank score and ai notes
      // when user applies for a job
      case "application-match-rank":
        return await applicationMatchaiNoteHandler(job.data.applicationId);
      // when job ranking config is updated
      // re rank all applicants for a job
      case "application-re-rank":
        return await applicantReRankHandler(job.data.jobId);
      default:
        throw new AppError(
          httpStatus.BAD_REQUEST,
          `No handler found for ${job.name}`,
        );
    }
  },

  {
    connection: redisConnection,
    concurrency: 3,
    lockDuration: 120000,
  },
);

// active job
applicationWorker.on("active", (job, prev) => {
  console.log(`${job.name.toUpperCase()} scoring is active`);
});

// log on any completed job
applicationWorker.on("completed", (job) => {
  console.log(
    `${job.name.toUpperCase()} scoring is completed for ID: ${job.data.applicationId}`,
  );
});

// log on any failed job
applicationWorker.on("failed", (job, err) => {
  if (job) {
    console.error(
      `${job.name.toUpperCase()} scoring failed for ID: ${job.data.applicationId}. Reason: ${
        err.message
      }`,
    );
  }
});

export default applicationWorker;
