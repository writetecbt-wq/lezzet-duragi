"use client";

import { useState } from "react";
import { ShoppingCart, Minus, Plus, Star, Clock } from "lucide-react";
import { useCartStore } from "@/store/cart.store";
import { useProductStore } from "@/store/product.store";
import { formatPrice, MOCK_CATEGORIES } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type MenuClientProps = {
  tableNumber: string;
};

export function MenuClient({ tableNumber }: MenuClientProps) {
  const [activeCategory, setActiveCategory] = useState(MOCK_CATEGORIES[0].id);
  const { addItem, items, updateQuantity, openCart, totalItems, totalPrice } = useCartStore();
  const { products } = useProductStore();

  const categoryProducts = products.filter((p) => p.categoryId === activeCategory);

  const getItemQuantity = (productId: string) =>
    items.find((i) => i.productId === productId)?.quantity ?? 0;

  const handleAddOrIncrement = (product: (typeof products)[0]) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
    });
  };

  const cartCount = totalItems();

  return (
    <div className="flex flex-col min-h-dvh bg-[#FAFAFA] font-sans selection:bg-brand-500/30">
      {/* ── Stitch Header ── */}
      <header className="sticky top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-zinc-200/50 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex justify-between items-center px-4 py-3 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="text-brand-500 text-3xl drop-shadow-sm scale-95 transition-transform active:scale-90">
            🍽️
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg lg:text-xl font-bold text-zinc-900 tracking-tight leading-none">
              Lezzet Durağı
            </h1>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
              <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-500">
                Masa {tableNumber} • QR Sipariş
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Header Cart Button */}
          <button
            onClick={openCart}
            className="relative p-2 rounded-full hover:bg-zinc-100 transition-colors text-brand-500 scale-95 active:scale-90"
          >
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white font-bold text-[10px] w-5 h-5 flex items-center justify-center rounded-full animate-bounce-in shadow-lg shadow-red-500/40 border-2 border-white">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ── Action Buttons Row ── */}
      <div className="px-4 lg:px-8 pt-4 pb-2 flex gap-3 max-w-lg mx-auto lg:max-w-7xl w-full">
        <ServiceRequestButton tableNumber={Number(tableNumber)} type="WAITER" />
        <ServiceRequestButton tableNumber={Number(tableNumber)} type="BILL" />
      </div>

      {/* ── Stitch Category Nav (Sticky below header) ── */}
      <div className="sticky top-[72px] z-40 bg-[#FAFAFA]/95 backdrop-blur-md pt-4 pb-3 border-b border-zinc-200/60 shadow-sm">
        <div className="flex overflow-x-auto scrollbar-hide px-4 lg:px-8 gap-3 lg:max-w-7xl lg:mx-auto">
          {MOCK_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "flex-shrink-0 flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm transition-all active:scale-95 duration-200 border whitespace-nowrap",
                  isActive
                    ? "bg-brand-500 text-white border-transparent shadow-[0_0_15px_rgba(255,140,0,0.3)]"
                    : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50"
                )}
              >
                <span>{cat.emoji}</span>
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main Content Canvas ── */}
      <main className="px-4 lg:px-8 pt-6 flex flex-col gap-4 max-w-lg mx-auto lg:max-w-7xl w-full lg:grid lg:grid-cols-2 xl:grid-cols-3 pb-36">
        {categoryProducts.map((product) => {
          const qty = getItemQuantity(product.id);
          return (
            <StitchProductCard
              key={product.id}
              product={product}
              quantity={qty}
              onAdd={() => handleAddOrIncrement(product)}
              onIncrement={() => handleAddOrIncrement(product)}
              onDecrement={() => updateQuantity(product.id, qty - 1)}
            />
          );
        })}
      </main>

      {/* ── Stitch Floating View Cart Action Bar ── */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 w-full z-50 px-4 pb-6 pt-4 bg-gradient-to-t from-[#FAFAFA] via-[#FAFAFA]/90 to-transparent pointer-events-none animate-slide-up">
          <button
            onClick={openCart}
            className="w-full max-w-lg mx-auto bg-zinc-900/95 backdrop-blur-2xl border border-white/10 text-white flex items-center justify-between px-5 py-4 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.25)] pointer-events-auto transition-transform active:scale-95 duration-200"
          >
            <div className="flex items-center gap-3">
              <div className="bg-brand-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-[13px] shadow-inner">
                {cartCount}
              </div>
              <span className="font-semibold text-white tracking-wide text-sm lg:text-base">
                Sepeti Görüntüle
              </span>
            </div>
            <span className="font-bold text-brand-400 text-base lg:text-lg drop-shadow-sm">
              {formatPrice(totalPrice())}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Premium Stitch Product Card ────────────────────────────────────────────────
function StitchProductCard({
  product,
  quantity,
  onAdd,
  onIncrement,
  onDecrement,
}: {
  product: ReturnType<typeof useProductStore.getState>["products"][0];
  quantity: number;
  onAdd: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
}) {
  const [imgError, setImgError] = useState(false);
  const inCart = quantity > 0;

  return (
    <article
      className={cn(
        "bg-white rounded-2xl p-3 flex gap-4 relative overflow-hidden transition-all duration-300",
        !product.isAvailable && "opacity-60 grayscale-[20%] pointer-events-none",
        inCart
          ? "border-brand-500/30 ring-1 ring-brand-500/20 shadow-[0_8px_20px_rgba(249,115,22,0.1)]"
          : "border-zinc-100/80 shadow-[0_8px_20px_rgba(0,0,0,0.03)] border hover:shadow-[0_8px_20px_rgba(230,126,34,0.08)]"
      )}
    >
      {/* "In Cart" Badge Corner */}
      {inCart && (
        <div className="absolute top-0 right-0 bg-brand-500 text-white font-bold text-[9px] uppercase tracking-wider px-2 py-1 rounded-bl-lg z-10 shadow-sm">
          Sepette
        </div>
      )}

      {/* "Sold Out" Overlay */}
      {!product.isAvailable && (
        <div className="absolute inset-0 bg-white/40 z-20 flex items-center justify-center backdrop-blur-[2px]">
          <div className="bg-zinc-900 text-white text-xs font-bold px-4 py-1.5 rounded-full transform -rotate-12 shadow-xl border border-white/20 tracking-wide">
            Tükendi
          </div>
        </div>
      )}

      {/* Image Container */}
      <div className="w-28 h-28 lg:w-32 lg:h-32 flex-shrink-0 rounded-xl overflow-hidden bg-zinc-100 relative shadow-inner">
        {product.imageUrl && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl bg-orange-50/50">
            🍽️
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="flex flex-col flex-grow justify-between py-0.5">
        <div>
          <div className="flex justify-between items-start pr-1">
            <h2 className="font-bold text-zinc-900 text-[15px] leading-snug line-clamp-2">
              {product.name}
            </h2>
            {/* Rating Pill */}
            {!inCart && (
              <div className="flex items-center gap-0.5 bg-zinc-50 px-1.5 py-0.5 rounded-md border border-zinc-100 flex-shrink-0 ml-2">
                <span className="text-[10px] font-bold text-zinc-700">4.8</span>
                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
              </div>
            )}
          </div>
          <p className="text-[12px] text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & Action Row */}
        <div className="flex justify-between items-end mt-3">
          <div className="flex flex-col">
            <div className="flex items-center text-zinc-400 text-[10px] mb-0.5 font-medium">
              <Clock className="w-3 h-3 mr-1 opacity-70" /> ~15 dk
            </div>
            <span
              className={cn(
                "font-bold text-base",
                !product.isAvailable ? "text-zinc-400 line-through" : "text-brand-600"
              )}
            >
              {formatPrice(product.price)}
            </span>
          </div>

          {/* Action Button */}
          {product.isAvailable && (
            <>
              {inCart ? (
                /* Segmented Control for Quantity */
                <div className="flex items-center bg-zinc-100 rounded-full overflow-hidden border border-zinc-200/50 shadow-inner">
                  <button
                    onClick={onDecrement}
                    className="w-8 h-8 flex items-center justify-center text-zinc-600 hover:bg-zinc-200 transition-colors active:bg-zinc-300"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[13px] text-zinc-900 w-6 text-center font-bold">
                    {quantity}
                  </span>
                  <button
                    onClick={onIncrement}
                    className="w-8 h-8 flex items-center justify-center text-brand-600 hover:bg-brand-50 transition-colors active:bg-brand-100"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                /* Add Button */
                <button
                  onClick={onAdd}
                  className="bg-brand-50 text-brand-600 border border-brand-100 px-4 py-2 rounded-full font-bold text-[13px] flex items-center gap-1 transition-all active:scale-95 hover:bg-brand-100 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Ekle
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </article>
  );
}

// ─── Service Request Button ──────────────────────────────────────────────────
import { HandPlatter, CreditCard, CheckCircle2 } from "lucide-react";

function ServiceRequestButton({
  tableNumber,
  type,
}: {
  tableNumber: number;
  type: "WAITER" | "BILL";
}) {
  const [isRequested, setIsRequested] = useState(false);
  const Icon = type === "WAITER" ? HandPlatter : CreditCard;
  const label = type === "WAITER" ? "Garson Çağır" : "Hesap İste";
  const successLabel = type === "WAITER" ? "Garson Geliyor" : "Hesap İletildi";

  const handleRequest = async () => {
    if (isRequested) return;
    
    // Lazy load store to avoid potential cyclic dep or hydration issues
    const { useOrderStore } = await import("@/store/order.store");
    useOrderStore.getState().requestService(tableNumber, type);
    
    setIsRequested(true);
    // Reset back after 10s so they can call again if needed
    setTimeout(() => setIsRequested(false), 10000);
  };

  return (
    <button
      onClick={handleRequest}
      disabled={isRequested}
      className={cn(
        "flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 duration-200 border",
        isRequested
          ? "bg-green-50 text-green-600 border-green-200 cursor-default"
          : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50 shadow-sm"
      )}
    >
      {isRequested ? (
        <>
          <CheckCircle2 className="w-4 h-4" />
          {successLabel}
        </>
      ) : (
        <>
          <Icon className={cn("w-4 h-4", type === "WAITER" ? "text-brand-500" : "text-blue-500")} />
          {label}
        </>
      )}
    </button>
  );
}
