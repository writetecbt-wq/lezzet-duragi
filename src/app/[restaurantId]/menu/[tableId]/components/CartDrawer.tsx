"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Minus, Plus, Trash2, ShoppingCart, ChevronRight, MessageSquare } from "lucide-react";
import { useCartStore } from "@/store/cart.store";
import { useOrderStore } from "@/store/order.store";
import { formatPrice } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type CartDrawerProps = {
  tableId: string;
  restaurantId: string;
};

export function CartDrawer({ tableId, restaurantId }: CartDrawerProps) {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const {
    items,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
    clearCart,
    totalItems,
    totalPrice,
  } = useCartStore();

  const itemCount = isMounted ? totalItems() : 0;
  const total = isMounted ? totalPrice() : 0;
  const serviceFee = Math.round(total * 0.05);
  const grandTotal = total + serviceFee;

  const displayItems = isMounted ? items : [];

  const handleSubmitOrder = useCallback(async () => {
    if (displayItems.length === 0) return;
    setIsSubmitting(true);

    // Map cart items to order items
    const orderItems = items.map((item) => ({
      productId: item.productId,
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.price,
    }));

    try {
      // Save to store (syncs with admin panel)
      const orderId = await useOrderStore.getState().placeOrder(
        Number(tableId),
        orderItems,
        grandTotal,
        notes.trim() || undefined
      );

      // Simulate API call delay for UX
      await new Promise((r) => setTimeout(r, 1200));

      clearCart();
      closeCart();

      // Navigate to confirmation with the orderId
      router.push(
        `/order-confirmed?id=${orderId}&table=${tableId}&restaurant=${restaurantId}&amount=${grandTotal}`
      );
    } catch (error: any) {
      console.error("Order error", error);
      alert("Sipariş gönderilemedi: " + (error?.message || "Bilinmeyen hata"));
    } finally {
      setIsSubmitting(false);
    }
  }, [items, clearCart, closeCart, router, tableId, restaurantId, grandTotal, notes]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-50 animate-fade-in"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl animate-slide-up max-h-[90dvh] flex flex-col"
        role="dialog"
        aria-label="Sepet"
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-zinc-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-100">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">Sepetim</h2>
            <p className="text-xs text-zinc-500">
              {itemCount} ürün · Masa {tableId}
            </p>
          </div>
          <button
            id="cart-close-btn"
            onClick={closeCart}
            className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 transition-colors"
          >
            <X className="w-4 h-4 text-zinc-600" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center text-3xl mb-3">
                🛒
              </div>
              <p className="text-zinc-500 font-medium text-sm">Sepetiniz boş</p>
              <p className="text-zinc-400 text-xs mt-1">
                Menüden ürün ekleyerek başlayın
              </p>
            </div>
          ) : (
            <>
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center gap-3 bg-zinc-50 rounded-2xl p-3 animate-fade-in"
                >
                  {/* Image placeholder */}
                  <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-xl flex-shrink-0">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      "🍽️"
                    )}
                  </div>

                  {/* Name & Price */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-zinc-900 line-clamp-1">
                      {item.name}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {formatPrice(item.price)} / adet
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-1.5">
                    <button
                      id={`cart-dec-${item.productId}`}
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="w-7 h-7 rounded-lg bg-white shadow-sm border border-zinc-200 flex items-center justify-center text-zinc-600 btn-press"
                    >
                      {item.quantity === 1 ? (
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      ) : (
                        <Minus className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <span className="w-6 text-center text-sm font-bold text-zinc-900">
                      {item.quantity}
                    </span>
                    <button
                      id={`cart-inc-${item.productId}`}
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center text-white btn-press"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Item Total */}
                  <span className="text-sm font-bold text-zinc-900 w-14 text-right">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}

              {/* Notes Toggle */}
              <button
                id="notes-toggle-btn"
                onClick={() => setShowNotes((v) => !v)}
                className="flex items-center gap-2 w-full p-3 rounded-xl border border-dashed border-zinc-300 text-zinc-500 text-sm hover:border-brand-300 hover:text-brand-600 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                {showNotes ? "Notu gizle" : "Not ekle (opsiyonel)"}
              </button>

              {showNotes && (
                <textarea
                  id="order-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Özel isteklerinizi yazın... (Az pişmiş, az tuzlu vb.)"
                  rows={3}
                  maxLength={300}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-zinc-200 bg-zinc-50 resize-none focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent placeholder:text-zinc-400"
                />
              )}
            </>
          )}
        </div>

        {/* Summary & CTA */}
        {items.length > 0 && (
          <div className="px-5 pb-8 pt-3 border-t border-zinc-100 space-y-3">
            {/* Price Breakdown */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm text-zinc-500">
                <span>Ara toplam</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-sm text-zinc-500">
                <span>Servis ücreti (%5)</span>
                <span>{formatPrice(serviceFee)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-zinc-900 pt-1 border-t border-zinc-100">
                <span>Toplam</span>
                <span className="text-brand-600">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="submit-order-btn"
              onClick={handleSubmitOrder}
              disabled={isSubmitting}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-white transition-all btn-press shadow-lg shadow-orange-200",
                isSubmitting
                  ? "bg-zinc-400 cursor-not-allowed"
                  : "bg-brand-500 hover:bg-brand-600"
              )}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sipariş Veriliyor...
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  Siparişi Onayla
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
