import { Worker } from "bullmq";
import redisConnection from "../../config/redis";
import {
  predictSalary,
  invalidateSalaryPredictionStatus,
} from "../workerHandlers/salaryPrediction.handler";

const salaryPredictionWorker = new Worker(
  "salary-prediction-queue",
  async (job) => {
    switch (job.name) {
      case "salary-prediction":
        await predictSalary(job.data.userId);
      case "salary-prediction-invalidate":
        await invalidateSalaryPredictionStatus(job.data.userId);
    }
  },
  {
    connection: redisConnection,
    concurrency: 3,
  },
);

// active job
salaryPredictionWorker.on("active", (job, prev) => {
  console.log(`${job.name.toUpperCase()} is active`);
});

// log on any completed job
salaryPredictionWorker.on("completed", (job) => {
  console.log(
    `${job.name.toUpperCase()} is completed for ID: ${job.data.userId}`,
  );
});

// log on any failed job
salaryPredictionWorker.on("failed", (job, err) => {
  if (job) {
    console.error(
      `${job.name.toUpperCase()} failed for ID: ${job.data.userId}. Reason: ${
        err.message
      }`,
    );
  }
});

export default salaryPredictionWorker;
