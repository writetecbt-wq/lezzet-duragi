"use client";

import { useState, useEffect } from "react";
import {
  ShoppingBag,
  Minus,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Menu as MenuIcon
} from "lucide-react";
import { useCartStore } from "@/store/cart.store";
import { useProductStore } from "@/store/product.store";
import { useTableStore } from "@/store/table.store";
import { useOrderStore } from "@/store/order.store";
import { formatPrice, MOCK_CATEGORIES } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { CustomerOrderWidget } from "./CustomerOrderWidget";
import { ProductDetailModal } from "./ProductDetailModal";
import { Product } from "@/store/product.store";

type MenuClientProps = {
  tableNumber: string;
};

export function MenuClient({ tableNumber }: MenuClientProps) {
  const [activeCategory, setActiveCategory] = useState(MOCK_CATEGORIES[0].id);
  const [isMounted, setIsMounted] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { products, fetchProductsAndCategories, categories, isLoading } = useProductStore();
  const { listenToOrders, orders } = useOrderStore();

  useEffect(() => {
    fetchProductsAndCategories().then(() => {
      setIsMounted(true);
    });
    const unsub = listenToOrders();
    return () => unsub();
  }, [fetchProductsAndCategories, listenToOrders]);

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

  const activeProducts = products.filter((p) => p.categoryId === activeCategory);
  const activeCategoryData = categories.find((c) => c.id === activeCategory) || MOCK_CATEGORIES.find((c) => c.id === activeCategory);

  const cartCount = isMounted ? totalItems() : 0;
  const currentTotal = isMounted ? totalPrice() : 0;

  return (
    <div className="flex flex-col min-h-dvh bg-background text-on-surface font-body-md overflow-x-hidden pb-32">
      {/* ── TopAppBar ── */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-crystal flex justify-between items-center px-container-margin py-6 w-full shadow-[0_4px_30px_rgba(0,0,0,0.03)] border-b border-surface-container-high/50">
        <div className="flex items-center gap-6">
          <button className="hover:opacity-80 transition-opacity active:scale-95 transition-transform duration-200 lg:hidden text-primary">
            <MenuIcon className="w-6 h-6" />
          </button>
          <h1 className="font-display text-2xl md:text-3xl tracking-[0.2em] text-primary uppercase select-none">Epicurean</h1>
        </div>
        <div className="hidden md:flex items-center gap-10">
          <nav className="flex items-center gap-8">
            <ServiceRequestButton tableNumber={tableNum} type="WAITER" />
            <ServiceRequestButton tableNumber={tableNum} type="BILL" />
          </nav>
          <div className="h-4 w-[1px] bg-outline-variant/30"></div>
          <button onClick={openCart} className="hover:opacity-80 transition-opacity flex items-center gap-2 group">
            <div className="relative">
              <ShoppingBag className="text-primary w-6 h-6 group-hover:scale-105 transition-transform" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-secondary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="font-label-caps text-xs tracking-widest text-primary hidden lg:inline-block">({cartCount})</span>
          </button>
        </div>
        {/* Mobile Nav Icons */}
        <div className="md:hidden flex items-center gap-4">
          <button onClick={openCart} className="hover:opacity-80 transition-opacity flex items-center gap-2">
            <div className="relative">
              <ShoppingBag className="text-primary w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-secondary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-md">
                  {cartCount}
                </span>
              )}
            </div>
          </button>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="pt-32 pb-24 max-w-[1400px] mx-auto px-container-margin w-full">
        
        <div className="md:hidden flex gap-4 w-full mb-8 animate-fade-in-up">
          <ServiceRequestButton tableNumber={tableNum} type="WAITER" />
          <ServiceRequestButton tableNumber={tableNum} type="BILL" />
        </div>

        {/* ── Category Nav ── */}
        <section className="mb-stack-gap-lg overflow-x-auto hide-scrollbar">
          <div className="flex items-center justify-start md:justify-center gap-4 py-4 min-w-max">
            {(categories.length > 0 ? categories : MOCK_CATEGORIES).map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "px-8 py-3 rounded-full font-label-caps text-xs tracking-widest transition-all shadow-sm",
                    isActive
                      ? "bg-secondary text-white shadow-md hover:opacity-90 scale-105"
                      : "bg-surface-container-low text-on-surface hover:bg-surface-container-high"
                  )}
                >
                  {cat.name.toUpperCase()}
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Product Grid ── */}
        <section className="animate-fade-in-up" key={activeCategory}>
          {activeProducts.length === 0 ? (
            <p className="text-center text-on-surface-variant py-20 font-light text-lg">Bu kategoride ürün bulunamadı.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {activeProducts.map((product) => {
                const qty = getItemQuantity(product.id);
                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    quantity={qty}
                    onAdd={() => handleAddOrIncrement(product)}
                    onIncrement={() => handleAddOrIncrement(product)}
                    onDecrement={() => updateQuantity(product.id, qty - 1)}
                    onClick={() => setSelectedProduct(product as Product)}
                  />
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Floating Bottom Cart Preview (Desktop & Mobile FAB) */}
      {cartCount > 0 && (
        <div 
          onClick={openCart}
          className="fixed bottom-6 right-6 md:bottom-10 md:right-10 bg-on-surface text-surface px-6 md:px-8 py-3 md:py-4 rounded-full shadow-2xl flex items-center gap-4 cursor-pointer hover:scale-105 transition-transform duration-300 z-40 animate-slide-up"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 md:w-6 md:h-6" />
            <span className="absolute -top-2 -right-2 bg-secondary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
              {cartCount}
            </span>
          </div>
          <span className="font-label-caps text-[10px] md:text-xs tracking-widest hidden sm:inline-block">SİPARİŞİ GÖR</span>
          <div className="w-[1px] h-4 bg-surface-variant/30 hidden sm:block"></div>
          <span className="font-price-lg text-sm md:text-[16px] text-surface">{formatPrice(currentTotal)}</span>
        </div>
      )}

      {isMounted && <CustomerOrderWidget tableNumber={tableNum} orders={orders} />}

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={(product, qtyToAdd) => {
            const existingQty = getItemQuantity(product.id);
            if (existingQty === 0) {
                handleAddOrIncrement(product);
                if (qtyToAdd > 1) {
                  updateQuantity(product.id, qtyToAdd);
                }
            } else {
                updateQuantity(product.id, existingQty + qtyToAdd);
            }
          }}
        />
      )}

    </div>
  );
}

