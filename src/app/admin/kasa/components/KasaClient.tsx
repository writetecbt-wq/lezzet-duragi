"use client";

import { useState } from "react";
import { useOrderStore } from "@/store/order.store";
import { formatPrice, formatTime } from "@/lib/mock-data";
import { Wallet, CreditCard, Banknote, History, CheckCircle2, SplitSquareHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { KasaBillModal } from "./KasaBillModal";

export function KasaClient() {
  const { orders, updateOrderStatus } = useOrderStore();
  
  // Tab: 'AÇIK' (Bekleyen ödemeler - COMPLETED) | 'GEÇMİŞ' (Alınmış ödemeler - PAID)
  const [activeTab, setActiveTab] = useState<"AÇIK" | "GEÇMİŞ">("AÇIK");
  const [splitPaymentTable, setSplitPaymentTable] = useState<number | null>(null);

  const pendingPayments = orders.filter(o => o.status === "COMPLETED" || o.status === "PENDING" || o.status === "PREPARING");
  const paidPayments = orders.filter(o => o.status === "PAID");

  const totalPending = pendingPayments.reduce((s, o) => s + o.totalAmount, 0);
  const totalPaid = paidPayments.reduce((s, o) => s + o.totalAmount, 0);

  const handlePayment = (orderId: string, method: "NAKİT" | "KREDİ KARTI") => {
    // In a real app we'd save the payment method to the order document
    // For now we just mark as PAID.
    updateOrderStatus(orderId, "PAID");
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#0f0f12] p-6 text-white space-y-6">
      
      <div>
        <h1 className="text-2xl font-bold mb-1">Kasa & Muhasebe</h1>
        <p className="text-sm text-zinc-400">Ödeme bekleyen masalar ve gün sonu ciro takibi.</p>
      </div>

      {/* ── Kasa Özet ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#16161b] border border-brand-500/30 rounded-2xl p-6 shadow-lg shadow-brand-500/10">
          <div className="flex items-center gap-3 mb-2 text-brand-400">
            <Wallet className="w-5 h-5" />
            <h3 className="font-semibold text-sm">Alınan Ödemeler (PAID)</h3>
          </div>
          <p className="text-3xl font-bold text-white">{formatPrice(totalPaid)}</p>
          <p className="text-xs text-zinc-500 mt-2">{paidPayments.length} Adisyon Tahsil Edildi</p>
        </div>

        <div className="bg-[#16161b] border border-amber-500/30 rounded-2xl p-6 shadow-lg shadow-amber-500/10">
          <div className="flex items-center gap-3 mb-2 text-amber-400">
            <History className="w-5 h-5" />
            <h3 className="font-semibold text-sm">Bekleyen Ödemeler (Açık Adisyon)</h3>
          </div>
          <p className="text-3xl font-bold text-white">{formatPrice(totalPending)}</p>
          <p className="text-xs text-zinc-500 mt-2">{pendingPayments.length} Adisyon Hesabı Bekliyor</p>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-2 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab("AÇIK")}
          className={cn(
            "px-6 py-2.5 rounded-xl text-sm font-semibold transition-all",
            activeTab === "AÇIK" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "text-zinc-500 hover:bg-white/5"
          )}
        >
          Açık Adisyonlar ({pendingPayments.length})
        </button>
        <button
          onClick={() => setActiveTab("GEÇMİŞ")}
          className={cn(
            "px-6 py-2.5 rounded-xl text-sm font-semibold transition-all",
            activeTab === "GEÇMİŞ" ? "bg-green-500/20 text-green-400 border border-green-500/30" : "text-zinc-500 hover:bg-white/5"
          )}
        >
          Tahsil Edilenler ({paidPayments.length})
        </button>
      </div>

      {/* ── List ── */}
      <div className="space-y-3 pb-10">
        {(activeTab === "AÇIK" ? pendingPayments : paidPayments).map((order) => (
          <div key={order.id} className="bg-[#16161b] border border-white/5 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-lg text-white">
                {order.tableNumber}
              </div>
              <div>
                <p className="font-semibold text-white">Masa {order.tableNumber}</p>
                <p className="text-xs text-zinc-400 mt-1">
                  Sipariş: {formatTime(order.createdAt)} • {order.items.length} ürün
                </p>
                {order.waiterName && (
                  <p className="text-xs text-brand-400 mt-0.5 font-medium">
                    👤 Garson: {order.waiterName.charAt(0).toUpperCase() + order.waiterName.slice(1)}
                  </p>
                )}
              </div>
            </div>

            <div className="text-left md:text-right">
              <p className="text-xl font-bold text-brand-400">{formatPrice(order.totalAmount)}</p>
            </div>

            {activeTab === "AÇIK" ? (
              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                <button
                  onClick={() => handlePayment(order.id, "NAKİT")}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl text-sm font-semibold transition-all"
                >
                  <Banknote className="w-4 h-4" />
                  Nakit
                </button>
                <button
                  onClick={() => handlePayment(order.id, "KREDİ KARTI")}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-xl text-sm font-semibold transition-all"
                >
                  <CreditCard className="w-4 h-4" />
                  Kredi Kartı
                </button>
                <button
                  onClick={() => setSplitPaymentTable(order.tableNumber)}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-xl text-sm font-semibold transition-all"
                >
                  <SplitSquareHorizontal className="w-4 h-4" />
                  Alman Usulü
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-sm font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                Ödendi
              </div>
            )}
          </div>
        ))}

        {(activeTab === "AÇIK" ? pendingPayments : paidPayments).length === 0 && (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
            <p className="text-zinc-500">Bu listede adisyon bulunmuyor.</p>
          </div>
        )}
      </div>

      {splitPaymentTable !== null && (
        <KasaBillModal 
          tableNumber={splitPaymentTable} 
          onClose={() => setSplitPaymentTable(null)} 
        />
      )}
    </div>
  );
}
