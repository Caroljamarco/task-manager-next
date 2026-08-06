// app/components/Chat.tsx
"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef, useState } from "react";
import ToolCard from "./ToolCard";

export default function Chat() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, stop } = useChat();

  const isStreaming = status === "streaming" || status === "submitted";

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

  const isWaitingForFirstToken = status === "submitted";

  function handleSend() {
    const text = input.trim();
    if (!text) return;
    sendMessage({ text });
    setInput("");
    setIsPinnedToBottom(true);
  }

  return (
    <div className="chat">
      <div className="chat-scroll" ref={scrollRef} onScroll={handleScroll}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={
              message.role === "user"
                ? "chat-message chat-message-user"
                : "chat-message chat-message-assistant"
            }
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
          placeholder="Type a message..."
          rows={1}
          disabled={isStreaming}
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