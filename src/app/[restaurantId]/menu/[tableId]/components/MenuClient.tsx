"use client";

import { useState, useEffect } from "react";
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
  const [isMounted, setIsMounted] = useState(false);

  const { products, fetchProductsAndCategories, categories, isLoading } = useProductStore();

  useEffect(() => {
    fetchProductsAndCategories().then(() => {
      setIsMounted(true);
    });
  }, [fetchProductsAndCategories]);

  const { addItem, items, updateQuantity, openCart, totalItems, totalPrice } =
    useCartStore();
  const { totalTables } = useTableStore();

  const tableNum = Number(tableNumber);
  const isValidTable =
    Number.isInteger(tableNum) && tableNum >= 1 && tableNum <= totalTables;

  if (!isValidTable) {
    return (
      <InvalidTablePage tableNumber={tableNumber} totalTables={totalTables} />
    );
  }

  const getItemQuantity = (productId: string) =>
    isMounted ? (items.find((i) => i.productId === productId)?.quantity ?? 0) : 0;

  const handleAddOrIncrement = (product: (typeof products)[0]) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
    });
  };

  // Filter products by active category
  const activeProducts = products.filter((p) => p.categoryId === activeCategory);
  
  // Try to find category from Firebase first, fallback to mock if loading
  const activeCategoryData = categories.find((c) => c.id === activeCategory) || MOCK_CATEGORIES.find((c) => c.id === activeCategory);

  const cartCount = isMounted ? totalItems() : 0;
  const currentTotal = isMounted ? totalPrice() : 0;

  // Decide layout based on category: Yiyecekler uses Horizontal cards, others use Grid
  const isGridStyle = activeCategory === "cat_icecek_001" || activeCategory === "cat_tatli_001";
  
  return (
    <div className="flex flex-col min-h-dvh bg-background text-on-surface font-sans pb-32">
      {/* ── Sticky Header Container ── */}
      <div className="sticky top-0 z-50 flex flex-col w-full shadow-sm">
        {/* ── TopAppBar ── */}
        <header className="glass-crystal border-b border-outline/30 flex justify-between items-center px-6 py-5">
          <div className="flex flex-col items-center mx-auto text-center">
            <h1 className="font-serif text-2xl tracking-widest uppercase text-on-surface">L'Essence</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-1 h-1 bg-primary rounded-full"></span>
              <span className="font-label-caps text-[10px] tracking-[0.2em] uppercase text-on-surface-variant font-sans">
                Table {tableNumber.padStart(2, "0")} • Salon Privé
              </span>
            </div>
          </div>
          <button onClick={openCart} className="absolute right-6 p-2 text-on-surface/80 hover:text-primary transition-colors">
            <div className="relative">
              <ShoppingBag className="font-light text-[24px] w-6 h-6" strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[9px] w-3.5 h-3.5 flex items-center justify-center rounded-full font-bold">
                  {cartCount}
                </span>
              )}
            </div>
          </button>
        </header>

        {/* ── Category Nav ── */}
        <div className="bg-background/95 py-5 border-b border-outline/20">
          <div className="flex overflow-x-auto hide-scrollbar px-6 gap-8 justify-start md:justify-center">
            {(categories.length > 0 ? categories : MOCK_CATEGORIES).map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "flex-shrink-0 pb-1 font-sans font-medium text-xs tracking-widest uppercase transition-all whitespace-nowrap",
                    isActive
                      ? "text-primary border-b border-primary"
                      : "text-on-surface-variant hover:text-on-surface"
                  )}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Garson / Hesap Butonları (Stitch Minimalist) ── */}
      <div className="px-6 pt-6 flex gap-4 max-w-7xl mx-auto w-full animate-fade-in-up">
        <ServiceRequestButton tableNumber={tableNum} type="WAITER" />
        <ServiceRequestButton tableNumber={tableNum} type="BILL" />
      </div>

      {/* ── Main Content ── */}
      <main className="px-6 pt-10 flex flex-col gap-16 max-w-7xl mx-auto w-full">
        <section className="animate-fade-in-up" key={activeCategory} style={{ animationDelay: "0.1s" }}>
          <div className="flex flex-col items-center mb-10 text-center">
            <span className="font-serif italic text-primary text-sm mb-2">
              {activeCategory === "cat_yiyecek_001" ? "Münhasır Deneyim" : "Özel Seçimler"}
            </span>
            <h2 className="font-serif text-2xl tracking-tight text-on-surface">
              {activeCategoryData?.name || "Menü"}
            </h2>
            <div className="w-12 h-px bg-primary/30 mt-4"></div>
          </div>
          
          {activeProducts.length === 0 ? (
            <p className="text-center text-on-surface-variant py-10 font-light">Bu kategoride ürün bulunamadı.</p>
          ) : isGridStyle ? (
            <div className="grid grid-cols-2 gap-x-6 gap-y-12">
              {activeProducts.map((product) => {
                const qty = getItemQuantity(product.id);
                return (
                  <GridProductCard
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
          ) : (
            <div className="flex flex-col gap-12">
              {activeProducts.map((product) => {
                const qty = getItemQuantity(product.id);
                return (
                  <HorizontalProductCard
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

      {/* Floating Cart Action Bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 w-full z-50 px-6 pb-8 pt-4 bg-gradient-to-t from-background via-background/90 to-transparent pointer-events-none">
          <button
            onClick={openCart}
            className="w-full max-w-xl mx-auto glass-dark-luxury text-white flex items-center justify-between px-8 py-5 rounded-sm shadow-2xl pointer-events-auto active:scale-[0.98] transition-transform duration-300"
          >
            <div className="flex items-center gap-4">
              <div className="bg-primary/20 text-primary w-6 h-6 rounded-full flex items-center justify-center font-sans text-[11px] font-bold">
                {cartCount}
              </div>
              <span className="font-sans text-[11px] font-bold tracking-[0.25em] uppercase">Sipariş Detayları</span>
            </div>
            <span className="font-sans text-sm font-light text-primary tracking-tighter" id="cart-total-price">
              {formatPrice(currentTotal)}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Big Horizontal Product Card (For Main Dishes) ─────────────────────────
function HorizontalProductCard({
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
    <article className={cn("group flex flex-col gap-4 relative", !product.isAvailable && "opacity-50 grayscale pointer-events-none")}>
      <div className="relative aspect-[16/9] overflow-hidden rounded-sm bg-outline/20 img-zoom-hover">
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
            className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-transform duration-700"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl bg-outline/10">🍽️</div>
        )}
      </div>

      <div className="flex justify-between items-baseline gap-4">
        <div className="flex flex-col gap-1 max-w-[75%] md:max-w-[80%]">
          <h3 className="font-serif text-xl text-on-surface tracking-tight leading-snug">
            {product.name}
          </h3>
          <p className="font-sans text-[13px] leading-relaxed text-on-surface-variant font-light">
            {product.description}
          </p>
        </div>

        <div className="flex flex-col items-end gap-3 flex-shrink-0">
          <span className="font-sans text-sm font-medium tracking-tighter text-on-surface">
            {formatPrice(product.price)}
          </span>
          {product.isAvailable && (
            inCart ? (
              <div className="flex items-center border border-outline rounded-full px-1 py-1">
                <button onClick={onDecrement} className="w-6 h-6 flex items-center justify-center text-on-surface-variant hover:text-on-surface">
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-sans text-xs font-bold w-5 text-center select-none">{quantity}</span>
                <button onClick={onIncrement} className="w-6 h-6 flex items-center justify-center text-primary">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button onClick={onAdd} className="mt-1 w-8 h-8 rounded-full border border-outline flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all duration-500">
                <Plus className="w-4 h-4" />
              </button>
            )
          )}
        </div>
      </div>
    </article>
  );
}

// ─── Small Grid Product Card (For Drinks/Desserts) ─────────────────────────
function GridProductCard({
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
    <article className={cn("flex flex-col gap-3 relative", !product.isAvailable && "opacity-50 grayscale pointer-events-none")}>
      <div className="aspect-square overflow-hidden rounded-sm bg-outline/10 img-zoom-hover relative">
        {inCart && (
          <div className="absolute top-2 left-2 z-10">
            <span className="bg-primary/90 text-white font-sans text-[8px] tracking-[0.2em] uppercase px-2 py-1 backdrop-blur-sm shadow-sm">
              {quantity} Adet
            </span>
          </div>
        )}
        {product.imageUrl && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl bg-outline/10">🥤</div>
        )}
      </div>

      <div className="flex flex-col gap-2 flex-grow">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-serif text-md text-on-surface leading-tight line-clamp-2">
            {product.name}
          </h3>
          <span className="font-sans text-xs text-on-surface font-medium shrink-0">
            {formatPrice(product.price)}
          </span>
        </div>
        
        <div className="mt-auto">
          {!product.isAvailable ? (
            <span className="font-sans text-[10px] uppercase tracking-widest text-on-surface-variant">Tükendi</span>
          ) : (
            inCart ? (
              <div className="flex items-center justify-between border border-primary text-primary py-1 px-2 mt-1">
                <button onClick={onDecrement} className="p-1 active:scale-95"><Minus className="w-3 h-3" /></button>
                <span className="font-sans text-[10px] font-bold select-none">{quantity}</span>
                <button onClick={onIncrement} className="p-1 active:scale-95"><Plus className="w-3 h-3" /></button>
              </div>
            ) : (
              <button
                onClick={onAdd}
                className="mt-1 w-full border border-outline py-2 text-[10px] uppercase tracking-[0.2em] text-on-surface-variant hover:border-primary hover:text-primary transition-colors duration-300"
              >
                Ekle
              </button>
            )
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
  const successLabel = type === "WAITER" ? "Garson Geliyor" : "Hesap İletildi";

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
          Bu restoranda <span className="font-semibold text-on-surface">{totalTables} masa</span> bulunuyor.
        </p>
      </div>
    </div>
  );
}
