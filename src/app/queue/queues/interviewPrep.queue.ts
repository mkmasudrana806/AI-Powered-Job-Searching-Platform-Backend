import { Queue } from "bullmq";
import redisConnection from "../../config/redis";

const interviewPrepQueue = new Queue("interview-prep-queue", {
  connection: redisConnection,
});

// error
interviewPrepQueue.on("error", (err) => {
  if (err) console.log("Salary prediction queue throws error!");
});

export default interviewPrepQueue;
