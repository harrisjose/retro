import { aiService, serializeDocForLlm } from "@retro/ai";
import { Worker } from "bullmq";
import * as Y from "yjs";
import { db, dbUtil } from "../../db/index.js";
import { QueueConnection } from "../config.js";
import { slackQueue } from "../slack/queue.js";
import { type JobData, QueueName, type ReturnData } from "./common.js";

const summaryWorker = new Worker<JobData, ReturnData>(
  QueueName,
  async (job) => {
    const { retroId } = job.data;

    const document = await db
      .selectFrom("document")
      .select(["yDoc", "yDocUpdatedAt"])
      .where("id", "=", dbUtil.asUuid(retroId))
      .executeTakeFirstOrThrow();

    if (!document.yDoc) {
      throw new Error("Document binary not found");
    }
    const yDoc = new Y.Doc();
    Y.applyUpdate(yDoc, new Uint8Array(document.yDoc));

    const serializedDocument = serializeDocForLlm(yDoc);

    console.time(`Generating summary for document ${retroId}`);
    const result = await aiService.generateSummary(serializedDocument);

    if (!result.ok) {
      throw new Error(result.error);
    }
    console.timeEnd(`Generating summary for document ${retroId}`);

    console.log(`Adding slack notification job for ${retroId}`);
    await slackQueue.add(`${retroId}-slack-summary`, {
      retroId,
      summary: result,
    });

    return { success: true, summary: result };
  },
  {
    connection: QueueConnection,
    prefix: "summary-queue",
  },
);

summaryWorker.on("ready", () => {
  console.log("Summary listening for jobs");
});

summaryWorker.on("completed", (job, returnvalue) => {
  console.log(`Completed job ${job.id} with return value ${returnvalue}`);
});

summaryWorker.on("failed", (job, err) => {
  console.error(
    `Summary generation failed for retro ${job?.data.retroId}`,
    err,
  );
});

const gracefulShutdown = async (signal: string) => {
  await summaryWorker.close();
  process.exit(0);
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
