"use client";

import { useState } from "react";
import {
  ShoppingBag,
  Minus,
  Plus,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { useCartStore } from "@/store/cart.store";
import { useProductStore, PRODUCT_TAG_META } from "@/store/product.store";
import { useTableStore } from "@/store/table.store";
import { useOrderStore } from "@/store/order.store";
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
    <div className="flex flex-col min-h-dvh bg-background text-on-surface font-sans pb-36">

      {/* ── TopAppBar (Stitch Fine Dining) ── */}
      <header className="fixed top-0 w-full z-50 glass-crystal border-b border-outline/30 flex justify-between items-center px-6 py-5">
        <div className="flex flex-col items-center mx-auto text-center">
          <h1 className="font-serif text-2xl tracking-widest uppercase text-on-surface">
            Lezzet Durağı
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-1 h-1 bg-primary rounded-full" />
            <span className="text-[10px] font-sans tracking-[0.2em] uppercase text-on-surface-variant">
              Masa {tableNumber.padStart(2, "0")} • Salon
            </span>
          </div>
        </div>

        {/* Sepet butonu — büyük touch target */}
        <button
          onClick={openCart}
          className="absolute right-4 p-3 text-on-surface/80 active:text-primary transition-colors"
        >
          <div className="relative">
            <ShoppingBag className="w-6 h-6" strokeWidth={1.5} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold shadow">
                {cartCount}
              </span>
            )}
          </div>
        </button>
      </header>

      {/* ── Kategori Nav ── */}
      <div className="sticky top-[73px] z-40 bg-background py-5 border-b border-outline/20 mt-[73px]">
        <div className="flex overflow-x-auto hide-scrollbar px-6 gap-8">
          {MOCK_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "flex-shrink-0 pb-1 font-sans font-medium text-xs tracking-widest uppercase transition-all whitespace-nowrap py-2",
                  isActive
                    ? "text-primary border-b border-primary"
                    : "text-on-surface-variant"
                )}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Garson / Hesap Butonları ── */}
      <div className="px-6 pt-6 flex gap-4 max-w-2xl mx-auto w-full">
        <ServiceRequestButton tableNumber={tableNum} type="WAITER" />
        <ServiceRequestButton tableNumber={tableNum} type="BILL" />
      </div>

      {/* ── Ürün Listesi ── */}
      <main className="px-6 pt-8 flex flex-col gap-16 max-w-2xl mx-auto w-full">
        <section className="animate-fade-in-up">
          {/* Kategori başlığı */}
          <div className="flex flex-col items-center mb-10 text-center">
            <span className="font-serif italic text-primary text-sm mb-2">
              Münhasır Seçkiler
            </span>
            <h2 className="font-serif text-2xl tracking-tight text-on-surface">
              {MOCK_CATEGORIES.find((c) => c.id === activeCategory)?.name}
            </h2>
            <div className="w-12 h-px bg-primary/30 mt-4" />
          </div>

          {categoryProducts.length === 0 ? (
            <p className="text-center text-on-surface-variant text-sm py-12">
              Bu kategoride ürün bulunamadı.
            </p>
          ) : (
            <div className="flex flex-col gap-12">
              {categoryProducts.map((product) => {
                const qty = getItemQuantity(product.id);
                return (
                  <FineDiningProductCard
                    key={product.id}
                    product={product}
                    quantity={qty}
                    onAdd={() => handleAddOrIncrement(product)}
                    onIncrement={() => handleAddOrIncrement(product)}
                    onDecrement={() => updateQuantity(product.id, qty - 1)}
                  />
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* ── Floating Cart Bar — MOBILE FIXED ── */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 w-full z-50">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-transparent pointer-events-none" />
          
          <div className="relative px-6 pb-8 pt-4 max-w-2xl mx-auto">
            <button
              onClick={openCart}
              className="w-full glass-dark-luxury text-white flex items-center justify-between px-8 py-5 rounded-sm luxury-shadow active:scale-[0.98] transition-transform duration-200"
            >
              <div className="flex items-center gap-4">
                <div className="bg-primary/20 text-primary w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold">
                  {cartCount}
                </div>
                <span className="text-[11px] font-bold tracking-[0.25em] uppercase">
                  Sipariş Detayları
                </span>
              </div>
              <span className="text-sm font-light text-primary tracking-tighter">
                {formatPrice(totalPrice())}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Fine Dining Product Card (Stitch tasarımından birebir) ─────────────────
function FineDiningProductCard({
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
        "group flex flex-col gap-4 relative",
        !product.isAvailable && "opacity-50 grayscale pointer-events-none"
      )}
    >
      {/* Resim */}
      <div className="relative aspect-[16/9] overflow-hidden rounded-sm bg-outline/20">
        {inCart && (
          <div className="absolute top-4 left-4 z-10">
            <span className="bg-primary/90 text-white font-sans text-[9px] tracking-[0.2em] uppercase px-3 py-1.5 backdrop-blur-sm shadow-sm">
              Seçildi
            </span>
          </div>
        )}
        {!product.isAvailable && (
          <div className="absolute top-4 right-4 z-10">
            <span className="bg-accent-dark/90 text-white font-sans text-[9px] tracking-[0.2em] uppercase px-3 py-1.5 backdrop-blur-sm">
              Tükendi
            </span>
          </div>
        )}
        {product.imageUrl && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 md:hover:scale-[1.03]"
            onError={() => setImgError(true)}
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl bg-outline/10">
            🍽️
          </div>
        )}
      </div>

      {/* İçerik */}
      <div className="flex justify-between items-baseline gap-4">
        <div className="flex flex-col gap-1.5 max-w-[75%]">
          <h3 className="font-serif text-xl text-on-surface tracking-tight leading-snug">
            {product.name}
          </h3>
          <p className="font-sans text-[13px] leading-relaxed text-on-surface-variant font-light line-clamp-3">
            {product.description}
          </p>

          {/* Etiketler */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-1">
              {product.tags.map((tag) => {
                const meta = PRODUCT_TAG_META[tag];
                if (!meta) return null;
                return (
                  <span
                    key={tag}
                    className="font-sans text-[10px] tracking-widest uppercase"
                    style={{ color: meta.color }}
                  >
                    {meta.emoji} {meta.label}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-3 flex-shrink-0">
          <span className="font-sans text-sm font-medium tracking-tighter text-on-surface">
            {formatPrice(product.price)}
          </span>

          {product.isAvailable && (
            <>
              {inCart ? (
                /* Miktar kontrolü — min 44px touch target */
                <div className="flex items-center border border-outline rounded-full">
                  <button
                    onClick={onDecrement}
                    className="w-11 h-11 flex items-center justify-center text-on-surface-variant active:text-on-surface"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-sans text-xs font-bold w-6 text-center select-none">
                    {quantity}
                  </span>
                  <button
                    onClick={onIncrement}
                    className="w-11 h-11 flex items-center justify-center text-primary active:text-primary/70"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                /* Ekle butonu — min 44px touch target */
                <button
                  onClick={onAdd}
                  className="w-11 h-11 rounded-full border border-outline flex items-center justify-center text-primary active:bg-primary active:text-white transition-colors duration-200"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </article>
  );
}

// ─── Service Request Button ───────────────────────────────────────────────
function ServiceRequestButton({
  tableNumber,
  type,
}: {
  tableNumber: number;
  type: "WAITER" | "BILL";
}) {
  const [isRequested, setIsRequested] = useState(false);
  const label = type === "WAITER" ? "Garson Çağır" : "Hesap İste";
  const successLabel =
    type === "WAITER" ? "Garson Geliyor" : "Hesap İletildi";

  // async import kaldırıldı — doğrudan module-level import kullanılıyor
  const handleRequest = () => {
    if (isRequested) return;
    useOrderStore.getState().requestService(tableNumber, type);
    setIsRequested(true);
    setTimeout(() => setIsRequested(false), 10000);
  };

  return (
    <button
      onClick={handleRequest}
      disabled={isRequested}
      className={cn(
        "flex-1 min-h-[48px] px-4 font-sans text-[11px] tracking-[0.15em] uppercase flex items-center justify-center gap-2 transition-all duration-300 border-b active:scale-95",
        isRequested
          ? "border-primary text-primary"
          : "border-outline text-on-surface-variant active:text-on-surface active:border-on-surface"
      )}
    >
      {isRequested ? (
        <>
          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{successLabel}</span>
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
    <div className="min-h-dvh bg-background flex flex-col items-center justify-center px-6 text-center">
      <div className="w-20 h-20 rounded-full border border-outline flex items-center justify-center mb-8">
        <AlertTriangle className="w-8 h-8 text-on-surface-variant" />
      </div>
      <h1 className="font-serif text-3xl text-on-surface tracking-tight mb-4">
        Geçersiz Masa
      </h1>
      <p className="font-sans text-sm leading-relaxed text-on-surface-variant max-w-xs font-light">
        &ldquo;Masa {tableNumber}&rdquo; bu restoranda mevcut değil.
        <br />
        Lütfen masa üzerindeki doğru QR kodu okutun.
      </p>
      <div className="mt-6 px-5 py-3 border border-outline rounded-sm flex items-center gap-3">
        <span className="text-primary font-bold">{totalTables}</span>
        <p className="text-sm text-on-surface-variant">
          Bu restoranda{" "}
          <span className="font-semibold text-on-surface">{totalTables} masa</span>{" "}
          bulunuyor.
        </p>
      </div>
    </div>
  );
}
