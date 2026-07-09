"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { AdminNav } from "./components/AdminNav";
import { LogOut } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, logout } = useAuthStore();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && (!isAuthenticated || user?.role !== "admin")) {
      router.replace("/login");
    }
  }, [isMounted, isAuthenticated, user, router]);

  if (!isMounted || !isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-dvh bg-[#0f0f12] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#0f0f12] text-white flex flex-col">
      <AdminNav
        onLogout={() => {
          logout();
          router.push("/login");
        }}
      />
      <div className="flex-1 flex overflow-hidden">
        {children}
      </div>
    </div>
  );
}
