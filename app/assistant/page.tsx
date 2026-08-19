// app/assistant/page.tsx
import Chat from "@/app/components/Chat";
import "@/app/components/chat.css";

export const metadata = {
  title: "AI Task Assistant | Task Manager",
  description: "Describe a goal and get it broken into tasks, one at a time.",
};

export default function AssistantPage() {
  return (
    <main>
      <h1>AI Task Assistant</h1>
      <p>Describe a goal and get it broken into tasks, one at a time.</p>
      <Chat />
    </main>
  );
}