// ─── Product Card ─────────────────────────
function ProductCard({
  product,
  quantity,
  onAdd,
  onIncrement,
  onDecrement,
  onClick,
}: {
  product: ReturnType<typeof useProductStore.getState>["products"][0];
  quantity: number;
  onAdd: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
  onClick?: () => void;
}) {
  const [imgError, setImgError] = useState(false);
  const inCart = quantity > 0;

  return (
    <article onClick={onClick} className={cn("group bg-white rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-surface-container hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] transition-all duration-500 flex flex-col h-full cursor-pointer", !product.isAvailable && "opacity-50 grayscale pointer-events-none")}>
      <div className="relative aspect-square overflow-hidden rounded-xl mb-6 bg-surface-container-low">
        {inCart && (
          <div className="absolute top-3 left-3 z-20">
            <span className="bg-background/90 text-primary font-label-caps text-[10px] tracking-widest uppercase px-3 py-1.5 backdrop-blur-sm shadow-sm rounded-full border border-primary/20">
              {quantity} Adet Eklendi
            </span>
          </div>
        )}
        {!product.isAvailable && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <span className="text-white font-label-caps tracking-[0.2em] uppercase">Tükendi</span>
          </div>
        )}
        {product.imageUrl && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl opacity-50 transition-transform duration-700 group-hover:scale-105">🍽️</div>
        )}
        
        {product.isAvailable && (
          inCart ? (
            <div className="absolute bottom-4 right-4 bg-background text-primary rounded-full shadow-xl flex items-center overflow-hidden border border-primary/20 z-10 transition-all duration-300">
              <button onClick={(e) => { e.stopPropagation(); onDecrement(); }} className="w-10 h-10 flex items-center justify-center hover:bg-surface-container-low active:bg-surface-container-high transition-colors">
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-label-caps text-xs font-bold w-4 text-center select-none">{quantity}</span>
              <button onClick={(e) => { e.stopPropagation(); onIncrement(); }} className="w-10 h-10 flex items-center justify-center hover:bg-surface-container-low active:bg-surface-container-high transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button onClick={(e) => { e.stopPropagation(); onAdd(); }} className="absolute bottom-4 right-4 bg-secondary text-white w-12 h-12 flex items-center justify-center rounded-full opacity-0 lg:group-hover:opacity-100 lg:translate-y-2 lg:group-hover:translate-y-0 opacity-100 translate-y-0 transition-all duration-300 shadow-xl hover:scale-105 active:scale-95 z-10">
              <Plus className="w-6 h-6" />
            </button>
          )
        )}
      </div>

      <div className="flex flex-col flex-1">
        <div className="flex justify-between items-start gap-4 mb-2">
          <h3 className="font-headline-md text-lg md:text-xl text-on-surface line-clamp-2 leading-tight">
            {product.name}
          </h3>
          <span className="font-price-lg text-lg text-secondary whitespace-nowrap">
            {formatPrice(product.price)}
          </span>
        </div>
        <p className="font-body-md text-sm text-on-surface-variant leading-relaxed line-clamp-3 mb-4 flex-1">
          {product.description}
        </p>
        <ProductTags tags={product.tags} />
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
        "font-label-caps text-[10px] md:text-[11px] tracking-widest uppercase transition-all duration-300 active:scale-95 py-2 px-4 rounded-full border shadow-sm w-full md:w-auto",
        isRequested
          ? "border-secondary bg-secondary/10 text-secondary"
          : "border-outline text-on-surface-variant hover:border-primary hover:text-primary bg-surface-container-lowest"
      )}
    >
      {isRequested ? (
        <span className="flex items-center justify-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          {successLabel}
        </span>
      ) : (
        <span className="flex items-center justify-center w-full">{label}</span>
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
      <h1 className="font-display text-3xl text-on-surface tracking-tight mb-4">
        Geçersiz Masa
      </h1>
      <p className="font-body-md leading-relaxed text-on-surface-variant max-w-xs font-light">
        &ldquo;Masa {tableNumber}&rdquo; bu restoranda mevcut değil.
        <br />
        Lütfen masa üzerindeki doğru QR kodu okutun.
      </p>
      <div className="mt-6 px-5 py-3 border border-outline rounded-sm flex items-center gap-3">
        <span className="text-secondary font-bold">{totalTables}</span>
        <p className="text-sm text-on-surface-variant">
          Bu restoranda <span className="font-semibold text-on-surface">{totalTables} masa</span> bulunuyor.
        </p>
      </div>
    </div>
  );
}

