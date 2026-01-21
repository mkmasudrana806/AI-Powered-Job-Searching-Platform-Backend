import { Worker } from "bullmq";
import redisConnection from "../../config/redis";
import { applicationMatchaiNoteHandler } from "../workerHandlers/application.handler";

const applicationMatchRankWorker = new Worker(
  "application-queue",
  async (job) => {
    switch (job.name) {
      // calculate applicant match score, rank score and ai notes
      // when user applies for a job
      case "application-match-rank":
        return await applicationMatchaiNoteHandler(job.data.applicationId);
    }
    const applicationId = job.data.applicationId;
  },

  {
    connection: redisConnection,
    concurrency: 3,
  },
);

// active job
applicationMatchRankWorker.on("active", (job, prev) => {
  console.log(`${job.name.toUpperCase()} scoring is active`);
});

// log on any completed job
applicationMatchRankWorker.on("completed", (job) => {
  console.log(
    `${job.name.toUpperCase()} scoring is completed for ID: ${job.data.applicationId}`,
  );
});

// log on any failed job
applicationMatchRankWorker.on("failed", (job, err) => {
  if (job) {
    console.error(
      `${job.name.toUpperCase()} scoring failed for ID: ${job.data.applicationId}. Reason: ${
        err.message
      }`,
    );
  }
});

export default applicationMatchRankWorker;
