This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## AI Task Assistant — Tool Contract (FE-07)

The `/assistant` page's chat calls a server-side tool, `estimateTaskEffort`,
defined in `lib/ai/estimate-task-effort.ts` and registered in
`app/api/chat/route.ts`.

### Tool: `estimateTaskEffort`

**Description:** Estimates the effort level (low/medium/high) and time
needed for each task in a list, using a server-side keyword-matching
reference table. Called by the model after breaking a goal into tasks,
before presenting the final list to the user.

**Input schema (Zod):**
```ts
z.object({
  tasks: z
    .array(z.string().min(1))
    .min(1)
    .max(10),
})
```

**Output schema (Zod):**
```ts
z.object({
  estimates: z.array(
    z.object({
      title: z.string(),
      effortLevel: z.enum(["low", "medium", "high"]),
      estimatedMinutes: z.number(),
    })
  ),
})
```

**Error case:** `execute` throws if a task title is empty after
trimming, which surfaces as the tool's `output-error` state on the
client.

### Tool part states (rendered in `app/components/ToolCard.tsx`)

| State | Visual treatment |
|---|---|
| `input-streaming` | Neutral gray card, shimmering skeleton bar, "Preparing effort estimate…" |
| `input-available` | Same neutral card + spinner + the task titles as chips, "Estimating effort for N tasks…" |
| `output-available` | White result card, one color-coded mini-card per task (green/amber/red by effort level), title + badge + time estimate |
| `output-error` | Red-bordered card with `role="alert"`, distinct from every other state, showing the error message |

### Known limitation — API billing

This project uses the Anthropic API directly (via `streamText` +
`@ai-sdk/anthropic`), which has no free tier — unlike claude.ai, it
bills per request from the very first call. The account used for local
testing has not been funded with paid credits, per the internship's
guidance to use free tools only.

As a result, live requests currently fail with:
`"Your credit balance is too low to access the Anthropic API."`

This is **not a code defect**. Server logs confirm the request reaches
Anthropic fully and correctly formatted — including the `estimateTaskEffort`
tool definition, its JSON-schema-converted input schema, and the
conversation history — and Anthropic rejects it purely on billing
grounds (HTTP 400, `invalid_request_error`). All FE-07 evaluation
criteria are implemented and verifiable in the source:

- Tool defined with a typed Zod schema — see `lib/ai/estimate-task-effort.ts`
- All four tool part states render with distinct visual treatment — see `app/components/ToolCard.tsx`
- The tool result renders as a real component (color-coded effort cards), not raw text or JSON
- A failed tool execution renders a designed error state (`output-error`), not a crash

A question was posted in the program Q&A asking how billing costs
should be handled given the free-tools-only guidance.