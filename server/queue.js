const Queue = require("bull");
const axios = require("axios");

class SubScriptionQueue {
  constructor() {
    // initialize queue
    this.queue = new Queue("Subscriptions", {
      redis: { port: 6379, host: "redis-server" },
    });
    // add a worker
    this.queue.process("send", (job) => {
      this.processEvents(job.data);
    });
  }

  addUrlsToQueue(data) {
    this.queue.add("send", data);
  }

  async processEvents(job) {
    const { urls, message } = job;
    try {
      await axios.all(urls.map((url) => axios.post(url, message)));
      job.moveToCompleted("done", true);
    } catch (error) {
      if (error.response) {
        job.moveToFailed({ message: "job failed" });
      }
    }
  }
}

module.exports = SubScriptionQueue;
