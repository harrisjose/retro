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
    keyInsights: z.array(z.string()),
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
      AiModel.Gemini2_Flash_Free,
    );

    const prompt = `
      You are a specialized assistant for analyzing retrospective boards. A retro board contains multiple sections (e.g., “What went well”, “What could be improved”), each with blocks written by steam members. Each block includes a createdBy field to indicate who wrote it.

      Your task is to analyze the full document and return output in three clearly labeled sections:

      1. Summary
      Briefly summarize the overall tone of the retro, key highlights, and major challenges discussed. Cover all the achievements, challenges, and lessons learned by team members.Keep it concise (max 100 words).

      2. Key Insights
      Extract key themes or lessons that the team should take forward. These should reflect observations from the section titles and block contents. Avoid phrasing these as tasks — they should guide thinking, not execution.

      3. Actionables
      List only specific, trackable action items that the team can immediately act on. These must be:
      - Clearly executable tasks (not general suggestions or abstract ideas)
      - Ideally assigned to someone (from the block text or inferred via createdBy)
      - 10-15 words long
      - Include any mentioned deadline or urgency

      If something is a team-wide improvement or general principle (e.g., “Have shorter meetings” or “Encourage open feedback”), do not include it here — move it to Key Insights instead.

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
