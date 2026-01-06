"use client";
import Header from "./Header";
import { usePathname } from "next/navigation";

export default function HeaderWrapper() {
  const pathname = usePathname();
  const hideHeaderRoutes = ["/auth/login", "/auth/register"];
  const showHeader = !hideHeaderRoutes.includes(pathname);

  return showHeader ? <Header /> : null;
}