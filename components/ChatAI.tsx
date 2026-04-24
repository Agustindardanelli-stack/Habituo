"use client";

import { useState } from "react";

export default function ChatAI() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message) return;

    const userMessage = { role: "user", text: message };
    setMessages((prev) => [...prev, userMessage]);

    setLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ message }),
    });

    const data = await res.json();

    const aiMessage = { role: "ai", text: data.response };

    setMessages((prev) => [...prev, aiMessage]);
    setMessage("");
    setLoading(false);
  };

  return (
    <div className="p-4">
      <div className="h-80 overflow-y-auto mb-4 border rounded p-2">
        {messages.map((msg, i) => (
          <div key={i}>
            <b>{msg.role}:</b> {msg.text}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="border p-2 w-full"
        />
        <button onClick={sendMessage} disabled={loading}>
          {loading ? "..." : "Enviar"}
        </button>
      </div>
    </div>
  );
}