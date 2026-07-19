"use client";

import { useEffect, useState, useRef } from "react";
import { useOrderStore, FirestoreOrder } from "@/store/order.store";
import { Clock, ChefHat, CheckCircle2, MessageSquareWarning, Coffee, Utensils, CheckSquare, Square, BellRing, BellOff } from "lucide-react";
import { cn } from "@/lib/utils";

type Station = "ALL" | "KITCHEN" | "BAR";

// ─── Live timer hook ───────────────────────────────────────────────────────────
function useElapsedMinutes(createdAt: Date): number {
  const [elapsed, setElapsed] = useState(
    Math.floor((Date.now() - createdAt.getTime()) / 60000)
  );
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - createdAt.getTime()) / 60000));
    }, 10000); // update every 10s is enough for minute precision
    return () => clearInterval(interval);
  }, [createdAt]);
  return elapsed;
}

function formatDuration(minutes: number): string {
  if (minutes < 1) return "< 1 dk";
  if (minutes < 60) return `${minutes} dk`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h} sa ${m} dk` : `${h} sa`;
}

// ─── Sound ────────────────────────────────────────────────────────────────────
const playDingSound = () => {
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.8, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 1.2);
  } catch (e) {
    console.error("Audio play failed", e);
  }
};

// ─── Order Card Component ─────────────────────────────────────────────────────
function OrderCard({ order }: { order: FirestoreOrder }) {
  const { updateOrderStatus } = useOrderStore();
  // Local optimistic state for item completion — avoids relying on item.id
  const [completedIndexes, setCompletedIndexes] = useState<number[]>(() =>
    order.items.map((item, idx) => (item.status === "COMPLETED" ? idx : -1)).filter(i => i !== -1)
  );
  const [isSaving, setIsSaving] = useState(false);

  // Sync with Firestore when order updates
  useEffect(() => {
    setCompletedIndexes(
      order.items.map((item, idx) => (item.status === "COMPLETED" ? idx : -1)).filter(i => i !== -1)
    );
  }, [order.items]);

  const toggleItem = async (idx: number) => {
    const newCompleted = completedIndexes.includes(idx)
      ? completedIndexes.filter(i => i !== idx)
      : [...completedIndexes, idx];

    setCompletedIndexes(newCompleted); // optimistic update immediately
    setIsSaving(true);

    try {
      // Build the new items array
      const newItems = order.items.map((item, i) => ({
        ...item,
        status: (newCompleted.includes(i) ? "COMPLETED" : "PENDING") as "COMPLETED" | "PENDING",
      }));

      const allDone = newItems.every(i => i.status === "COMPLETED");
      const newStatus = allDone ? "COMPLETED" : "PREPARING";

      const { db } = await import("@/lib/firebase/config");
      const { doc, updateDoc, serverTimestamp } = await import("firebase/firestore");

      const updateData: Record<string, unknown> = { items: newItems, status: newStatus };
      if (allDone) updateData.completedAt = serverTimestamp();

      await updateDoc(doc(db, "orders", order.id), updateData);
    } catch (err) {
      console.error("Toggle failed", err);
      // revert
      setCompletedIndexes(
        order.items.map((item, idx) => (item.status === "COMPLETED" ? idx : -1)).filter(i => i !== -1)
      );
    } finally {
      setIsSaving(false);
    }
  };

  const allItemsCompleted = completedIndexes.length === order.items.length && order.items.length > 0;
  const elapsedMin = useElapsedMinutes(order.createdAt);

  return (
    <div className={cn(
      "border-2 rounded-2xl p-5 flex flex-col shadow-lg transition-all relative overflow-hidden",
      allItemsCompleted
        ? "bg-green-500/10 border-green-500/30"
        : order.status === "PENDING"
          ? "bg-amber-500/10 border-amber-500/50"
          : "bg-blue-500/10 border-blue-500/50"
    )}>
      {allItemsCompleted && (
        <div className="absolute inset-0 bg-green-500/5 pointer-events-none flex items-center justify-center">
          <CheckCircle2 className="w-24 h-24 text-green-500/20" />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-3 mb-4 border-b border-white/10 pb-4 relative z-10">
        <div className="flex items-center justify-between">
          <span className={cn(
            "text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-md",
            allItemsCompleted ? "bg-green-500 text-green-950"
            : order.status === "PENDING" ? "bg-amber-500 text-amber-950" : "bg-blue-500 text-blue-950"
          )}>
            {allItemsCompleted ? "HAZIR" : order.status === "PENDING" ? "YENİ SİPARİŞ" : "HAZIRLANIYOR"}
          </span>
          {/* Live timer */}
          <div className={cn(
            "flex items-center text-sm font-black px-3 py-1.5 rounded-md gap-1.5",
            allItemsCompleted ? "text-green-400 bg-green-500/10" : "text-amber-400 bg-amber-500/10"
          )}>
            <Clock className="w-4 h-4" />
            {allItemsCompleted
              ? `${formatDuration(elapsedMin)}'da hazırlandı`
              : `${formatDuration(elapsedMin)}'dır bekliyor`}
          </div>
        </div>
        {order.waiterName && (
          <div className="flex items-center text-sm font-bold text-zinc-300 bg-white/5 w-fit px-3 py-1.5 rounded-lg">
            <span className="text-zinc-500 mr-2">Garson:</span>
            {order.waiterName}
          </div>
        )}
      </div>

      {/* Items — indexed-based toggle, no reliance on item.id */}
      <div className="space-y-3 mb-5 flex-1 relative z-10">
        {order.items.map((item, idx) => {
          const isCompleted = completedIndexes.includes(idx);
          return (
            <div
              key={idx}
              onClick={() => !isSaving && toggleItem(idx)}
              className={cn(
                "flex items-center text-lg p-3 rounded-xl cursor-pointer transition-all border-2 select-none",
                isCompleted
                  ? "opacity-50 line-through bg-black/20 border-transparent"
                  : "bg-black/20 border-white/5 hover:border-white/25 hover:bg-white/5 active:scale-[0.98]",
                isSaving && "pointer-events-none opacity-70"
              )}
            >
              <div className="mr-4 shrink-0">
                {isCompleted
                  ? <CheckSquare className="w-7 h-7 text-green-500" />
                  : <Square className="w-7 h-7 text-zinc-400" />}
              </div>
              <span className="font-black text-white mr-3 text-base bg-white/10 px-2 py-0.5 rounded shrink-0">
                {item.quantity}x
              </span>
              <span className="text-zinc-100 font-bold leading-tight">{item.name}</span>
            </div>
          );
        })}
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-2.5 mb-3 relative z-10">
          <div className="flex items-center gap-1.5 text-red-400 font-bold text-[10px] uppercase mb-1">
            <MessageSquareWarning className="w-3 h-3" /> Not
          </div>
          <p className="text-red-100 text-xs font-semibold">{order.notes}</p>
        </div>
      )}

      {/* Start preparing button */}
      {!allItemsCompleted && order.status === "PENDING" && (
        <button
          onClick={() => updateOrderStatus(order.id, "PREPARING")}
          className="w-full py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-amber-950 shadow-lg relative z-10 active:scale-95"
        >
          Hazırlamaya Başla
        </button>
      )}
    </div>
  );
}

