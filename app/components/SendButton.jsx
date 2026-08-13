// app/components/SendButton.jsx
"use client";

import { useEffect, useRef, useState } from "react";

/**
 * SendButton — a button that communicates its own lifecycle.
 *
 * States: idle -> loading -> success | error -> idle
 * (hover/focus are handled natively via CSS :hover / :focus-visible,
 * not JS state — they don't need to interrupt the lifecycle.)
 *
 * Props:
 * - onSend: async function to call when clicked. Must resolve (success)
 *   or reject (error). If omitted, a fake call is simulated internally.
 * - label / loadingLabel / retryLabel: text per state.
 */
export default function SendButton({
  onSend,
  label = "Send message",
  loadingLabel = "Sending…",
  retryLabel = "Try again",
}) {
  const [state, setState] = useState("idle"); // idle | loading | success | error
  const revertTimer = useRef(null);
  const clickToken = useRef(0);

  useEffect(() => {
    return () => clearTimeout(revertTimer.current);
  }, []);

  async function handleClick() {
    // Interruptibility guard: ignore clicks while already loading.
    if (state === "loading") return;

    clearTimeout(revertTimer.current);
    const myToken = ++clickToken.current; // guards against stale async results
    setState("loading");

    try {
      if (onSend) {
        await onSend();
      } else {
        // Fake async call: 900-1500ms delay, 20% failure rate.
        await new Promise((resolve, reject) => {
          const delay = 900 + Math.random() * 600;
          setTimeout(() => {
            Math.random() < 0.2 ? reject(new Error("simulated failure")) : resolve();
          }, delay);
        });
      }
      if (clickToken.current !== myToken) return; // a newer click superseded this one
      setState("success");
      // Success auto-reverts after a pause — it's good news, no need to linger.
      revertTimer.current = setTimeout(() => setState("idle"), 1400);
    } catch {
      if (clickToken.current !== myToken) return;
      setState("error");
      // Error does NOT auto-revert — the user should consciously retry,
      // not have the failure silently disappear.
    }
  }

  const isLoading = state === "loading";
  const isDisabled = isLoading;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isDisabled}
      aria-live="polite"
      aria-busy={isLoading}
      className={`send-btn send-btn--${state}`}
    >
      <span className="send-btn__content">
        {state === "idle" && <span className="send-btn__label">{label}</span>}
        {state === "loading" && (
          <>
            <span className="send-btn__spinner" aria-hidden="true" />
            <span className="send-btn__label">{loadingLabel}</span>
          </>
        )}
        {state === "success" && (
          <>
            <svg
              className="send-btn__check"
              viewBox="0 0 24 24"
              width="18"
              height="18"
              aria-hidden="true"
            >
              <path
                d="M5 13l4 4L19 7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="send-btn__label">Sent</span>
          </>
        )}
        {state === "error" && <span className="send-btn__label">{retryLabel}</span>}
      </span>

      <style jsx>{`
        .send-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 160px;
          height: 44px;
          padding: 0 20px;
          border-radius: 9999px;
          border: none;
          font-size: 0.9rem;
          font-weight: 600;
          color: white;
          background: #6c5ce7; /* primary */
          cursor: pointer;
          overflow: hidden;
          transition: background-color 220ms ease, transform 150ms ease,
            box-shadow 180ms ease;
        }

        .send-btn:hover:not(:disabled) {
          background: #7c6cf0;
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(108, 92, 231, 0.28);
        }

        .send-btn:active:not(:disabled) {
          transform: translateY(0) scale(0.98);
          transition-duration: 100ms;
        }

        .send-btn:focus-visible {
          outline: 3px solid #ffc145;
          outline-offset: 3px;
        }

        .send-btn:disabled {
          cursor: not-allowed;
        }

        .send-btn--loading {
          background: #5b4bd1;
        }

        .send-btn--success {
          background: #16a34a;
        }

        .send-btn--error {
          background: #dc2626;
          animation: send-btn-shake 380ms ease;
        }

        .send-btn__content {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .send-btn__label {
          animation: send-btn-fade-in 200ms ease both;
        }

        .send-btn__spinner {
          width: 15px;
          height: 15px;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.35);
          border-top-color: white;
          animation: send-btn-spin 700ms linear infinite,
            send-btn-fade-in 150ms ease both;
        }

        .send-btn__check {
          animation: send-btn-check-in 320ms cubic-bezier(0.34, 1.56, 0.64, 1)
            both;
        }

        @keyframes send-btn-fade-in {
          from {
            opacity: 0;
            transform: translateY(2px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes send-btn-check-in {
          from {
            opacity: 0;
            transform: scale(0.4);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes send-btn-spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes send-btn-shake {
          10%,
          90% {
            transform: translateX(-1px);
          }
          20%,
          80% {
            transform: translateX(2px);
          }
          30%,
          50%,
          70% {
            transform: translateX(-4px);
          }
          40%,
          60% {
            transform: translateX(4px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .send-btn,
          .send-btn__label,
          .send-btn__spinner,
          .send-btn__check {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
          .send-btn--error {
            animation: none;
          }
          .send-btn:hover:not(:disabled) {
            transform: none;
          }
        }
      `}</style>
    </button>
  );
}