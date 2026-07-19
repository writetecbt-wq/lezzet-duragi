"use client";

import { useState } from "react";
import { X, Receipt, CreditCard, Banknote, CheckCircle2, SplitSquareHorizontal } from "lucide-react";
import { useOrderStore } from "@/store/order.store";
import { formatPrice } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type KasaBillModalProps = {
  tableNumber: number;
  onClose: () => void;
};

export function KasaBillModal({ tableNumber, onClose }: KasaBillModalProps) {
  const { orders, payForTableItems } = useOrderStore();
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"NAKİT" | "KREDİ KARTI" | null>(null);

  // Active orders for this table
  const activeOrders = orders.filter(
    (o) => o.tableNumber === tableNumber && o.status !== "PAID" && o.status !== "CANCELLED"
  );

  const waiterNames = Array.from(new Set(activeOrders.map(o => o.waiterName).filter(Boolean)));

  // Flatten all items from active orders and aggregate by productId
  const aggregatedItems: Record<string, { productId: string; name: string; quantity: number; unitPrice: number; }> = {};
  
  activeOrders.forEach(o => {
    o.items.forEach(item => {
      if (!aggregatedItems[item.productId]) {
        aggregatedItems[item.productId] = {
          productId: item.productId,
          name: item.name,
          quantity: 0,
          unitPrice: item.unitPrice,
        };
      }
      aggregatedItems[item.productId].quantity += item.quantity;
    });
  });

  const allItems = Object.values(aggregatedItems);

  const handleIncrement = (productId: string, maxQty: number) => {
    setSelectedQuantities(prev => {
      const current = prev[productId] || 0;
      if (current >= maxQty) return prev;
      return { ...prev, [productId]: current + 1 };
    });
  };

  const handleDecrement = (productId: string) => {
    setSelectedQuantities(prev => {
      const current = prev[productId] || 0;
      if (current <= 0) return prev;
      const next = { ...prev, [productId]: current - 1 };
      if (next[productId] === 0) delete next[productId];
      return next;
    });
  };

  const selectedTotal = Object.entries(selectedQuantities).reduce((acc, [productId, qty]) => {
    const item = allItems.find(i => i.productId === productId);
    return acc + (qty * (item?.unitPrice || 0));
  }, 0);

  const grandTotal = allItems.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  const hasSelection = Object.values(selectedQuantities).some(qty => qty > 0);

  const handlePay = async () => {
    if (!hasSelection || !paymentMethod) return;
    setIsProcessing(true);
    try {
      const itemsToPay = Object.entries(selectedQuantities)
        .filter(([, qty]) => qty > 0)
        .map(([productId, quantity]) => {
          const item = allItems.find(i => i.productId === productId)!;
          return {
            productId,
            quantity,
            unitPrice: item.unitPrice,
            name: item.name
          };
        });

      await payForTableItems(tableNumber, itemsToPay);
      setIsPaid(true);
      setTimeout(() => onClose(), 2500);
    } catch (error) {
      console.error("Payment failed", error);
      setIsProcessing(false);
    }
  };

  if (activeOrders.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <div className="bg-[#1c1c22] border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center">
          <Receipt className="w-14 h-14 text-zinc-600 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Adisyon Bulunamadı</h2>
          <p className="text-zinc-400 mb-6 text-sm">Bu masada ödenmemiş sipariş yok.</p>
          <button onClick={onClose} className="w-full bg-brand-500 text-white py-3 rounded-xl font-bold hover:bg-brand-600 transition-colors">
            Kapat
          </button>
        </div>
      </div>
    );
  }

  if (isPaid) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <div className="bg-[#1c1c22] border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/30">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Ödeme Alındı!</h2>
          <p className="text-zinc-400 text-sm">
            {formatPrice(selectedTotal)} tahsil edildi. ({paymentMethod})
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm">
      <div className="bg-[#16161b] border-l border-white/10 h-full w-full max-w-md flex flex-col shadow-2xl">

        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <SplitSquareHorizontal className="w-6 h-6 text-amber-400" />
            <div>
              <h2 className="text-xl font-bold text-white">Masa {tableNumber} Hesabı</h2>
              <p className="text-sm text-zinc-400 mt-0.5">
                {waiterNames.length > 0 ? `Garson: ${waiterNames.join(", ")}` : "Alman Usulü Kısmi Tahsilat"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        {/* Summary */}
        <div className="px-6 py-4 bg-white/[0.02] border-b border-white/5 shrink-0 flex justify-between items-center">
          <span className="text-sm text-zinc-400">Toplam Adisyon:</span>
          <span className="font-bold text-white">{formatPrice(grandTotal)}</span>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Ödenecek adetleri seçin</p>
          {allItems.map((item) => {
            const selectedQty = selectedQuantities[item.productId] || 0;
            const isSelected = selectedQty > 0;
            
            return (
              <div
                key={item.productId}
                className={cn(
                  "flex flex-col p-4 rounded-2xl border-2 transition-all",
                  isSelected
                    ? "border-amber-500 bg-amber-500/10"
                    : "border-white/10 bg-white/5"
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-white">{item.name}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">Sipariş: {item.quantity} Adet (Birim: {formatPrice(item.unitPrice)})</p>
                  </div>
                  <div className="flex items-center gap-3 bg-black/20 border border-white/10 rounded-full p-1">
                    <button 
                      onClick={() => handleDecrement(item.productId)}
                      disabled={selectedQty === 0}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-colors text-white font-bold text-lg"
                    >
                      -
                    </button>
                    <span className="w-4 text-center font-bold text-white">{selectedQty}</span>
                    <button 
                      onClick={() => handleIncrement(item.productId, item.quantity)}
                      disabled={selectedQty === item.quantity}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-amber-500 text-amber-950 hover:bg-amber-400 disabled:opacity-30 transition-colors font-bold text-lg"
                    >
                      +
                    </button>
                  </div>
                </div>
                {isSelected && (
                  <div className="mt-3 pt-3 border-t border-amber-500/20 flex justify-between items-center">
                    <span className="text-xs font-bold text-amber-500">Tahsil Edilecek:</span>
                    <span className="text-sm font-black text-amber-400">{formatPrice(selectedQty * item.unitPrice)}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Payment Method & Footer */}
        <div className="p-6 border-t border-white/10 bg-[#16161b] shrink-0 space-y-4">
          {/* Method selector */}
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Ödeme Yöntemi</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPaymentMethod("NAKİT")}
                className={cn(
                  "flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm border-2 transition-all",
                  paymentMethod === "NAKİT"
                    ? "bg-emerald-500 border-emerald-500 text-emerald-950"
                    : "border-white/10 text-zinc-400 hover:border-emerald-500/50 hover:text-emerald-400"
                )}
              >
                <Banknote className="w-4 h-4" /> Nakit
              </button>
              <button
                onClick={() => setPaymentMethod("KREDİ KARTI")}
                className={cn(
                  "flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm border-2 transition-all",
                  paymentMethod === "KREDİ KARTI"
                    ? "bg-blue-500 border-blue-500 text-blue-950"
                    : "border-white/10 text-zinc-400 hover:border-blue-500/50 hover:text-blue-400"
                )}
              >
                <CreditCard className="w-4 h-4" /> Kredi Kartı
              </button>
            </div>
          </div>

          {/* Total & Pay */}
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs text-zinc-500">Seçilen Toplam</p>
              <p className="text-3xl font-black text-amber-400">{formatPrice(selectedTotal)}</p>
            </div>
            <button
              onClick={handlePay}
              disabled={!hasSelection || !paymentMethod || isProcessing}
              className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-amber-950 font-black rounded-2xl text-base transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20"
            >
              {isProcessing ? "İşleniyor..." : "Tahsil Et"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
