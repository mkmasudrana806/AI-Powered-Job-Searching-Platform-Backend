import { Worker } from "bullmq";

new Worker("embedding-que", async (job) => {}, {
  connection: {
    host: "myredis.taskforce.run",
    port: 32856,
  },
});
