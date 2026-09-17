import Anthropic from "@anthropic-ai/sdk";

// Reads ANTHROPIC_API_KEY from the environment automatically.
export const anthropic = new Anthropic();

export const CLASSIFY_MODEL = "claude-haiku-4-5";
export const AGENT_MODEL = "claude-sonnet-5";

// Appended to prompts that generate any text shown in the app (captions,
// hooks, narratives, DM drafts) - the house style uses plain hyphens, not
// em dashes.
export const NO_EM_DASH_INSTRUCTION =
  "Style rule: never use an em dash (—) anywhere in your response. Use a hyphen (-) or rewrite the sentence instead.";

export function requireAnthropicKey() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it to .env.local (see .env.local.example) and restart the server."
    );
  }
}
