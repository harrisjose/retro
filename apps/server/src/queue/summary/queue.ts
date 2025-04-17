import { Job, Queue, QueueEvents } from "bullmq";
import * as Y from "yjs";
import { updateLiveYDoc } from "../../collab/index.js";
import { patchFragmentWithSummary } from "../../collab/utils.js";
import { QueueConnection } from "../config.js";
import { type JobData, QueueName, type ReturnData } from "./common.js";

const summaryQueue = new Queue<JobData, ReturnData>(QueueName, {
  connection: QueueConnection,
  prefix: "summary-queue",
});

const summaryQueueEvents = new QueueEvents(QueueName, {
  connection: QueueConnection,
  prefix: "summary-queue",
});

summaryQueueEvents.on("completed", async ({ jobId }: { jobId: string }) => {
  try {
    const job = await Job.fromId<JobData, ReturnData>(summaryQueue, jobId);

    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }
    const { retroId } = job.data;
    const { success, summary } = job.returnvalue;

    if (!success || !summary) {
      throw new Error(`Summary generation failed for retro ${retroId}`);
    }

    await updateLiveYDoc(retroId, (yDoc) => {
      const summarySection = yDoc.getMap("summary");
      const contentFragment = summarySection.get("content") as Y.XmlFragment;

      patchFragmentWithSummary(contentFragment, summary);
    });
  } catch (error) {
    console.error(error);
  }
});

export { summaryQueue, summaryQueueEvents };
