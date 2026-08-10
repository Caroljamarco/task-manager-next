// app/assistant/error.tsx
"use client";

import { useEffect } from "react";

export default function AssistantError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="route-error">
      <h1>Something went wrong</h1>
      <p>The task assistant couldn&apos;t load. This has been logged.</p>
      <button
        type="button"
        onClick={() => reset()}
        className="route-error-retry"
      >
        Try again
      </button>
    </main>
  );
}