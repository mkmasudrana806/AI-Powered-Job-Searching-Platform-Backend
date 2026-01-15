import { Worker } from "bullmq";
import redisConnection from "../../config/redis";

console.log("Embedding worker is booting...");

/**
 * Worker for profile, job data embedding or any
 */
const embeddingWorker = new Worker(
  "embedding-queue",
  async (job) => {
    switch (job.name) {
      case "profile":
        return "Call profile embedding function here";
    }
  },
  {
    connection: redisConnection,
    concurrency: 3,
  }
);

// active job
embeddingWorker.on("active", (job, prev) => {
  console.log(`${job.name.toUpperCase()} embedding is active`);
});

// any job completed
embeddingWorker.on("completed", (job, result) => {
  const name: string = job.name;
  const { jobId } = job.data;
  console.log(`${name.toUpperCase()} embedding is completed for ID: ${jobId}`);
});

// any job failed cases
embeddingWorker.on("failed", (job, err) => {
  if (err && job?.name) {
    console.log(
      `${job.name.toUpperCase()} embedding is failed for ID: ${
        job?.data.jobId
      }. Reason : ${err.message}`
    );
  } else {
    console.log("Unknown error on embedding is failed");
  }
});

export default embeddingWorker;
