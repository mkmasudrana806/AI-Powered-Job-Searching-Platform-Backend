import { Queue } from "bullmq";

export const embedding = new Queue("embedding-queue", {
  connection: {
    host: "localhost",
    port: 6379,
  },
});
