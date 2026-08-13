// app/components/ToolCard.tsx
"use client";

type EffortEstimate = {
  title: string;
  effortLevel: "low" | "medium" | "high";
  estimatedMinutes: number;
};

// Shape of a tool-estimateTaskEffort part in message.parts, narrowed by
// state (AI SDK v5 tool part lifecycle).
type ToolPart = {
  type: string;
  state: "input-streaming" | "input-available" | "output-available" | "output-error";
  toolCallId: string;
  input?: { tasks?: string[] };
  output?: { estimates: EffortEstimate[] };
  errorText?: string;
};

export default function ToolCard({ part }: { part: ToolPart }) {
  if (part.state === "input-streaming") {
    return (
      <div className="tool-card tool-card-loading" aria-live="polite">
        <div className="tool-card-header">Preparing effort estimate…</div>
        <div className="tool-card-skeleton" />
      </div>
    );
  }

  if (part.state === "input-available") {
    const tasks = part.input?.tasks ?? [];
    return (
      <div className="tool-card tool-card-loading" aria-live="polite">
        <div className="tool-card-header">
          <span className="tool-card-spinner" />
          Estimating effort for {tasks.length} task
          {tasks.length === 1 ? "" : "s"}…
        </div>
        <div className="tool-card-chips">
          {tasks.map((t, i) => (
            <span key={i} className="tool-card-chip">
              {t}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (part.state === "output-available" && part.output) {
    return (
      <div className="tool-card tool-card-result">
        <div className="tool-card-header">Effort estimate</div>
        <div className="tool-card-grid">
          {part.output.estimates.map((e, i) => (
            <div key={i} className={`effort-card effort-${e.effortLevel}`}>
              <div className="effort-card-title">{e.title}</div>
              <div className="effort-card-badge">{e.effortLevel}</div>
              <div className="effort-card-time">{e.estimatedMinutes} min</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // output-error
  return (
    <div className="tool-card tool-card-error" role="alert">
      <div className="tool-card-header">Couldn&apos;t estimate effort</div>
      <p className="tool-card-error-text">
        {part.errorText ?? "Something went wrong running this tool."}
      </p>
    </div>
  );
}