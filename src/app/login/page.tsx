"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, UserRole } from "@/store/auth.store";
import { Eye, EyeOff, ChefHat, ShieldCheck, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const router = useRouter();
  const { login, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // If already logged in, redirect
  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace(user.role === "admin" ? "/admin" : "/garson");
    }
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Small delay for UX
    await new Promise((r) => setTimeout(r, 400));

    const result = login(username, password);
    setIsLoading(false);

    if (result.success && result.role) {
      router.push(result.role === "admin" ? "/admin" : "/garson");
    } else {
      setError(result.error || "Giriş başarısız");
    }
  };


  return (
    <div className="min-h-dvh bg-[#0a0a0f] flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm animate-scale-in">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-brand-400 to-brand-600 rounded-2xl flex items-center justify-center text-3xl shadow-2xl shadow-brand-500/20 mb-5">
            🍽️
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Lezzet Durağı</h1>
          <p className="text-sm text-zinc-500 mt-1">Yönetim Paneli Girişi</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Kullanıcı Adı
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              autoComplete="username"
              className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Şifre
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl animate-scale-in">
              <p className="text-sm text-red-400 font-medium">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading || !username || !password}
            className={cn(
              "w-full flex items-center justify-center gap-2.5 py-4 rounded-xl font-bold text-sm transition-all active:scale-[0.98]",
              isLoading || !username || !password
                ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                : "bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40"
            )}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Giriş Yap
              </>
            )}
          </button>
        </form>

        {/* Hints */}
        <div className="mt-8 space-y-3">
          <p className="text-[10px] text-zinc-600 uppercase tracking-widest text-center font-semibold">
            Hesap Bilgileri
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/3 border border-white/5 rounded-xl p-3.5 text-center">
              <div className="w-8 h-8 mx-auto rounded-lg bg-blue-500/10 flex items-center justify-center mb-2">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-[11px] font-bold text-zinc-300">Kasa</p>
              <p className="text-[10px] text-zinc-600 mt-0.5">admin / kasa123</p>
            </div>
            <div className="bg-white/3 border border-white/5 rounded-xl p-3.5 text-center">
              <div className="w-8 h-8 mx-auto rounded-lg bg-green-500/10 flex items-center justify-center mb-2">
                <ChefHat className="w-4 h-4 text-green-400" />
              </div>
              <p className="text-[11px] font-bold text-zinc-300">Garson</p>
              <p className="text-[10px] text-zinc-600 mt-0.5">admin / garson123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
