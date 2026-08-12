import Anthropic from "@anthropic-ai/sdk";

// Reads ANTHROPIC_API_KEY from the environment automatically.
export const anthropic = new Anthropic();

export const CLASSIFY_MODEL = "claude-haiku-4-5";
