
// app/api/chat/route.ts
//
// Server-only. This is the one place the Anthropic API key is used —
// it's read from process.env.ANTHROPIC_API_KEY, which the AI SDK's
// `anthropic()` provider picks up automatically. It is never sent to,
// or readable by, the client.
import { anthropic } from "@ai-sdk/anthropic";
import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { SYSTEM_PROMPT, MODEL_CONFIG } from "@/lib/ai/config";
import { estimateTaskEffort } from "@/lib/ai/estimate-task-effort";
import {
  checkRateLimit,
  getClientIp,
  isMessageTooLong,
  MAX_MESSAGE_LENGTH,
} from "@/lib/ai/rate-limit";
 
export const runtime = "edge";
export const maxDuration = 30;
 
export async function POST(req: Request) {
  // 1. Proteção de rate limit — barra visitantes que estão mandando
  // requisições rápido demais, antes de gastar qualquer crédito de API.
  const ip = getClientIp(req);
  const { allowed } = checkRateLimit(ip);
 
  if (!allowed) {
    return new Response(
      JSON.stringify({
        error: "Too many requests. Please wait a moment and try again.",
      }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }
 
  const { messages }: { messages: UIMessage[] } = await req.json();
 
  // 2. Proteção de tamanho de mensagem — barra textos gigantes antes
  // de mandar pra API, evitando gasto desnecessário de tokens.
  const lastMessage = messages[messages.length - 1];
  const lastMessageText = lastMessage?.parts
    ?.map((part) => ("text" in part ? part.text : ""))
    .join("");
 
  if (lastMessageText && isMessageTooLong(lastMessageText)) {
    return new Response(
      JSON.stringify({
        error: `Message too long. Please keep it under ${MAX_MESSAGE_LENGTH} characters.`,
      }),
      { status: 413, headers: { "Content-Type": "application/json" } }
    );
  }
 
  const modelMessages = await convertToModelMessages(messages);
 
  const result = streamText({
    model: anthropic(MODEL_CONFIG.model),
    system: SYSTEM_PROMPT,
    messages: modelMessages,
    temperature: MODEL_CONFIG.temperature,
    maxOutputTokens: MODEL_CONFIG.maxTokens,
    tools: { estimateTaskEffort },
  });
 
  return result.toUIMessageStreamResponse();
}
 
