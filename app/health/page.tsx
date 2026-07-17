"use client";

import { useEffect, useState } from "react";

export default function Health() {
  const [status, setStatus] = useState("Loading...");

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => setStatus(data.status));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-2">Health Check</h1>
      <p>Status: {status}</p>
    </div>
  );
}