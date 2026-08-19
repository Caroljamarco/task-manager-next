// app/components/Chat.tsx
"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef, useState } from "react";
import ToolCard from "./ToolCard";

const EXAMPLE_GOALS = [
  "Plan a weekend trip",
  "Launch a small side project",
  "Organize a home office",
];

export default function Chat() {
  const [input, setInput] = useState("");
  const [isRetrying, setIsRetrying] = useState(false);
  const { messages, sendMessage, status, stop, error, regenerate } =
    useChat();

  const isStreaming = status === "streaming" || status === "submitted";
  const isWaitingForFirstToken = status === "submitted";

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [isPinnedToBottom, setIsPinnedToBottom] = useState(true);
  const [showJumpToLatest, setShowJumpToLatest] = useState(false);

  function handleScroll() {
    const node = scrollRef.current;
    if (!node) return;
    const distanceFromBottom =
      node.scrollHeight - node.scrollTop - node.clientHeight;
    const nearBottom = distanceFromBottom < 80;
    setIsPinnedToBottom(nearBottom);
    setShowJumpToLatest(!nearBottom);
  }

  useEffect(() => {
    if (!isPinnedToBottom) return;
    const node = scrollRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [messages, isPinnedToBottom]);

  function jumpToLatest() {
    const node = scrollRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
    setIsPinnedToBottom(true);
    setShowJumpToLatest(false);
  }

  function handleSend(text?: string) {
    const value = (text ?? input).trim();
    if (!value) return;
    sendMessage({ text: value });
    setInput("");
    setIsPinnedToBottom(true);
  }

  async function handleRetry() {
    if (isRetrying) return; // guard against double-click
    setIsRetrying(true);
    try {
      await regenerate();
    } finally {
      setIsRetrying(false);
    }
  }

  return (
    <div className="chat">
      <div className="chat-scroll" ref={scrollRef} onScroll={handleScroll}>
        {messages.length === 0 && (
          <div className="chat-empty-state">
            <p className="chat-empty-title">No conversation yet</p>
            <p className="chat-empty-subtitle">
              Describe a goal and get it broken into tasks. Try one:
            </p>
            <div className="chat-empty-examples">
              {EXAMPLE_GOALS.map((goal) => (
                <button
                  key={goal}
                  type="button"
                  className="chat-empty-example"
                  onClick={() => handleSend(goal)}
                >
                  {goal}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={
              message.role === "user"
                ? "chat-message chat-message-user"
                : "chat-message chat-message-assistant"
            }
            aria-live={message.role === "assistant" ? "polite" : undefined}
          >
            {message.parts.map((part, i) => {
              if (part.type === "text") {
                return <span key={i}>{part.text}</span>;
              }
              if (part.type.startsWith("tool-")) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return <ToolCard key={i} part={part as any} />;
              }
              return null;
            })}
          </div>
        ))}

        {isWaitingForFirstToken && (
          <div
            className="chat-message chat-message-assistant chat-thinking"
            aria-live="polite"
          >
            <span className="chat-thinking-dot" />
            <span className="chat-thinking-dot" />
            <span className="chat-thinking-dot" />
          </div>
        )}

        {error && (
          <div className="chat-error-banner" role="alert">
            <p className="chat-error-text">
              Something went wrong generating a response. Nothing was lost —
              only the last message will be retried.
            </p>
            <button
              type="button"
              className="chat-retry-button"
              onClick={handleRetry}
              disabled={isRetrying}
            >
              {isRetrying ? "Retrying…" : "Retry"}
            </button>
          </div>
        )}
      </div>

      {showJumpToLatest && (
        <button
          type="button"
          className="chat-jump-to-latest"
          onClick={jumpToLatest}
        >
          Jump to latest ↓
        </button>
      )}

      <form
        className="chat-input-row"
        onSubmit={(event) => {
          event.preventDefault();
          handleSend();
        }}
      >
        <textarea
          className="chat-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          aria-label="Type a message"
          placeholder="Type a message..."
          rows={1}
          disabled={isStreaming && !error}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              handleSend();
            }
          }}
        />

        {isStreaming ? (
          <button type="button" className="chat-stop-button" onClick={stop}>
            Stop
          </button>
        ) : (
          <button
            type="submit"
            className="chat-send-button"
            disabled={input.trim().length === 0}
          >
            Send
          </button>
        )}
      </form>
    </div>
  );
}