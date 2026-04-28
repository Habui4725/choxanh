"use client";

import { useState } from "react";

const API_BASE = "http://127.0.0.1:8000";

export default function AiChatWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { role: "ai", text: "Chào bạn 👋 Bạn muốn nấu món gì hôm nay?" }
  ]);
  const [loading, setLoading] = useState(false);

  function extractIngredients(text) {
    return text
      .toLowerCase()
      .replace("mình có", "")
      .replace("toi co", "")
      .replace("tôi có", "")
      .replace("thì nấu gì", "")
      .replace("thi nau gi", "")
      .split(/[,\svà]+/)
      .map((x) => x.trim())
      .filter(Boolean);
  }

  async function sendMessage(e) {
    e.preventDefault();
    if (!message.trim()) return;

    const userMsg = message;
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setMessage("");
    setLoading(true);

    try {
      const lower = userMsg.toLowerCase();

      if (
        lower.includes("mình có") ||
        lower.includes("tôi có") ||
        lower.includes("toi co")
      ) {
        const ingredients = extractIngredients(userMsg);

        const res = await fetch(`${API_BASE}/api/ai/suggest-by-ingredients`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ingredients }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.detail || "Lỗi AI");
        }

        let reply = "✅ Bạn có thể nấu các món sau:\n\n";

        data.suggestions.forEach((item) => {
          reply += `• ${item.dish}\n`;
          if (item.missing_ingredients?.length) {
            reply += `   Thiếu: ${item.missing_ingredients.join(", ")}\n`;
          }
        });

        setMessages((prev) => [...prev, { role: "ai", text: reply }]);
      } else {
        // case 2: user nhập tên món
        const res = await fetch(`${API_BASE}/api/ai/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userMsg }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.detail || "Lỗi AI");
        }

        let reply = `✅ Món: ${data.dish}\n\nNguyên liệu:\n`;

        data.ingredients.forEach((item) => {
          if (item.matched_product) {
            reply += `- ${item.matched_product.name} (${item.matched_product.price}đ)\n`;
          } else {
            reply += `- ${item.ingredient} (không có trong shop)\n`;
          }
        });
        if (data.estimated_total) {
         reply += `\n💰 Tổng tiền dự kiến: ${data.estimated_total}đ`;
        }
         
        if (data.answer) {
         reply += `\n\n Cách nấu:\n${data.answer}`;
        }

        if (data.suggestions?.length) {
         reply += `\n\n Gợi ý thêm:\n`;
         data.suggestions.forEach((s) => {
         reply += `- ${s}\n`;
         });
        }

        if (data.cheaper_options?.length) {
         reply += `\n💸 Món rẻ hơn:\n`;
         data.cheaper_options.forEach((c) => {
         reply += `- ${c}\n`;
         });
        }

        setMessages((prev) => [...prev, { role: "ai", text: reply }]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "❌ Không tìm thấy món phù hợp." }
      ]);
    }

    setLoading(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed",
          right: 20,
          bottom: 20,
          background: "#0aa63a",
          color: "white",
          border: "none",
          borderRadius: "50px",
          padding: "12px 18px",
          fontWeight: "bold",
          cursor: "pointer",
          zIndex: 9999
        }}
      >
        💬 Chat AI
      </button>

      {open && (
        <div
          style={{
            position: "fixed",
            right: 20,
            bottom: 80,
            width: 350,
            height: 500,
            background: "white",
            borderRadius: 15,
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 9999
          }}
        >
          <div
            style={{
              background: "#0aa63a",
              color: "white",
              padding: 10,
              fontWeight: "bold"
            }}
          >
            Trợ lý nấu ăn AI
          </div>

          <div style={{ flex: 1, padding: 10, overflowY: "auto" }}>
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  marginBottom: 10,
                  textAlign: m.role === "user" ? "right" : "left"
                }}
              >
                <div
                  style={{
                    display: "inline-block",
                    padding: "8px 12px",
                    borderRadius: 12,
                    background: m.role === "user" ? "#0aa63a" : "#f1f1f1",
                    color: m.role === "user" ? "white" : "black",
                    whiteSpace: "pre-wrap"
                  }}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && <div>AI đang suy nghĩ...</div>}
          </div>

          <form onSubmit={sendMessage} style={{ display: "flex", padding: 10, gap: 5 }}>
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Nhập món bạn muốn nấu..."
              style={{
                flex: 1,
                padding: 8,
                borderRadius: 10,
                border: "1px solid #ddd"
              }}
            />
            <button
              type="submit"
              style={{
                padding: "8px 12px",
                background: "#0aa63a",
                color: "white",
                border: "none",
                borderRadius: 10
              }}
            >
              Gửi
            </button>
          </form>
        </div>
      )}
    </>
  );
}