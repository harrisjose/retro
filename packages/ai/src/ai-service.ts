import {
  type OpenRouterProvider,
  createOpenRouter,
} from "@openrouter/ai-sdk-provider";
import { generateObject } from "ai";
import { z } from "zod";
import { AiModel, AiProvider, type SerializedDocument } from "./types.js";

const summarySchema = z.discriminatedUnion("ok", [
  z.object({
    ok: z.literal(true),
    summary: z.string(),
    actionables: z.array(z.string()),
  }),
  z.object({
    ok: z.literal(false),
    error: z.string(),
  }),
]);

export class AiService {
  private static instance: AiService | null = null;
  private static providers: Record<AiProvider, OpenRouterProvider> =
    {} as Record<AiProvider, OpenRouterProvider>;

  public static getInstance(): AiService {
    if (!AiService.instance) {
      AiService.instance = new AiService();
    }
    return AiService.instance;
  }

  public async lazyLoadModel(provider: AiProvider, model: AiModel) {
    switch (provider) {
      case AiProvider.OpenRouter: {
        let providerInstance = AiService.providers[provider];
        if (!providerInstance) {
          providerInstance = createOpenRouter({
            apiKey: process.env.OPENROUTER_API_KEY,
            compatibility: "strict",
          });
          AiService.providers[provider] = providerInstance;
        }
        return providerInstance(model);
      }
      default: {
        throw new Error("Model not found");
      }
    }
  }

  public async generateSummary(
    document: SerializedDocument,
  ): Promise<SummaryResponse> {
    const model = await this.lazyLoadModel(
      AiProvider.OpenRouter,
      AiModel.DeepSeek_Chat,
    );
    const prompt = `
      You are a helpful assistant that summarizes retro boards. Retro boards are structured as a list of sections,
      and each section can contain a list of blocks (stickies/cards). The intro section usually contains a description of
      how the retro is usually conducted. 
      
      Your task is to summarize the stickies that are in the sections and to create a list of actionable items. 
      If there is not enough data for the summary, you should return an error message. If there is enough data,
      you should return a summary ( a paragraph with under 100 words ) and a list of actionable items ( 1 sentence each, 6-10 words )

      Here is the document to summarize in json format:
      \`\`\`json
      ${JSON.stringify(document)}
      \`\`\`
    `.trim();

    try {
      const result = await generateObject({
        model,
        prompt,
        schema: summarySchema,
        mode: "json",
      });

      return result.object;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

export type SummaryResponse = z.infer<typeof summarySchema>;
export const aiService = AiService.getInstance();
