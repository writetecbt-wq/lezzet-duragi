"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/mock-data";
import { FirestoreOrder } from "@/store/order.store";
import {
  Clock,
  ChefHat,
  CheckCircle2,
  Utensils,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";

type CustomerOrderWidgetProps = {
  tableNumber: number;
  orders: FirestoreOrder[];
};

export function CustomerOrderWidget({ tableNumber, orders }: CustomerOrderWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Sadece masaya ait ve henüz iptal/ödendi olmayan aktif siparişler
  const activeOrders = orders.filter(
    (o) => o.tableNumber === tableNumber && o.status !== "CANCELLED" && o.status !== "PAID"
  );

  if (activeOrders.length === 0) return null;

  // Toplam ödenecek tutar
  const totalAmount = activeOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Durum hesaplaması
  const hasPending = activeOrders.some(o => o.status === "PENDING");
  const hasPreparing = activeOrders.some(o => o.status === "PREPARING");
  const allCompleted = activeOrders.every(o => o.status === "COMPLETED");

  let statusIcon = <Clock className="w-5 h-5 text-amber-500" />;
  let statusText = "Siparişiniz Alındı";
  let statusColor = "bg-amber-50 border-amber-200 text-amber-700";
  let activeWaiter: string | undefined;

  if (allCompleted) {
    statusIcon = <CheckCircle2 className="w-5 h-5 text-green-500" />;
    statusText = "Siparişiniz Masanızda";
    statusColor = "bg-green-50 border-green-200 text-green-700";
  } else if (hasPreparing || (!hasPending && activeOrders.length > 0)) {
    statusIcon = <ChefHat className="w-5 h-5 text-blue-500" />;
    statusText = "Mutfakta Hazırlanıyor";
    statusColor = "bg-blue-50 border-blue-200 text-blue-700";
    activeWaiter = activeOrders.find(o => o.waiterName)?.waiterName;
  }

  // Bütün siparişlerdeki ürünleri tek bir listede toplayalım
  const allItems = activeOrders.flatMap(o => o.items);

  return (
    <div className="fixed bottom-24 right-4 left-4 md:left-auto md:right-6 md:w-80 bg-white shadow-2xl rounded-2xl border border-zinc-100 p-3 md:p-4 z-40 animate-slide-up transition-all duration-300">
      
      {activeWaiter && (
        <div className="flex items-center gap-2 mb-3 bg-blue-50 border border-blue-100 p-2 rounded-xl text-blue-800 animate-fade-in">
          <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center font-bold text-blue-600 text-xs shrink-0 overflow-hidden shadow-sm">
            <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${activeWaiter}&backgroundColor=transparent`} alt={activeWaiter} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold leading-tight">{activeWaiter}</p>
            <p className="text-[10px] text-blue-600/80">sizinle ilgileniyor</p>
          </div>
        </div>
      )}

      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left"
      >
        <div className={cn("flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-xl border transition-colors", isExpanded ? "mb-3" : "mb-0", statusColor)}>
          <div className="bg-white p-1.5 md:p-2 rounded-full shadow-sm flex-shrink-0">
            {statusIcon}
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm leading-tight">{statusText}</p>
            <p className="text-[10px] opacity-80 uppercase tracking-wider font-semibold">Durum</p>
          </div>
          <div className="text-current opacity-70">
            {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </div>
        </div>
        
        {!isExpanded && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-500 flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5" /> Aktif Sipariş
              </span>
              <span className="font-bold text-zinc-900">{activeOrders.length} Adet</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-500">Toplam Tutar</span>
              <span className="font-bold text-brand-500 text-sm">{formatPrice(totalAmount)}</span>
            </div>
          </div>
        )}
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-zinc-100 max-h-60 overflow-y-auto pr-1">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Sipariş İçeriği</h4>
          <div className="space-y-2.5 mb-4">
            {allItems.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm">
                <span className="text-zinc-700 flex-1 pr-2 truncate">
                  <span className="font-bold text-zinc-900 mr-1.5">{item.quantity}x</span>
                  {item.name}
                </span>
                <span className="font-medium text-zinc-900 shrink-0">
                  {formatPrice(item.unitPrice * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center text-sm pt-3 border-t border-zinc-100">
            <span className="text-zinc-500 font-medium">Toplam</span>
            <span className="font-black text-brand-500 text-lg">{formatPrice(totalAmount)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
