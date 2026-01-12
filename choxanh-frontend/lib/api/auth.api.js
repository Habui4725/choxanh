const API_URL = "http://127.0.0.1:8000/auth";

/* ĐĂNG KÝ */
export async function registerUser(data) {
  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();

  if (!res.ok) {
    // ✅ Xử lý đúng lỗi FastAPI
    const message =
      typeof result.detail === "string"
        ? result.detail
        : Array.isArray(result.detail)
        ? result.detail[0]
        : "Đăng ký thất bại";

    throw new Error(message);
  }

  return result;
}

/* ĐĂNG NHẬP */
export async function loginUser(data) {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();

  if (!res.ok) {
    const message =
      typeof result.detail === "string"
        ? result.detail
        : "Đăng nhập thất bại";

    throw new Error(message);
  }

  return result;
}
