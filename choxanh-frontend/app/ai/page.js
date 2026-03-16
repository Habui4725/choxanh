"use client";

import { useMemo, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";

function formatVND(n) {
  try {
    return new Intl.NumberFormat("vi-VN").format(n) + " đ";
  } catch {
    return `${n} đ`;
  }
}

export default function AiPage() {
  const [dishQuery, setDishQuery] = useState("");
  const [topK, setTopK] = useState(3);

  const [loading, setLoading] = useState(false);
  const [reindexing, setReindexing] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const canSubmit = useMemo(() => dishQuery.trim().length > 0 && !loading, [dishQuery, loading]);

  async function handleReindex() {
    setError("");
    setReindexing(true);
    try {
      const res = await fetch(`${API_BASE}/api/ai/reindex`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.detail || "Reindex thất bại");
      alert(`Reindex xong ✅ (${data.count || 0} recipes)`);
    } catch (e) {
      setError(e?.message || "Có lỗi khi reindex");
    } finally {
      setReindexing(false);
    }
  }

  async function handleSuggest(e) {
    e.preventDefault();
    if (!canSubmit) return;

    setError("");
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`${API_BASE}/api/ai/suggest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dish_query: dishQuery.trim(), top_k: Number(topK) || 3 }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.detail || "Gợi ý thất bại");

      setResult(data);
    } catch (e) {
      setError(e?.message || "Có lỗi khi gọi AI");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 20 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Trợ lý nấu ăn AI (RAG)</h1>
      <p style={{ marginTop: 0, color: "#555" }}>
        Nhập món bạn muốn nấu → hệ thống gợi ý nguyên liệu phù hợp từ dữ liệu trong “Chợ Xanh”.
      </p>

      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
        <button
          onClick={handleReindex}
          disabled={reindexing}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #ddd",
            background: reindexing ? "#f2f2f2" : "#fff",
            cursor: reindexing ? "not-allowed" : "pointer",
            fontWeight: 700,
          }}
        >
          {reindexing ? "Đang reindex..." : "Reindex dữ liệu recipes"}
        </button>
        <span style={{ color: "#777", fontSize: 13 }}>
          (Chạy 1 lần sau khi thêm/sửa recipes)
        </span>
      </div>

      <form onSubmit={handleSuggest} style={{ display: "grid", gap: 10 }}>
        <div style={{ display: "grid", gap: 6 }}>
          <label style={{ fontWeight: 700 }}>Bạn muốn nấu món gì?</label>
          <input
            value={dishQuery}
            onChange={(e) => setDishQuery(e.target.value)}
            placeholder="VD: trứng chiên cà chua, canh bí đỏ, cá hồi áp chảo..."
            style={{
              padding: "12px 14px",
              borderRadius: 12,
              border: "1px solid #ddd",
              outline: "none",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <label style={{ fontWeight: 700 }}>Top K</label>
          <select
            value={topK}
            onChange={(e) => setTopK(e.target.value)}
            style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd" }}
          >
            <option value={1}>1</option>
            <option value={3}>3</option>
            <option value={5}>5</option>
          </select>

          <button
            type="submit"
            disabled={!canSubmit}
            style={{
              marginLeft: "auto",
              padding: "12px 16px",
              borderRadius: 12,
              border: "none",
              background: canSubmit ? "#0aa63a" : "#cfe9d7",
              color: "#fff",
              fontWeight: 800,
              cursor: canSubmit ? "pointer" : "not-allowed",
            }}
          >
            {loading ? "Đang gợi ý..." : "Gợi ý nguyên liệu"}
          </button>
        </div>
      </form>

      {error && (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            borderRadius: 12,
            background: "#ffecec",
            border: "1px solid #ffb3b3",
            color: "#b30000",
            fontWeight: 700,
          }}
        >
          {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: 18 }}>
          <div
            style={{
              padding: 14,
              borderRadius: 14,
              border: "1px solid #e6e6e6",
              background: "#fafafa",
            }}
          >
            <div style={{ display: "flex", gap: 10, alignItems: "baseline", flexWrap: "wrap" }}>
              <h2 style={{ margin: 0, fontSize: 20 }}>
                Món gợi ý: <span style={{ color: "#0aa63a" }}>{result.dish}</span>
              </h2>
              <span style={{ color: "#777" }}>
                (độ khớp: {Number(result.confidence || 0).toFixed(4)})
              </span>
            </div>
          </div>

          <h3 style={{ marginTop: 16, marginBottom: 10 }}>Nguyên liệu cần mua</h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 12,
            }}
          >
            {(result.ingredients || []).map((it, idx) => {
              const p = it.matched_product;
              return (
                <div
                  key={idx}
                  style={{
                    border: "1px solid #eee",
                    borderRadius: 14,
                    overflow: "hidden",
                    background: "#fff",
                  }}
                >
                  <div style={{ padding: 12 }}>
                    <div style={{ fontWeight: 800, marginBottom: 8 }}>
                      {it.ingredient || "Nguyên liệu"}
                    </div>

                    {p ? (
                      <>
                        <div style={{ display: "flex", gap: 10 }}>
                          <img
                            src={p.image}
                            alt={p.name}
                            style={{
                              width: 80,
                              height: 80,
                              objectFit: "cover",
                              borderRadius: 12,
                              border: "1px solid #eee",
                            }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 800 }}>{p.name}</div>
                            <div style={{ color: "#0aa63a", fontWeight: 900, marginTop: 4 }}>
                              {formatVND(p.price || 0)}
                            </div>
                            <div style={{ fontSize: 12, color: "#777", marginTop: 4 }}>
                              {p.origin ? `Xuất xứ: ${p.origin}` : ""}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                          {/* Link xem chi tiết - tuỳ bạn dùng _id hay id */}
                          <a
                            href={`/products/${p._id}`}
                            style={{
                              flex: 1,
                              textAlign: "center",
                              padding: "10px 12px",
                              borderRadius: 12,
                              border: "1px solid #ddd",
                              textDecoration: "none",
                              fontWeight: 800,
                              color: "#111",
                              background: "#fff",
                            }}
                          >
                            Xem chi tiết
                          </a>

                          {/* Nút thêm giỏ hàng: bạn có thể chỉnh endpoint theo backend cart của bạn */}
                          <button
                            type="button"
                            onClick={() => alert("Bạn nối API add-to-cart ở đây ✅")}
                            style={{
                              flex: 1,
                              padding: "10px 12px",
                              borderRadius: 12,
                              border: "none",
                              background: "#ff7a00",
                              color: "#fff",
                              fontWeight: 900,
                              cursor: "pointer",
                            }}
                          >
                            Thêm giỏ
                          </button>
                        </div>
                      </>
                    ) : (
                      <div style={{ color: "#b30000", fontWeight: 700 }}>
                        Không tìm thấy sản phẩm phù hợp trong kho hàng.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}