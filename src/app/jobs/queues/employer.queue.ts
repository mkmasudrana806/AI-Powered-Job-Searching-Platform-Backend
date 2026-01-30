import { Queue } from "bullmq";
import redisConnection from "../../config/redis";

// this queue handle many jobs
const employerQueue = new Queue("employer-queue", {
  connection: redisConnection,
});

// error log
employerQueue.on("error", (err) => {
  console.log("Employer queue throws error!: ", err);
});

export default employerQueue;
