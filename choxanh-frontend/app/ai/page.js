"use client";

import { useState } from "react";
import { apiPost } from "../../lib/ai"; //  CHUẨN – KHÔNG LỖI


export default function AiChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    setMessages([...messages, { role: "user", content: input }]);

    try {
      const res = await apiPost("/ai/chat", { message: input });

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.answer },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Lỗi AI server" },
      ]);
    }

    setInput("");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>AI Chợ Xanh</h2>

      <div>
        {messages.map((m, i) => (
          <p key={i}>
            <b>{m.role}:</b> {m.content}
          </p>
        ))}
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Nhập câu hỏi..."
      />
      <button onClick={sendMessage}>Gửi</button>
    </div>
  );
}