// ─── Main KitchenClient ────────────────────────────────────────────────────────
export function KitchenClient() {
  const { orders, listenToOrders } = useOrderStore();
  const [activeStation, setActiveStation] = useState<Station>("ALL");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const prevPendingCountRef = useRef(0);

  useEffect(() => {
    const unsub = listenToOrders();
    return () => unsub();
  }, [listenToOrders]);

  const rawKitchenOrders = orders.filter(
    (o) => o.status === "PENDING" || o.status === "PREPARING"
  );

  // Sound alert on new pending orders
  useEffect(() => {
    const count = rawKitchenOrders.filter(o => o.status === "PENDING").length;
    if (count > prevPendingCountRef.current && soundEnabled) playDingSound();
    prevPendingCountRef.current = count;
  }, [rawKitchenOrders, soundEnabled]);

  const filteredOrders = rawKitchenOrders.map(order => {
    const filteredItems = order.items.filter(item => {
      if (activeStation === "ALL") return true;
      const isDrink = item.categoryId === "cat_icecek_001";
      return activeStation === "BAR" ? isDrink : !isDrink;
    });
    return { ...order, items: filteredItems };
  }).filter(o => o.items.length > 0);

  // Group by table
  const tablesMap = new Map<number, FirestoreOrder[]>();
  filteredOrders.forEach((order) => {
    const list = tablesMap.get(order.tableNumber) || [];
    list.push(order as FirestoreOrder);
    tablesMap.set(order.tableNumber, list);
  });
  const activeTables = Array.from(tablesMap.entries()).sort((a, b) => a[0] - b[0]);

  return (
    <div className="h-full flex flex-col bg-transparent">
      {/* ── Station Filter Bar ── */}
      <div className="shrink-0 p-6 border-b border-white/10 bg-[#16161b] flex items-center justify-between shadow-md z-10 relative">
        <div className="flex gap-4 mx-auto">
          {([
            { id: "ALL", label: "Tüm İstasyonlar", icon: null, active: "bg-white text-black" },
            { id: "KITCHEN", label: "Sıcak Mutfak & Tatlı", icon: <Utensils className="w-5 h-5" />, active: "bg-amber-500 text-amber-950" },
            { id: "BAR", label: "Bar (İçecek)", icon: <Coffee className="w-5 h-5" />, active: "bg-blue-500 text-blue-950" },
          ] as const).map(s => (
            <button
              key={s.id}
              onClick={() => setActiveStation(s.id as Station)}
              className={cn(
                "px-7 py-3.5 rounded-2xl font-black text-base transition-all flex items-center gap-2.5",
                activeStation === s.id ? s.active : "bg-white/5 text-zinc-400 hover:bg-white/10"
              )}
            >
              {s.icon}{s.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setSoundEnabled(v => !v)}
          className={cn(
            "absolute right-6 p-3.5 rounded-full transition-all",
            soundEnabled ? "bg-amber-500/20 text-amber-500" : "bg-white/5 text-zinc-500"
          )}
          title={soundEnabled ? "Sesi Kapat" : "Sesi Aç"}
        >
          {soundEnabled ? <BellRing className="w-6 h-6" /> : <BellOff className="w-6 h-6" />}
        </button>
      </div>

      {/* ── Order Grid ── */}
      {activeTables.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-zinc-500">
          <ChefHat className="w-32 h-32 mb-8 opacity-20" />
          <h2 className="text-3xl font-black text-zinc-400">Bekleyen sipariş yok</h2>
          <p className="text-zinc-500 mt-3 text-lg">Seçili istasyon için sipariş bulunmuyor. Harika iş!</p>
        </div>
      ) : (
        <div className="flex-1 p-8 overflow-y-auto flex flex-wrap gap-8 items-start content-start">
          {activeTables.map(([tableNum, tableOrders]) => (
            <div key={tableNum} className="w-[400px] flex flex-col bg-[#1c1c22] border border-white/5 rounded-3xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
              <div className="bg-white/5 border-b border-white/5 p-5 flex items-center justify-between">
                <h2 className="text-3xl font-black text-white tracking-tight">
                  {tableNum === 0 ? "Paket Servis" : `Masa ${tableNum}`}
                </h2>
                <div className="text-sm font-bold text-zinc-300 bg-black/50 px-3 py-1.5 rounded-lg border border-white/5">
                  {tableOrders.length} Sipariş
                </div>
              </div>
              <div className="p-5 space-y-5">
                {tableOrders.map(order => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
