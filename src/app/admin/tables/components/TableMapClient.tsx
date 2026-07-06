"use client";

import { useState } from "react";
import { useOrderStore } from "@/store/order.store";
import { cn } from "@/lib/utils";
import { HandPlatter, CreditCard, Clock, Utensils, AlertCircle } from "lucide-react";
import { formatPrice, timeAgo } from "@/lib/mock-data";

const TOTAL_TABLES = 10;

export function TableMapClient() {
  const { orders, serviceRequests, resolveServiceRequest } = useOrderStore();
  const [selectedTable, setSelectedTable] = useState<number | null>(null);

  // Generate table array 1..10
  const tables = Array.from({ length: TOTAL_TABLES }, (_, i) => i + 1);

  // Group data by table
  const getTableState = (tableNumber: number) => {
    const tableOrders = orders.filter((o) => o.tableNumber === tableNumber && o.status !== "COMPLETED" && o.status !== "CANCELLED");
    const activeRequests = serviceRequests.filter((r) => r.tableNumber === tableNumber && r.status === "PENDING");
    
    const isOccupied = tableOrders.length > 0;
    const hasRequest = activeRequests.length > 0;

    // Status colors
    let bgColor = "bg-green-500/10 border-green-500/30";
    let textColor = "text-green-500";
    let statusLabel = "Boş";

    if (hasRequest) {
      bgColor = "bg-red-500/15 border-red-500/50 animate-pulse-slow";
      textColor = "text-red-400";
      statusLabel = "Garson Bekliyor";
    } else if (isOccupied) {
      const isPreparing = tableOrders.some(o => o.status === "PREPARING");
      if (isPreparing) {
        bgColor = "bg-blue-500/10 border-blue-500/30";
        textColor = "text-blue-400";
        statusLabel = "Hazırlanıyor";
      } else {
        bgColor = "bg-amber-500/10 border-amber-500/30";
        textColor = "text-amber-400";
        statusLabel = "Sipariş Bekliyor";
      }
    }

    return { tableOrders, activeRequests, isOccupied, hasRequest, bgColor, textColor, statusLabel };
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white tracking-tight">Masa Haritası</h2>
        <p className="text-sm text-zinc-400 mt-1">Restoranın anlık doluluk ve servis durumu.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {tables.map((tableNum) => {
          const { tableOrders, activeRequests, hasRequest, bgColor, textColor, statusLabel } = getTableState(tableNum);
          
          return (
            <button
              key={tableNum}
              onClick={() => setSelectedTable(tableNum)}
              className={cn(
                "relative group flex flex-col items-center justify-center aspect-square rounded-3xl border transition-all hover:scale-[1.02]",
                bgColor,
                selectedTable === tableNum ? "ring-2 ring-brand-500 shadow-[0_0_20px_rgba(249,115,22,0.2)]" : ""
              )}
            >
              {/* Badges for active requests */}
              {hasRequest && (
                <div className="absolute -top-3 -right-3 flex gap-1">
                  {activeRequests.map(req => (
                    <div key={req.id} className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg animate-bounce">
                      {req.type === "WAITER" ? <HandPlatter className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                    </div>
                  ))}
                </div>
              )}

              <div className="text-4xl font-black text-white/90 mb-2">
                {tableNum}
              </div>
              <div className={cn("text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-black/40", textColor)}>
                {statusLabel}
              </div>
              
              {tableOrders.length > 0 && (
                <div className="mt-3 text-[11px] text-zinc-400 flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5" />
                  {tableOrders.length} aktif sipariş
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Side Panel for Selected Table Details */}
      {selectedTable && (
        <TableDetailsPanel
          tableNumber={selectedTable}
          onClose={() => setSelectedTable(null)}
          state={getTableState(selectedTable)}
          onResolveRequest={resolveServiceRequest}
        />
      )}
    </div>
  );
}

function TableDetailsPanel({
  tableNumber,
  onClose,
  state,
  onResolveRequest
}: {
  tableNumber: number;
  onClose: () => void;
  state: ReturnType<typeof TableMapClient.prototype.getTableState>;
  onResolveRequest: (id: string) => void;
}) {
  const { tableOrders, activeRequests, isOccupied } = state;

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-[#16161b] border-l border-white/10 shadow-2xl z-50 flex flex-col animate-slide-in-right">
      <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-black/20">
        <div>
          <h3 className="text-xl font-bold text-white">Masa {tableNumber}</h3>
          <p className={cn("text-sm font-semibold", state.textColor)}>{state.statusLabel}</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-zinc-400">
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Active Requests Section */}
        {activeRequests.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" /> Servis İstekleri
            </h4>
            {activeRequests.map(req => (
              <div key={req.id} className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-400">
                    {req.type === "WAITER" ? <HandPlatter className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">
                      {req.type === "WAITER" ? "Garson Çağrısı" : "Hesap İstendi"}
                    </p>
                    <p className="text-xs text-red-400/80">{timeAgo(req.createdAt)}</p>
                  </div>
                </div>
                <button
                  onClick={() => onResolveRequest(req.id)}
                  className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-colors"
                >
                  Tamamla
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Active Orders Section */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Aktif Siparişler</h4>
          {!isOccupied ? (
            <p className="text-sm text-zinc-400 bg-white/5 p-4 rounded-xl border border-white/5">
              Bu masada aktif sipariş bulunmuyor.
            </p>
          ) : (
            tableOrders.map(order => (
              <div key={order.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-3">
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-1 rounded-md",
                    order.status === "PENDING" ? "bg-amber-500/20 text-amber-400" : "bg-blue-500/20 text-blue-400"
                  )}>
                    {order.status === "PENDING" ? "YENİ SİPARİŞ" : "HAZIRLANIYOR"}
                  </span>
                  <div className="flex items-center text-xs text-zinc-400 font-medium">
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    {timeAgo(order.createdAt)}
                  </div>
                </div>
                <div className="space-y-2 mb-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-zinc-300"><span className="text-brand-500 font-bold mr-1">{item.quantity}x</span>{item.name}</span>
                      <span className="text-zinc-500">{formatPrice(item.unitPrice * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-white/5">
                  <span className="text-xs text-zinc-500 font-medium">Toplam</span>
                  <span className="font-bold text-brand-400">{formatPrice(order.totalAmount)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
