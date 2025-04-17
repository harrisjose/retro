import type { SummaryResponse } from "@retro/ai";

export type JobData = {
  retroId: string;
  summary: Extract<SummaryResponse, { ok: true }>;
};

export type ReturnData = {
  success: boolean;
};

export const QueueName = "retro-slack-queue";
