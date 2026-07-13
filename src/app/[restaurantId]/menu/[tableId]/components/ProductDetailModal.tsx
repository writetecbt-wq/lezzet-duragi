"use client";

import { useState, useEffect } from "react";
import { X, Plus, Minus, Info } from "lucide-react";
import { Product, PRODUCT_TAG_META } from "@/store/product.store";
import { cn } from "@/lib/utils";

type Props = {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
};

export function ProductDetailModal({ product, onClose, onAddToCart }: Props) {
  const [quantity, setQuantity] = useState(1);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Small delay to allow CSS transitions to trigger
    const t = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for transition
  };

  const handleAdd = () => {
    onAddToCart(product, quantity);
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-10 backdrop-blur-md bg-surface/60 overflow-hidden">
      {/* Background layer for click-to-close */}
      <div className="absolute inset-0 z-0" onClick={handleClose} />
      
      {/* Modal Canvas */}
      <main
        className={cn(
          "relative z-10 w-full max-w-6xl h-full md:max-h-[85vh] bg-surface-container-lowest md:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-16 md:translate-y-0 md:scale-95"
        )}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          aria-label="Kapat"
          className="absolute top-4 right-4 md:top-6 md:right-6 z-[110] p-2 bg-black/20 md:bg-surface-variant/50 rounded-full hover:bg-black/40 md:hover:bg-surface-variant transition-colors text-white md:text-on-surface backdrop-blur-sm"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Removed global blurred background image */}

        {/* Left Side: Product Image & Nutrition Overlay */}
        <section className="w-full md:w-1/2 h-[45vh] md:h-full relative border-b md:border-b-0 md:border-r border-outline-variant/20 flex-shrink-0 bg-surface-container-highest z-10 overflow-hidden group">
          {product.imageUrl ? (
            <div className="absolute inset-0">
              {/* Actual Product Image */}
              <img 
                src={product.imageUrl} 
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Subtle gradient overlay to ensure text/chart readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-surface-variant">
              <span className="text-6xl opacity-20">🍽️</span>
            </div>
          )}

          {/* Nutrition Chart Overlaid on Bottom-Left */}
          <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 z-20 flex flex-col items-start">
            {product.nutrition ? (
              <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col items-center">
                <span className="font-display text-xs tracking-[0.2em] text-white/70 uppercase font-bold mb-4">Besin Değeri</span>
                <div className="relative w-32 h-32 md:w-40 md:h-40 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" className="stroke-white/10" strokeWidth="8" />
                    <circle cx="50" cy="50" r="45" fill="none" className="stroke-[#C5A059]" strokeWidth="8" strokeDasharray={`${product.nutrition.carbs} 283`} strokeDashoffset="0" />
                    <circle cx="50" cy="50" r="35" fill="none" className="stroke-white" strokeWidth="8" strokeDasharray={`${product.nutrition.protein} 220`} strokeDashoffset="0" />
                    <circle cx="50" cy="50" r="25" fill="none" className="stroke-zinc-500" strokeWidth="8" strokeDasharray={`${product.nutrition.fat} 157`} strokeDashoffset="0" />
                  </svg>
                  
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="font-display text-3xl md:text-4xl font-bold text-white leading-none">{product.nutrition.calories}</span>
                    <span className="text-[10px] tracking-widest text-white/70 mt-1 font-bold">KCAL</span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        {/* Right Side: Content Column */}
        <section className="w-full md:w-1/2 h-full overflow-y-auto flex flex-col flex-1 pb-[100px] md:pb-0 bg-surface-container-lowest scrollbar-hide z-10 relative">
          <div className="p-6 md:p-10 flex flex-col flex-1">
            {/* Header */}
            <header className="space-y-4 mb-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2 md:gap-4">
                <h1 className="font-display text-3xl md:text-4xl font-bold text-on-surface leading-tight">
                  {product.name}
                </h1>
                <span className="font-display text-2xl font-bold text-accent-gold whitespace-nowrap">
                  {product.price.toLocaleString("tr-TR")} ₺
                </span>
              </div>
              {product.description && (
                <p className="text-base md:text-lg text-on-surface-variant max-w-md leading-relaxed">
                  {product.description}
                </p>
              )}
            </header>

            {/* Nutrition Grid */}
            {product.nutrition && (
              <div className="bg-surface/50 rounded-2xl p-4 mb-6 border border-outline-variant/20 backdrop-blur-md">
                <h3 className="text-xs font-bold text-on-surface-variant tracking-widest uppercase mb-3">Besin Değerleri</h3>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="flex flex-col">
                    <span className="font-display text-xl font-bold text-on-surface">{product.nutrition.calories}</span>
                    <span className="text-[10px] tracking-wider text-on-surface-variant">KCAL</span>
                  </div>
                  <div className="flex flex-col border-l border-outline-variant/20">
                    <span className="font-display text-xl font-bold text-on-surface">{product.nutrition.protein}g</span>
                    <span className="text-[10px] tracking-wider text-on-surface-variant">PROTEİN</span>
                  </div>
                  <div className="flex flex-col border-l border-outline-variant/20">
                    <span className="font-display text-xl font-bold text-on-surface">{product.nutrition.fat}g</span>
                    <span className="text-[10px] tracking-wider text-on-surface-variant">YAĞ</span>
                  </div>
                  <div className="flex flex-col border-l border-outline-variant/20">
                    <span className="font-display text-xl font-bold text-[#C5A059]">{product.nutrition.carbs}g</span>
                    <span className="text-[10px] tracking-wider text-on-surface-variant">KARB</span>
                  </div>
                </div>
              </div>
            )}

            {/* Ingredients List */}
            {product.ingredients && product.ingredients.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs font-bold text-on-surface-variant tracking-widest uppercase mb-3">İçindekiler</h3>
                <ul className="space-y-2">
                  {product.ingredients.map((ing, i) => (
                    <li key={i} className="flex justify-between items-center text-sm border-b border-outline-variant/10 pb-2">
                      <span className="text-on-surface font-medium">{ing.name}</span>
                      {ing.amount && <span className="text-on-surface-variant text-xs">{ing.amount}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tags (Dietary & Allergens) */}
            {product.tags && product.tags.length > 0 && (
              <article className="space-y-4 mb-8">
                <h2 className="text-xs font-bold text-secondary tracking-widest uppercase">
                  Özellikler & Alerjenler
                </h2>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => {
                    const meta = PRODUCT_TAG_META[tag];
                    if (!meta) return null;
                    return (
                      <div
                        key={tag}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-outline-variant/30 bg-surface-container-low"
                      >
                        <span className="text-base">{meta.emoji}</span>
                        <span className="text-xs font-semibold text-on-surface">
                          {meta.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </article>
            )}

            {/* Health Notice */}
            <div className="mt-auto pt-8 hidden md:flex items-start gap-3 p-5 rounded-2xl bg-secondary/5 border border-secondary/10">
              <Info className="text-secondary w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-[13px] md:text-sm leading-relaxed text-on-surface-variant">
                Menümüzde yer alan ürünlerin içerikleri ve alerjen bilgileri konusunda özel bir diyet gereksiniminiz varsa, lütfen sipariş vermeden önce personelimize danışınız.
              </p>
            </div>
          </div>

          {/* Fixed Bottom CTA for both Mobile & Desktop */}
          <footer className="fixed md:sticky bottom-0 left-0 w-full bg-surface-container-lowest/80 backdrop-blur-xl px-6 md:px-10 py-4 md:py-6 border-t border-outline-variant/20 z-50 flex-shrink-0 mt-auto">
            <div className="flex items-center gap-3 md:gap-4 max-w-md md:max-w-none mx-auto">
              {/* Quantity Selector */}
              <div className="flex items-center bg-surface-container-high rounded-full px-2 md:px-4 py-2 h-[56px] md:h-[64px] border border-outline-variant/20 shadow-sm flex-shrink-0">
                <button
                  className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-on-surface hover:bg-surface-variant/50 rounded-full active:scale-90 transition-all disabled:opacity-30"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="w-8 md:w-12 text-center font-display font-bold text-lg md:text-xl text-on-surface select-none">
                  {quantity}
                </span>
                <button
                  className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-on-surface hover:bg-surface-variant/50 rounded-full active:scale-90 transition-all"
                  onClick={() => setQuantity((q) => q + 1)}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAdd}
                className="flex-1 bg-[var(--color-accent-gold)] hover:brightness-95 text-white font-display font-bold text-base md:text-lg h-[56px] md:h-[64px] px-4 rounded-full shadow-[0_8px_20px_rgba(197,160,89,0.25)] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
              >
                <span>Sepete Ekle</span>
                <span className="opacity-50 hidden md:inline">•</span>
                <span>{(product.price * quantity).toLocaleString("tr-TR")} ₺</span>
              </button>
            </div>
          </footer>
        </section>
      </main>
    </div>
  );
}
