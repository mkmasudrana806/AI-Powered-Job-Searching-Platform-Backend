import { Worker } from "bullmq";
import redisConnection from "../../config/redis";

const applicationMatchRankWorker = new Worker(
  "application-match-queue",
  async (job) => {
    console.log("Job Name: ", job.name, "Job data: ", job.data);
    return "Yes at application time job is running!";
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
