import { Queue } from "bullmq";
import redisConnection from "../../config/redis";

// it is only for salary prediction job
const salaryPredictionQueue = new Queue("salary-prediction-queue", {
  connection: redisConnection,
});

// error
salaryPredictionQueue.on("error", (err) => {
  if (err) console.log("Salary prediction queue throws error!");
});

export default salaryPredictionQueue;
