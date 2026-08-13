// app/buttons-demo/page.jsx
"use client";
import SendButton from "../components/SendButton";

export default function ButtonsDemoPage() {
  // Deterministic outcomes for the two demo/testing buttons — makes both
  // paths reachable on demand instead of waiting on the random 20% rate.
  const forceSuccess = () => new Promise((resolve) => setTimeout(resolve, 1000));
  const forceError = () =>
    new Promise((_, reject) => setTimeout(() => reject(new Error("forced")), 1000));

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-heading font-bold text-ink">
        Buttons with a Brain
      </h1>
      <p className="mt-3 max-w-xl text-ink/70">
        One button, three ways to trigger it. The middle one behaves like the
        real thing (~20% random failure); the two below force each outcome so
        both paths are always reachable for review.
      </p>

      <div className="mt-10 flex flex-wrap items-center gap-6">
        <div className="flex flex-col items-start gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink/50">
            Realistic (~20% fail)
          </span>
          <SendButton label="Send message" />
        </div>

        <div className="flex flex-col items-start gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink/50">
            Always succeeds
          </span>
          <SendButton label="Simulate success" onSend={forceSuccess} />
        </div>

        <div className="flex flex-col items-start gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink/50">
            Always fails
          </span>
          <SendButton label="Simulate error" onSend={forceError} />
        </div>
      </div>

      <section className="mt-16 max-w-xl space-y-3 text-sm leading-6 text-ink/80">
        <h2 className="text-lg font-heading font-semibold text-ink">
          Duration &amp; easing notes
        </h2>
        <p>
          <strong>Idle → loading:</strong> label and spinner cross-fade in
          ~150-200ms with a small upward slide, so the handoff reads as one
          continuous motion instead of a flicker. The button&apos;s width
          never changes — only the content inside cross-fades — which keeps
          every transition limited to <code>transform</code> and{" "}
          <code>opacity</code>, so nothing else on the page has to reflow.
        </p>
        <p>
          <strong>Loading → success:</strong> the checkmark uses a bouncy
          cubic-bezier (<code>0.34, 1.56, 0.64, 1</code>) over 320ms — a small
          overshoot reads as a positive, energetic confirmation. Success then
          auto-reverts to idle after 1.4s: good news doesn&apos;t need to
          linger for a decision.
        </p>
        <p>
          <strong>Loading → error:</strong> a 380ms shake (skipped entirely
          under <code>prefers-reduced-motion</code>, where only the red color
          and label change remain) signals failure physically, not just by
          color. Unlike success, error does <em>not</em> auto-revert — it
          waits for the user to consciously retry, since a failure that
          silently disappears is easy to miss.
        </p>
        <p>
          <strong>Hover/press:</strong> hover lifts 1px with a soft shadow
          over 150ms ease; press settles back down in 100ms — fast enough to
          feel tactile without feeling twitchy.
        </p>
        <p>
          <strong>Interruptibility:</strong> the button disables itself
          during <code>loading</code>, so repeat clicks mid-flight are
          ignored rather than starting overlapping requests. A click token
          also guards against a stale async response landing after a newer
          click has already started.
        </p>
      </section>
    </main>
  );
}