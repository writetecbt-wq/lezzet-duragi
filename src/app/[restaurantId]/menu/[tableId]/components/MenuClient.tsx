"use client";

import { useState } from "react";
import {
  ShoppingCart,
  Minus,
  Plus,
  Star,
  Clock,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { useCartStore } from "@/store/cart.store";
import { useProductStore, PRODUCT_TAG_META } from "@/store/product.store";
import { useTableStore } from "@/store/table.store";
import { formatPrice, MOCK_CATEGORIES } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type MenuClientProps = {
  tableNumber: string;
};

export function MenuClient({ tableNumber }: MenuClientProps) {
  const [activeCategory, setActiveCategory] = useState(MOCK_CATEGORIES[0].id);
  const { addItem, items, updateQuantity, openCart, totalItems, totalPrice } =
    useCartStore();
  const { products } = useProductStore();
  const { totalTables } = useTableStore();

  // ── Masa Doğrulama ──
  const tableNum = Number(tableNumber);
  const isValidTable =
    Number.isInteger(tableNum) && tableNum >= 1 && tableNum <= totalTables;

  if (!isValidTable) {
    return (
      <InvalidTablePage tableNumber={tableNumber} totalTables={totalTables} />
    );
  }

  const categoryProducts = products.filter(
    (p) => p.categoryId === activeCategory && p.isAvailable
  );
  const allCategoryProducts = products.filter(
    (p) => p.categoryId === activeCategory
  );

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
    <div className="flex flex-col min-h-dvh bg-[#FAFAFA] font-sans">
      {/* ── Header ── */}
      <header className="sticky top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-zinc-200/60 shadow-sm flex justify-between items-center px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🍽️</span>
          <div>
            <h1 className="text-base font-bold text-zinc-900 leading-tight">
              Lezzet Durağı
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-semibold tracking-widest uppercase text-zinc-400">
                Masa {tableNumber} • QR Sipariş
              </span>
            </div>
          </div>
        </div>

        {/* Cart button */}
        <button
          onClick={openCart}
          className="relative p-3 rounded-2xl bg-zinc-100 active:bg-zinc-200 transition-colors"
        >
          <ShoppingCart className="w-5 h-5 text-zinc-700" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-orange-500 text-white font-bold text-[10px] w-5 h-5 flex items-center justify-center rounded-full shadow border-2 border-white">
              {cartCount}
            </span>
          )}
        </button>
      </header>

      {/* ── Garson / Hesap Butonları ── */}
      <div className="px-4 pt-4 pb-2 flex gap-3">
        <ServiceRequestButton tableNumber={tableNum} type="WAITER" />
        <ServiceRequestButton tableNumber={tableNum} type="BILL" />
      </div>

      {/* ── Kategori Nav ── */}
      <div className="sticky top-[60px] z-40 bg-[#FAFAFA]/95 backdrop-blur-md border-b border-zinc-200/60">
        <div className="flex overflow-x-auto gap-2 px-4 py-3 scrollbar-hide">
          {MOCK_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all border whitespace-nowrap",
                  isActive
                    ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                    : "bg-white text-zinc-600 border-zinc-200"
                )}
              >
                <span>{cat.emoji}</span>
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Ürün Listesi ── */}
      <main className="flex-1 px-4 pt-4 pb-36 flex flex-col gap-3">
        {allCategoryProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-5xl mb-4">🍽️</div>
            <p className="text-zinc-500 font-medium">Bu kategoride ürün yok</p>
          </div>
        ) : (
          allCategoryProducts.map((product) => {
            const qty = getItemQuantity(product.id);
            return (
              <ProductCard
                key={product.id}
                product={product}
                quantity={qty}
                onAdd={() => handleAddOrIncrement(product)}
                onIncrement={() => handleAddOrIncrement(product)}
                onDecrement={() => updateQuantity(product.id, qty - 1)}
              />
            );
          })
        )}
      </main>

      {/* ── Floating Cart Bar ── */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-3 bg-gradient-to-t from-[#FAFAFA] to-transparent">
          <button
            onClick={openCart}
            className="w-full bg-zinc-900 text-white flex items-center justify-between px-5 py-4 rounded-2xl shadow-xl active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-3">
              <span className="bg-orange-500 text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm">
                {cartCount}
              </span>
              <span className="font-semibold text-sm">Sepeti Görüntüle</span>
            </div>
            <span className="font-bold text-orange-400 text-sm">
              {formatPrice(totalPrice())}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({
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
        "bg-white rounded-2xl overflow-hidden flex gap-3 p-3 border transition-all",
        !product.isAvailable && "opacity-60 pointer-events-none",
        inCart
          ? "border-orange-300 shadow-[0_2px_12px_rgba(249,115,22,0.15)]"
          : "border-zinc-100 shadow-sm"
      )}
    >
      {/* Resim */}
      <div className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-zinc-100 relative">
        {product.imageUrl && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl bg-orange-50">
            🍽️
          </div>
        )}

        {/* Tükendi overlay */}
        {!product.isAvailable && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-[10px] font-bold text-zinc-600 bg-white px-2 py-0.5 rounded-full border border-zinc-200">
              Tükendi
            </span>
          </div>
        )}

        {/* Sepette badge */}
        {inCart && (
          <div className="absolute top-1 left-1 bg-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
            {quantity}x
          </div>
        )}
      </div>

      {/* İçerik */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h2 className="font-bold text-zinc-900 text-[15px] leading-snug line-clamp-1">
              {product.name}
            </h2>
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="text-[11px] font-bold text-zinc-600">4.8</span>
            </div>
          </div>

          <p className="text-[12px] text-zinc-400 mt-0.5 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          {/* Etiketler */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {product.tags.map((tag) => {
                const meta = PRODUCT_TAG_META[tag];
                if (!meta) return null;
                return (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border"
                    style={{
                      color: meta.color,
                      backgroundColor: `${meta.color}18`,
                      borderColor: `${meta.color}35`,
                    }}
                  >
                    {meta.emoji} {meta.label}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Fiyat + Ekle Butonu */}
        <div className="flex items-center justify-between mt-2">
          <div>
            <div className="flex items-center gap-1 text-zinc-400 text-[10px] mb-0.5">
              <Clock className="w-3 h-3" /> ~15 dk
            </div>
            <span
              className={cn(
                "font-bold text-base",
                product.isAvailable ? "text-orange-500" : "text-zinc-400 line-through"
              )}
            >
              {formatPrice(product.price)}
            </span>
          </div>

          {product.isAvailable && (
            <>
              {inCart ? (
                /* Miktar kontrolü — büyük touch target */
                <div className="flex items-center gap-1 bg-zinc-100 rounded-full">
                  <button
                    onClick={onDecrement}
                    className="w-9 h-9 flex items-center justify-center text-zinc-700 active:bg-zinc-200 rounded-full transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-[14px] font-bold text-zinc-900 w-6 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={onIncrement}
                    className="w-9 h-9 flex items-center justify-center text-orange-500 active:bg-orange-100 rounded-full transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                /* Ekle butonu — yeterince büyük */
                <button
                  onClick={onAdd}
                  className="flex items-center gap-1.5 px-4 py-2 bg-orange-50 border border-orange-200 text-orange-600 rounded-full font-bold text-[13px] active:bg-orange-100 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Ekle
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </article>
  );
}

// ─── Service Request Button ───────────────────────────────────────────────────
function ServiceRequestButton({
  tableNumber,
  type,
}: {
  tableNumber: number;
  type: "WAITER" | "BILL";
}) {
  const [isRequested, setIsRequested] = useState(false);
  const label = type === "WAITER" ? "🙋 Garson Çağır" : "💳 Hesap İste";
  const successLabel = type === "WAITER" ? "Garson Geliyor..." : "Hesap İletildi";

  const handleRequest = async () => {
    if (isRequested) return;
    const { useOrderStore } = await import("@/store/order.store");
    useOrderStore.getState().requestService(tableNumber, type);
    setIsRequested(true);
    setTimeout(() => setIsRequested(false), 10000);
  };

  return (
    <button
      onClick={handleRequest}
      disabled={isRequested}
      className={cn(
        "flex-1 py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 border transition-all active:scale-95",
        isRequested
          ? "bg-green-50 text-green-600 border-green-200"
          : "bg-white text-zinc-700 border-zinc-200 shadow-sm"
      )}
    >
      {isRequested ? (
        <>
          <CheckCircle2 className="w-4 h-4" />
          {successLabel}
        </>
      ) : (
        label
      )}
    </button>
  );
}

// ─── Invalid Table Page ───────────────────────────────────────────────────────
function InvalidTablePage({
  tableNumber,
  totalTables,
}: {
  tableNumber: string;
  totalTables: number;
}) {
  return (
    <div className="min-h-dvh bg-[#FAFAFA] flex flex-col items-center justify-center px-6 text-center">
      <div className="w-24 h-24 rounded-3xl bg-red-50 border-2 border-red-100 flex items-center justify-center mb-6">
        <AlertTriangle className="w-12 h-12 text-red-400" />
      </div>
      <h1 className="text-2xl font-black text-zinc-900 tracking-tight mb-2">
        Geçersiz Masa
      </h1>
      <p className="text-zinc-500 text-base leading-relaxed max-w-xs">
        {`"Masa ${tableNumber}"`} bu restoranda mevcut değil.
        <br />
        Lütfen masa üzerindeki doğru QR kodu okutun.
      </p>
      <div className="mt-6 px-5 py-3 bg-white border border-zinc-200 rounded-2xl shadow-sm flex items-center gap-3">
        <span className="text-orange-500 font-black text-sm w-8 h-8 bg-orange-50 rounded-xl flex items-center justify-center">
          {totalTables}
        </span>
        <p className="text-sm text-zinc-600">
          Bu restoranda{" "}
          <span className="font-bold text-zinc-900">{totalTables} masa</span>{" "}
          bulunuyor.
        </p>
      </div>
      <div className="mt-12 flex items-center gap-2 text-zinc-400">
        <span className="text-2xl">🍽️</span>
        <span className="font-bold text-zinc-600">Lezzet Durağı</span>
      </div>
    </div>
  );
}
