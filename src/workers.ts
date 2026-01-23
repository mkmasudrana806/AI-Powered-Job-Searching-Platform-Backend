import { Worker } from "bullmq";
import embeddingWorker from "./app/jobs/workers/embedding.worker";
import applicationMatchRankWorker from "./app/jobs/workers/application.worker";
import mongoose from "mongoose";
import config from "./app/config/env";
import salaryPredictionWorker from "./app/jobs/workers/salaryPrediction.worker";

const allWorkers: Worker[] = [
  embeddingWorker,
  applicationMatchRankWorker,
  salaryPredictionWorker,
];

// for this workers process, we connect db
main().catch((err) => console.log(err));
async function main() {
  try {
    await mongoose.connect(config.database_url as string);
    // await mongoose.connect("mongodb://127.0.0.1:27017/job");
    console.log("Database is connected for worker process!");
  } catch (error) {
    console.log(
      "Error while connecting to Database for Workers process!",
      error,
    );
  }
}

// common logs for all worker
allWorkers.forEach((worker) => {
  // worker is connected
  worker.on("ready", () => {
    console.log(`[SYSTEM] ${worker.name} is connected to Redis.`);
  });

  // any worker connection error
  worker.on("error", (err) => {
    console.error(`[CRITICAL] ${worker.name} connection error:`, err);
  });

  // if any worker stucked
  worker.on("stalled", (jobId) => {
    console.warn(`[STALLED] Job ${jobId} on ${worker.name} is stuck.`);
  });
});

// shutdown gracefully this processes
process.on("SIGINT", async () => {
  console.log("🛑 Worker shutting down");
  process.exit(0);
});