// ─── Product Tags (Allergens & Diets) ─────────────────────────────────────────
function ProductTags({ tags }: { tags?: string[] }) {
  if (!tags || tags.length === 0) return null;

  const tagConfig: Record<string, { label: string; icon: string; color: string }> = {
    "vegan": { label: "Vegan", icon: "🌱", color: "text-green-700 bg-green-50 border-green-200" },
    "vegetarian": { label: "Vejetaryen", icon: "🌿", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
    "gluten-free": { label: "Glutensiz", icon: "🌾", color: "text-amber-700 bg-amber-50 border-amber-200" },
    "contains-dairy": { label: "Süt Ürünü", icon: "🥛", color: "text-blue-700 bg-blue-50 border-blue-200" },
    "contains-nuts": { label: "Kuruyemiş", icon: "🥜", color: "text-orange-700 bg-orange-50 border-orange-200" },
    "spicy": { label: "Acılı", icon: "🌶️", color: "text-red-700 bg-red-50 border-red-200" },
  };

  return (
    <div className="flex flex-wrap gap-2 mt-auto pt-2">
      {tags.map(tag => {
        const config = tagConfig[tag];
        if (!config) return null;
        return (
          <span 
            key={tag} 
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-sm border text-[10px] uppercase tracking-wider font-semibold", 
              config.color
            )}
            title={config.label}
          >
            <span className="text-[11px] leading-none">{config.icon}</span> {config.label}
          </span>
        );
      })}
    </div>
  );
}
