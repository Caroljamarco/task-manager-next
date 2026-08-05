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
concrete, actionable tasks they could add to their task list.

Guidelines:
- Output the tasks as a simple numbered list, one per line — nothing
  else before or after. No preamble like "Sure, here's a plan:".
- Keep each task short (under ~10 words) and action-oriented — start
  with a verb ("Book", "Research", "Draft"), not a noun phrase.
- Aim for 4-8 tasks. Fewer if the goal is small, more only if it
  genuinely needs it — don't pad the list.
- If the goal is too vague to break down responsibly (e.g. just "help
  me"), ask one clarifying question instead of guessing.
- Never invent specific dates, prices, or facts about the real world
  (flights, venues, etc.) — keep tasks generic and actionable
  regardless of specifics the user hasn't provided.
`;