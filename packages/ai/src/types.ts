export enum AiProvider {
  OpenRouter = "openrouter",
}

export enum AiModel {
  DeepSeek_Chat = "deepseek/deepseek-chat",
  Gemini2_Flash_Free = "google/gemini-2.0-flash-exp:free",
  Gemini2_Flash = "google/gemini-2.0-flash-001",
}

export type SerializedDocument = {
  sections: Array<{
    name: string;
    content: string | null;
    blocks: Array<{
      content: string;
      type: string;
    }>;
  }>;
};

export type Bounds = {
  top: number;
  left: number;
  right: number;
  bottom: number;
};
