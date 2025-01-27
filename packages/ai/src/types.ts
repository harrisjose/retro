export enum AiProvider {
  OpenRouter = "openrouter",
}

export enum AiModel {
  DeepSeek_Chat = "deepseek/deepseek-chat",
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
