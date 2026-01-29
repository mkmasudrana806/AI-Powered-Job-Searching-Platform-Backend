import { Worker } from "bullmq";
import redisConnection from "../../config/redis";
import interviewPrepHandler from "../workerHandlers/interviewPrep.handler";

const interviewPrepWorker = new Worker(
  "interview-prep-queue",
  async (job) => {
    switch (job.name) {
      case "interview-prep-start":
        await interviewPrepHandler(job.data.userId, job.data.jobId);
        break;
    }
  },
  {
    connection: redisConnection,
    concurrency: 3,
  },
);

// active job
interviewPrepWorker.on("active", (job, prev) => {
  console.log(`${job.name.toUpperCase()} job is active`);
});

// log on any completed job
interviewPrepWorker.on("completed", (job) => {
  console.log(
    `${job.name.toUpperCase()} job is completed for ID: ${job.data.jobId}`,
  );
});

// log on any failed job
interviewPrepWorker.on("failed", (job, err) => {
  if (job) {
    console.error(
      `${job.name.toUpperCase()} job failed for ID: ${job.data.JobId}. Reason: ${
        err.message
      }`,
    );
  }
});

export default interviewPrepWorker;
