"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { CheckCircle, ChefHat, Clock, Home } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { formatPrice } from "@/lib/mock-data";
import { db } from "@/lib/firebase/config";
import { doc, onSnapshot } from "firebase/firestore";

// Confetti particle
type Particle = {
  id: number;
  x: number;
  color: string;
  delay: number;
  duration: number;
  size: number;
};

const COLORS = ["#f97316", "#fb923c", "#fbbf24", "#34d399", "#60a5fa", "#a78bfa"];

export default function OrderConfirmedPage() {
  const searchParams = useSearchParams();
  const tableId = searchParams.get("table") ?? "?";
  const restaurantId = searchParams.get("restaurant") ?? "rest_demo_001";
  const amount = Number(searchParams.get("amount") ?? 0);

  const orderId = searchParams.get("id");

  const [step, setStep] = useState(0); // 0=confirmed, 1=preparing, 2=ready
  const [particles, setParticles] = useState<Particle[]>([]);
  const hasGenerated = useRef(false);

  // Generate confetti
  useEffect(() => {
    if (hasGenerated.current) return;
    hasGenerated.current = true;
    const p: Particle[] = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 1.5,
      duration: 1.5 + Math.random() * 1,
      size: 6 + Math.random() * 8,
    }));
    setParticles(p);
  }, []);

  // Real-time status progression from Firebase
  useEffect(() => {
    if (!orderId) return;

    const unsubscribe = onSnapshot(doc(db, "orders", orderId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.status === "PENDING") setStep(0);
        else if (data.status === "PREPARING") setStep(1);
        else if (data.status === "COMPLETED") setStep(2);
      }
    });

    return () => unsubscribe();
  }, [orderId]);

  const steps = [
    { label: "Sipariş Alındı", icon: CheckCircle, done: step >= 0 },
    { label: "Hazırlanıyor", icon: ChefHat, done: step >= 1 },
    { label: "Servis Hazır", icon: Clock, done: step >= 2 },
  ];

  return (
    <div className="min-h-dvh bg-gradient-to-br from-orange-50 via-amber-50 to-white flex flex-col items-center justify-center px-5 overflow-hidden relative">
      {/* Confetti */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute top-0 rounded-sm pointer-events-none"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animationName: "confetti-fall",
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            animationFillMode: "forwards",
            animationTimingFunction: "linear",
          }}
        />
      ))}

      <div className="max-w-sm w-full space-y-6 animate-scale-in">
        {/* Success Icon */}
        <div className="flex flex-col items-center text-center">
          <div className="relative w-24 h-24 mb-4">
            <div className="w-24 h-24 bg-gradient-to-br from-brand-400 to-brand-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-orange-200">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            {/* Ping rings */}
            <div className="absolute inset-0 rounded-3xl border-4 border-brand-300 animate-ping opacity-40" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900">Siparişiniz Alındı!</h1>
          <p className="text-zinc-500 text-sm mt-1 leading-relaxed">
            Masa {tableId} için siparişiniz hazırlanmaya başlandı.
            Lütfen masanızda bekleyin.
          </p>
        </div>

        {/* Amount */}
        <div className="bg-white rounded-2xl border border-zinc-100 p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs text-zinc-500 font-medium">Sipariş Tutarı</p>
            <p className="text-2xl font-bold text-zinc-900">{formatPrice(amount)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-zinc-500 font-medium">Sipariş No</p>
            <p className="text-sm font-bold text-brand-600">#
              {Math.floor(Math.random() * 9000 + 1000)}
            </p>
          </div>
        </div>

        {/* Status Stepper */}
        <div className="bg-white rounded-2xl border border-zinc-100 p-4 shadow-sm">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">
            Sipariş Durumu
          </p>
          <div className="space-y-4">
            {steps.map((s, i) => {
              const Icon = s.icon;
              const isActive = step === i;
              const isDone = step > i;

              return (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                      isDone
                        ? "bg-green-500 text-white"
                        : isActive
                        ? "bg-brand-500 text-white shadow-md shadow-orange-200"
                        : "bg-zinc-100 text-zinc-400"
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Icon
                        className={`w-4 h-4 ${isActive ? "animate-pulse" : ""}`}
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <p
                      className={`text-sm font-semibold transition-colors duration-300 ${
                        isDone
                          ? "text-green-600"
                          : isActive
                          ? "text-zinc-900"
                          : "text-zinc-400"
                      }`}
                    >
                      {s.label}
                    </p>
                    {isActive && (
                      <div className="mt-1 flex gap-0.5">
                        {[0, 1, 2].map((dot) => (
                          <div
                            key={dot}
                            className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce"
                            style={{ animationDelay: `${dot * 0.15}s` }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  {isDone && (
                    <span className="text-xs text-green-600 font-medium">
                      ✓ Tamam
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Back to Menu */}
        <Link
          href={`/${restaurantId}/menu/${tableId}`}
          id="back-to-menu-link"
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl border-2 border-zinc-200 text-zinc-700 font-semibold text-sm hover:border-brand-300 hover:text-brand-600 transition-all btn-press"
        >
          <Home className="w-4 h-4" />
          Menüye Dön
        </Link>
      </div>
    </div>
  );
}
