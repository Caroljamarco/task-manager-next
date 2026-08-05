// app/api/chat/route.ts
//
// Server-only. This is the one place the Anthropic API key is used —
// it's read from process.env.ANTHROPIC_API_KEY, which the AI SDK's
// `anthropic()` provider picks up automatically. It is never sent to,
// or readable by, the client.

import { anthropic } from "@ai-sdk/anthropic";
import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { SYSTEM_PROMPT, MODEL_CONFIG } from "@/lib/ai/config";

export const runtime = "edge";
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();
  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: anthropic(MODEL_CONFIG.model),
    system: SYSTEM_PROMPT,
    messages: modelMessages,
    temperature: MODEL_CONFIG.temperature,
    maxOutputTokens: MODEL_CONFIG.maxTokens,
  });

  return result.toUIMessageStreamResponse();
}