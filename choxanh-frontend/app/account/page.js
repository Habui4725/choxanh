"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

export default function AccountIndexPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace("/account/profile");
    } else {
      router.replace("/auth/login");
    }
  }, [user, router]);

  return null;
}
