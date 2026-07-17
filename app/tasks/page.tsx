"use client";

import { useState } from "react";

export default function Tasks() {
  const [tasks, setTasks] = useState<string[]>([]);
  const [input, setInput] = useState("");

  function addTask() {
    if (input.trim() === "") return;

    setTasks([...tasks, input]);
    setInput("");
  }

  function deleteTask(index: number) {
    const newTasks = tasks.filter((_, i) => i !== index);
    setTasks(newTasks);
  }

  function toggleTask(index: number) {
    const newTasks = [...tasks];
    newTasks[index] = newTasks[index].startsWith("✔ ")
      ? newTasks[index].replace("✔ ", "")
      : "✔ " + newTasks[index];

    setTasks(newTasks);
  }

  return (
  <div className="max-w-md mx-auto mt-10 bg-white text-black shadow-lg rounded-xl p-6">
    <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">
  Task Manager
    </h1>

    <div className="flex gap-2 mb-4">
      <input
        className="border p-2 flex-1 rounded-md"
        type="text"
        placeholder="Add a task"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button
        className="bg-blue-500 text-white px-4 rounded-md hover:bg-blue-600"
        onClick={addTask}
      >
        Add
      </button>
    </div>

    <ul className="space-y-2">
      {tasks.map((task, index) => (
        <li
          key={index}
          className="flex justify-between items-center border p-2 rounded-md"
        >
          <span
            onClick={() => toggleTask(index)}
            className="cursor-pointer"
          >
            {task}
          </span>

          <button
            onClick={() => deleteTask(index)}
            className="text-red-500 hover:text-red-700"
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  </div>
);
}