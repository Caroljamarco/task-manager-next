/**
 * lib/ai/config.ts
 *
 * Single source of truth for every AI-powered chat feature in this app:
 * which model, how it's tuned, and what it's told to do.
 *
 * IMPORTANT: this file only ever runs on the server (it's imported by
 * app/api/chat/route.ts, never by a client component). That's what
 * keeps the API key server-side.
 */

export const MODEL_CONFIG = {
  model: "claude-sonnet-4-5" as const,
  temperature: 0.7,
  maxTokens: 1024,
};

/**
 * AI Task Assistant — the capstone's central AI feature.
 * The user describes a goal in plain language; the assistant breaks
 * it into a concrete, ordered task list, streamed one task at a time
 * so the list visibly builds itself as it's generated.
 */

export const SYSTEM_PROMPT = `You are a task-planning assistant inside a Task Manager app.

Your job: when the user describes a goal (e.g. "plan a weekend trip",
"launch a small side project"), break it into a clear, ordered list of
concrete, actionable tasks.

Guidelines:
- First, decide the list of 4-8 short, action-oriented task titles
  (start with a verb, under ~10 words each).
- Then call the estimateTaskEffort tool with those exact task titles
  to get effort and time estimates before your final reply.
- After the tool returns, briefly confirm the plan in 1-2 sentences —
  do not repeat the task list as text, since the tool result already
  displays it.
- If the goal is too vague to break down responsibly, ask one
  clarifying question instead of guessing, and do not call the tool.
- Never invent specific dates, prices, or real-world facts.
`;