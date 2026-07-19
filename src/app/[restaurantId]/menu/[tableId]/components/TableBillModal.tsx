"use client";

import { useState } from "react";
import { X, Receipt, CreditCard, Utensils } from "lucide-react";
import { useOrderStore } from "@/store/order.store";
import { formatPrice } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type TableBillModalProps = {
  tableNumber: number;
  onClose: () => void;
};

export function TableBillModal({ tableNumber, onClose }: TableBillModalProps) {
  const { orders, payForTableItems } = useOrderStore();
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  // Get active orders for this table
  const activeOrders = orders.filter(
    (o) => o.tableNumber === tableNumber && o.status !== "PAID" && o.status !== "CANCELLED"
  );

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

  const handleSelectAll = () => {
    const isAllSelected = allItems.every(i => selectedQuantities[i.productId] === i.quantity);
    if (isAllSelected) {
      setSelectedQuantities({});
    } else {
      const all: Record<string, number> = {};
      allItems.forEach(i => all[i.productId] = i.quantity);
      setSelectedQuantities(all);
    }
  };

  const selectedTotal = Object.entries(selectedQuantities).reduce((acc, [productId, qty]) => {
    const item = allItems.find(i => i.productId === productId);
    return acc + (qty * (item?.unitPrice || 0));
  }, 0);

  const grandTotal = allItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  const isAllSelected = allItems.every(i => selectedQuantities[i.productId] === i.quantity);
  const hasSelection = Object.values(selectedQuantities).some(qty => qty > 0);

  const handlePay = async () => {
    if (!hasSelection) return;
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
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Payment failed", error);
      setIsProcessing(false);
    }
  };

  if (activeOrders.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)" }}>
        <div className="bg-surface rounded-3xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center animate-slide-up">
          <Receipt className="w-16 h-16 text-primary mb-4" />
          <h2 className="text-xl font-bold text-on-surface mb-2">Adisyon Bulunamadı</h2>
          <p className="text-on-surface-variant mb-6 text-sm">Masaya ait ödenmemiş bir siparişiniz bulunmuyor.</p>
          <button onClick={onClose} className="w-full bg-primary text-white py-3 rounded-xl font-bold">
            Geri Dön
          </button>
        </div>
      </div>
    );
  }

  if (isPaid) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)" }}>
        <div className="bg-surface rounded-3xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center animate-slide-up">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6">
            <CreditCard className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-black text-on-surface mb-2">Ödeme Başarılı!</h2>
          <p className="text-on-surface-variant mb-6 text-sm">Seçtiğiniz ürünlerin ödemesi alındı. Afiyet olsun!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-end justify-end sm:items-center sm:justify-center bg-black/60 backdrop-blur-sm sm:p-4 animate-in fade-in duration-200">
      <div className="bg-surface w-full sm:w-[450px] sm:rounded-3xl rounded-t-3xl h-[85vh] sm:h-auto sm:max-h-[85vh] flex flex-col shadow-2xl animate-slide-up">
        
        {/* Header */}
        <div className="p-6 border-b border-surface-container-high/50 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-bold text-on-surface">Masamın Hesabı</h2>
            <p className="text-sm text-on-surface-variant mt-1">Ödemek istediğiniz adetleri seçin (Alman Usulü)</p>
          </div>
          <button onClick={onClose} className="p-2 bg-surface-container-low rounded-full hover:bg-surface-container-high transition-colors">
            <X className="w-5 h-5 text-on-surface" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <button 
              onClick={handleSelectAll}
              className="text-sm font-bold text-primary hover:underline"
            >
              {isAllSelected ? "Seçimi Temizle" : "Tümünü Seç"}
            </button>
            <div className="text-sm font-medium text-on-surface-variant">
              Masa Toplamı: <span className="font-bold text-on-surface">{formatPrice(grandTotal)}</span>
            </div>
          </div>

          <div className="space-y-3">
            {allItems.map((item) => {
              const selectedQty = selectedQuantities[item.productId] || 0;
              const isSelected = selectedQty > 0;
              
              return (
                <div 
                  key={item.productId}
                  className={cn(
                    "flex flex-col p-4 rounded-2xl border-2 transition-all",
                    isSelected 
                      ? "border-primary bg-primary/5" 
                      : "border-surface-container-high bg-surface-container-low"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-on-surface">{item.name}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">Sipariş: {item.quantity} Adet (Birim: {formatPrice(item.unitPrice)})</p>
                    </div>
                    <div className="flex items-center gap-3 bg-surface border border-surface-container-high rounded-full p-1">
                      <button 
                        onClick={() => handleDecrement(item.productId)}
                        disabled={selectedQty === 0}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container-low hover:bg-surface-container-high disabled:opacity-30 transition-colors text-on-surface font-bold text-lg"
                      >
                        -
                      </button>
                      <span className="w-4 text-center font-bold text-on-surface">{selectedQty}</span>
                      <button 
                        onClick={() => handleIncrement(item.productId, item.quantity)}
                        disabled={selectedQty === item.quantity}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-primary text-white hover:bg-primary/90 disabled:opacity-30 transition-colors font-bold text-lg"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="mt-3 pt-3 border-t border-primary/10 flex justify-between items-center">
                      <span className="text-xs font-bold text-primary">Seçili Ödenecek:</span>
                      <span className="text-sm font-black text-primary">{formatPrice(selectedQty * item.unitPrice)}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-surface-container-high/50 bg-surface shrink-0">
          <div className="flex justify-between items-end mb-4">
            <span className="text-sm font-medium text-on-surface-variant">Sizin Ödeyeceğiniz</span>
            <span className="text-3xl font-black text-primary">{formatPrice(selectedTotal)}</span>
          </div>
          <button 
            onClick={handlePay}
            disabled={!hasSelection || isProcessing}
            className="w-full h-14 bg-primary text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
          >
            {isProcessing ? "İşleniyor..." : "Seçilenleri Öde"}
          </button>
        </div>
      </div>
    </div>
  );
}
