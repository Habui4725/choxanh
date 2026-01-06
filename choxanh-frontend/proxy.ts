import { NextResponse } from "next/server";

export function proxy(req: Request) {
  const url = new URL(req.url);
  const pathname = url.pathname;

  // 👉 CHỈ bảo vệ ADMIN (hiện tại)
  const protectedRoutes = ["/admin"];

  // ⚠️ Hiện tại FE chưa set cookie user → user luôn null
  // nên tạm thời KHÔNG chặn cart / products
  const cookieHeader = req.headers.get("cookie") || "";
  const userMatch = cookieHeader.match(/user=([^;]+)/);
  const user = userMatch?.[1];

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // ❌ Chưa đăng nhập mà vào ADMIN → đá login
  if (!user && isProtected) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}
