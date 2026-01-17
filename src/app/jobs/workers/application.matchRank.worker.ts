import { Worker } from "bullmq";
import redisConnection from "../../config/redis";
import { getApplicationDetails } from "../workerHandlers/application.matchRank.handler";

const applicationMatchRankWorker = new Worker(
  "application-match-queue",
  async (job) => {
    const applicationId = job.data.applicationId;
    // fetch application data with profile and job data
    await getApplicationDetails(applicationId);
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
