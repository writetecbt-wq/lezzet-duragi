"use client";

import { useEffect } from "react";
import { useOrderStore, FirestoreOrder } from "@/store/order.store";
import { Clock, ChefHat, CheckCircle2, MessageSquareWarning } from "lucide-react";
import { formatTime, getOrderDuration } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function KitchenClient() {
  const { orders, listenToOrders, updateOrderStatus } = useOrderStore();

  useEffect(() => {
    const unsub = listenToOrders();
    return () => unsub();
  }, [listenToOrders]);

  // Sadece mutfağı ilgilendiren siparişler
  const kitchenOrders = orders.filter(
    (o) => o.status === "PENDING" || o.status === "PREPARING"
  );

  // Masalara göre grupla
  const tablesMap = new Map<number, FirestoreOrder[]>();
  kitchenOrders.forEach((order) => {
    const list = tablesMap.get(order.tableNumber) || [];
    list.push(order);
    tablesMap.set(order.tableNumber, list);
  });

  const activeTables = Array.from(tablesMap.entries()).sort((a, b) => a[0] - b[0]);

  if (activeTables.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-zinc-500">
        <ChefHat className="w-24 h-24 mb-6 opacity-20" />
        <h2 className="text-2xl font-bold">Mutfakta bekleyen sipariş yok</h2>
        <p className="text-zinc-600 mt-2">Şu anlık rahatsınız, harika iş çıkarıyorsunuz!</p>
      </div>
    );
  }

  return (
    <div className="h-full p-6 overflow-x-auto flex gap-6 snap-x snap-mandatory">
      {activeTables.map(([tableNum, tableOrders]) => (
        <div key={tableNum} className="flex-shrink-0 w-80 flex flex-col bg-[#1c1c22] border border-white/5 rounded-2xl overflow-hidden snap-start shadow-2xl">
          {/* Sütun Başlığı */}
          <div className="bg-white/5 border-b border-white/5 p-4 flex items-center justify-between">
            <h2 className="text-3xl font-black text-white">
              {tableNum === 0 ? "Paket Servis" : `Masa ${tableNum}`}
            </h2>
            <div className="text-sm font-bold text-zinc-400 bg-black/40 px-3 py-1 rounded-full">
              {tableOrders.length} Sipariş
            </div>
          </div>

          {/* Sipariş Listesi */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {tableOrders.map((order) => (
              <div
                key={order.id}
                className={cn(
                  "border rounded-xl p-4 flex flex-col shadow-lg transition-all",
                  order.status === "PENDING"
                    ? "bg-amber-500/10 border-amber-500/30"
                    : "bg-blue-500/10 border-blue-500/30",
                  order.source === "GETIR" && "border-l-4 border-l-[#5d3ebd] bg-[#5d3ebd]/5",
                  order.source === "YEMEKSEPETI" && "border-l-4 border-l-[#ea004b] bg-[#ea004b]/5",
                  order.source === "TRENDYOL" && "border-l-4 border-l-[#f27a1a] bg-[#f27a1a]/5",
                  order.source === "MIGROS" && "border-l-4 border-l-[#ff8300] bg-[#ff8300]/5" // Migros Yemek uses orange too
                )}
              >
                {/* Delivery Info */}
                {tableNum === 0 && order.source && order.source !== "DINE_IN" && (
                  <div className="flex items-center justify-between mb-3">
                    <span className={cn(
                      "text-xs font-black px-2 py-1 rounded-md text-white",
                      order.source === "GETIR" ? "bg-[#5d3ebd]" :
                      order.source === "YEMEKSEPETI" ? "bg-[#ea004b]" :
                      order.source === "TRENDYOL" ? "bg-[#f27a1a]" :
                      "bg-[#ff8300]"
                    )}>
                      {order.source}
                    </span>
                    <span className="text-xs font-bold text-zinc-400 truncate max-w-[120px]">
                      {order.customerInfo?.name}
                    </span>
                  </div>
                )}

                {/* Header */}
                <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-3">
                  <span className={cn(
                    "text-xs font-black uppercase px-2 py-1 rounded-md",
                    order.status === "PENDING" ? "bg-amber-500 text-amber-950" : "bg-blue-500 text-blue-950"
                  )}>
                    {order.status === "PENDING" ? "YENİ SİPARİŞ" : "HAZIRLANIYOR"}
                  </span>
                  <div className="flex items-center text-xs font-bold text-zinc-400 gap-1.5">
                    <Clock className="w-4 h-4" />
                    {getOrderDuration(order.createdAt)}
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-2 mb-4 flex-1">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-start text-sm">
                      <span className="font-black text-white mr-2.5 bg-white/10 px-1.5 rounded">{item.quantity}x</span>
                      <span className="text-zinc-300 font-semibold leading-tight pt-0.5">{item.name}</span>
                    </div>
                  ))}
                </div>

                {/* Notes */}
                {order.notes && (
                  <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-1.5 text-red-400 font-bold text-xs uppercase mb-1">
                      <MessageSquareWarning className="w-4 h-4" /> Sipariş Notu
                    </div>
                    <p className="text-red-100 text-sm font-semibold">{order.notes}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  {order.status === "PENDING" && tableNum !== 0 ? (
                    <div className="w-full py-3 rounded-xl font-bold text-sm bg-black/20 text-zinc-500 flex items-center justify-center border border-white/5">
                      Garson Onayı Bekleniyor...
                    </div>
                  ) : order.status === "PENDING" && tableNum === 0 ? (
                    <button
                      onClick={() => {
                        updateOrderStatus(order.id, "PREPARING");
                      }}
                      className="w-full py-3 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-amber-950 shadow-xl btn-press"
                    >
                      Hazırlamaya Başla
                    </button>
                  ) : (
                    <>
                      {tableNum !== 0 && (
                        <button
                          onClick={() => {
                            useOrderStore.getState().requestService(order.tableNumber, "WAITER");
                            alert("Garson çağrıldı!");
                          }}
                          className="flex-1 py-3 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 shadow-xl btn-press"
                        >
                          Garson
                        </button>
                      )}
                      <button
                        onClick={() => {
                          updateOrderStatus(order.id, tableNum === 0 ? "ON_THE_WAY" : "COMPLETED");
                        }}
                        className="flex-[2] py-3 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 text-blue-950 shadow-blue-900/20 shadow-xl btn-press"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        {tableNum === 0 ? "Kuryeye Teslim Et" : "Hazır (Çıkış)"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
