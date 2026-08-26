// Node's native TypeScript runner needs the .ts extension at runtime.
// @ts-expect-error The project tsconfig intentionally does not enable TS extension imports.
import { estimateTaskEffort } from "../lib/ai/estimate-task-effort.ts";

type EffortLevel = "low" | "medium" | "high";

type EvaluationCase = {
  title: string;
  expected: EffortLevel;
};

type EvaluationResult = {
  estimates: Array<{ effortLevel: EffortLevel }>;
};

const executeEstimate = estimateTaskEffort.execute as unknown as (
  input: { tasks: string[] },
  options: Record<string, never>
) => Promise<EvaluationResult>;

const evaluationCases: EvaluationCase[] = [
  { title: "Buy groceries", expected: "low" },
  { title: "Call the dentist", expected: "low" },
  { title: "Pack a weekend bag", expected: "low" },
  { title: "Clean the kitchen", expected: "low" },
  { title: "Book a hotel", expected: "medium" },
  { title: "Review the monthly budget", expected: "medium" },
  { title: "Research local schools", expected: "high" },
  { title: "Draft a project proposal", expected: "high" },
  { title: "Plan a family trip", expected: "high" },
  { title: "Design a landing page", expected: "high" },
  { title: "Send the confirmation email", expected: "low" },
  { title: "Organize the home office", expected: "medium" },
  { title: "Fix the leaking faucet", expected: "medium" },
  { title: "Prepare a presentation for investors", expected: "high" },
  { title: "Compare three insurance plans", expected: "high" },
  { title: "Schedule a quick meeting", expected: "low" },
  { title: "Learn basic photography", expected: "high" },
];

async function runEvaluation() {
  let correct = 0;
  const failures: Array<{
    title: string;
    expected: EffortLevel;
    actual: EffortLevel;
  }> = [];

  for (const evaluationCase of evaluationCases) {
    const result = await executeEstimate(
      {
      tasks: [evaluationCase.title],
      },
      {}
    );
    const actual = result.estimates[0]?.effortLevel ?? "medium";

    if (actual === evaluationCase.expected) {
      correct += 1;
    } else {
      failures.push({
        title: evaluationCase.title,
        expected: evaluationCase.expected,
        actual,
      });
    }
  }

  const total = evaluationCases.length;
  const percentage = ((correct / total) * 100).toFixed(1);

  console.log(`\nEffort evaluation: ${correct}/${total} correct (${percentage}%)`);

  if (failures.length === 0) {
    console.log("Failures: none");
  } else {
    console.log("Failures:");
    for (const failure of failures) {
      console.log(
        `- ${failure.title}: expected ${failure.expected}, got ${failure.actual}`
      );
    }
  }
}

runEvaluation().catch((error: unknown) => {
  console.error("Evaluation failed:", error);
  process.exitCode = 1;
});
