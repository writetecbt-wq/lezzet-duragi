"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { LogOut, ChefHat, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function GarsonLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, logout } = useAuthStore();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && (!isAuthenticated || user?.role !== "garson")) {
      router.replace("/login");
    }
  }, [isMounted, isAuthenticated, user, router]);

  if (!isMounted || !isAuthenticated || user?.role !== "garson") {
    return (
      <div className="min-h-dvh bg-[#0f0f12] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#0f0f12] text-white flex flex-col">
      <header className="border-b border-white/8 px-6 py-0 flex items-center justify-between bg-[#0f0f12]/80 backdrop-blur-xl sticky top-0 z-50">
        {/* Brand */}
        <div className="flex items-center gap-3 py-3 pr-6 border-r border-white/8 mr-4">
          <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center text-base shadow-lg shadow-green-900/40">
            <ChefHat className="w-4 h-4 text-white" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-bold text-white leading-tight">Lezzet Durağı</p>
            <p className="text-[10px] text-zinc-500 font-medium">Garson Paneli</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex items-center gap-1 flex-1">
          <span className="flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 border-green-500 text-white">
            <ChefHat className="w-4 h-4" />
            <span className="hidden sm:inline">Masa & Siparişler</span>
          </span>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-zinc-500 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-1.5">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span className="hidden md:inline">{user?.displayName}</span>
          </div>
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors py-1.5 px-2 rounded-lg hover:bg-white/5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-red-400 transition-colors py-1.5 px-2 rounded-lg hover:bg-red-500/10"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Çıkış</span>
          </button>
        </div>
      </header>
      <div className="flex-1 flex overflow-hidden">
        {children}
      </div>
    </div>
  );
}
