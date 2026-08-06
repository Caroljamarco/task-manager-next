// lib/ai/tools/estimate-task-effort.ts
import { tool } from "ai";
import { z } from "zod";

type EffortInfo = { level: "low" | "medium" | "high"; minutes: number };

const EFFORT_KEYWORDS: { [key: string]: EffortInfo } = {
  book: { level: "medium", minutes: 20 },
  research: { level: "high", minutes: 45 },
  draft: { level: "high", minutes: 40 },
  buy: { level: "low", minutes: 10 },
  call: { level: "low", minutes: 15 },
  review: { level: "medium", minutes: 25 },
  plan: { level: "high", minutes: 35 },
  pack: { level: "low", minutes: 20 },
  clean: { level: "low", minutes: 30 },
  design: { level: "high", minutes: 50 },
};

function estimateOne(title: string) {
  const trimmed = title.trim();
  if (!trimmed) {
    throw new Error("Task title cannot be empty.");
  }
  const firstWord = trimmed.split(/\s+/)[0]?.toLowerCase() ?? "";
  const match = EFFORT_KEYWORDS[firstWord];
  return {
    title: trimmed,
    effortLevel: match?.level ?? ("medium" as const),
    estimatedMinutes: match?.minutes ?? 20,
  };
}

export const estimateTaskEffort = tool({
  description:
    "Estimate the effort level (low/medium/high) and time needed for each task in a list. Call this after breaking a goal into tasks, before presenting the final list to the user.",
  inputSchema: z.object({
    tasks: z
      .array(
        z.string().min(1).describe("A single task title, e.g. 'Book hotel'")
      )
      .min(1)
      .max(10)
      .describe("The list of task titles to estimate effort for"),
  }),
  outputSchema: z.object({
    estimates: z.array(
      z.object({
        title: z.string(),
        effortLevel: z.enum(["low", "medium", "high"]),
        estimatedMinutes: z.number(),
      })
    ),
  }),
  execute: async ({ tasks }) => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return { estimates: tasks.map(estimateOne) };
  },
});