import type { SummaryResponse } from "@retro/ai";

export type JobData = {
  retroId: string;
};

export type ReturnData = {
  success: boolean;
  summary?: Extract<SummaryResponse, { ok: true }>;
};

export const QueueName = "retro-summary-queue";
