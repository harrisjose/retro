import type { SummaryResponse } from "@retro/ai";

export type JobData = {
  retroId: string;
  summary: SummaryResponse;
};

export const QueueName = "retro-slack-queue";
